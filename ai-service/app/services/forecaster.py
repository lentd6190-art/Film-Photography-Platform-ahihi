from datetime import datetime, timezone
from typing import List, Tuple
import numpy as np
import pandas as pd
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from app.models.schemas import (
    ForecastRequest, ForecastResponse, ForecastDataPoint,
    ForecastEvaluation, ForecastGranularity, HistoricalBookingItem
)

VALID_BOOKING_STATUSES = {"CONFIRMED", "COMPLETED"}


def preprocess_booking_data(
    raw_records: List[dict],
    granularity: ForecastGranularity
) -> Tuple[pd.Series, dict]:
    """Làm sạch, lọc đơn hủy, khử trùng lặp và điền 0 cho kỳ không có booking."""
    valid_items = []
    invalid_count = 0

    for item in raw_records:
        try:
            valid_items.append(HistoricalBookingItem(**item).model_dump())
        except Exception:
            invalid_count += 1

    if not valid_items:
        return pd.Series(dtype=float), {
            "total_raw": len(raw_records),
            "dropped_invalid": invalid_count,
            "duplicates_removed": 0,
            "cancelled_filtered": 0,
            "valid_used": 0
        }

    df = pd.DataFrame(valid_items)
    before_dedup = len(df)
    df = df.drop_duplicates(subset=["booking_id"])
    duplicates_removed = before_dedup - len(df)

    before_status = len(df)
    df = df[df["status"].str.upper().isin(VALID_BOOKING_STATUSES)]
    cancelled_filtered = before_status - len(df)

    # Loại bỏ ngày hiện tại chưa kết thúc (incomplete period)
    df["booking_date"] = pd.to_datetime(df["booking_date"])
    today = pd.Timestamp.now().normalize()
    df = df[df["booking_date"] < today]

    if df.empty:
        return pd.Series(dtype=float), {
            "total_raw": len(raw_records),
            "dropped_invalid": invalid_count,
            "duplicates_removed": int(duplicates_removed),
            "cancelled_filtered": int(cancelled_filtered),
            "valid_used": 0
        }

    freq_map = {
        ForecastGranularity.DAILY: "D",
        ForecastGranularity.WEEKLY: "W-MON",
        ForecastGranularity.MONTHLY: "MS"
    }
    freq = freq_map[granularity]

    ts = df.groupby(pd.Grouper(key="booking_date", freq=freq))["booking_id"].count()
    full_idx = pd.date_range(start=ts.index.min(), end=ts.index.max(), freq=freq)
    ts = ts.reindex(full_idx, fill_value=0)

    stats = {
        "total_raw": len(raw_records),
        "dropped_invalid": invalid_count,
        "duplicates_removed": int(duplicates_removed),
        "cancelled_filtered": int(cancelled_filtered),
        "valid_used": int(len(df))
    }
    return ts, stats


def build_demand_forecast(
    req: ForecastRequest,
    raw_records: List[dict],
    last_refresh: datetime
) -> ForecastResponse:
    ts, prep_stats = preprocess_booking_data(raw_records, req.granularity)
    n_obs = len(ts)
    warnings = []

    now_utc = datetime.now(timezone.utc)
    if last_refresh.tzinfo is None:
        last_refresh = last_refresh.replace(tzinfo=timezone.utc)

    # Cảnh báo nếu dữ liệu đồng bộ quá 48h
    if (now_utc - last_refresh).total_seconds() > 48 * 3600:
        warnings.append("STALE_ANALYTICS_DATA: Dữ liệu analytics đã cũ hơn 48 giờ.")

    freq_map = {
        ForecastGranularity.DAILY: "D",
        ForecastGranularity.WEEKLY: "W-MON",
        ForecastGranularity.MONTHLY: "MS"
    }
    freq = freq_map[req.granularity]
    last_date = ts.index.max() if n_obs > 0 else pd.Timestamp.now().normalize()
    future_dates = pd.date_range(
        start=last_date + pd.tseries.frequencies.to_offset(freq),
        periods=req.horizon,
        freq=freq
    )

    if n_obs >= 14:
        model_used = "HoltWinters_ExponentialSmoothing"
        reliability = "HIGH" if n_obs >= 28 else "MEDIUM"
        seasonal_periods = 7 if req.granularity == ForecastGranularity.DAILY else 4
        has_seasonality = n_obs >= seasonal_periods * 2

        model = ExponentialSmoothing(
            ts,
            trend="add",
            seasonal="add" if has_seasonality else None,
            seasonal_periods=seasonal_periods if has_seasonality else None
        ).fit(optimized=True)

        preds = np.maximum(0, model.forecast(req.horizon).values)
        resid_std = float(np.std(model.resid))
        lower = np.maximum(0, preds - 1.28 * resid_std)
        upper = preds + 1.28 * resid_std

        # Đánh giá trên 20% dữ liệu cuối so với Baseline (Seasonal Naive)
        val_len = max(1, int(n_obs * 0.2))
        val_actual = ts.values[-val_len:]
        val_fitted = model.fittedvalues[-val_len:]
        baseline_pred = np.roll(ts.values, seasonal_periods if has_seasonality else 1)[-val_len:]

        model_mae = float(np.mean(np.abs(val_actual - val_fitted)))
        baseline_mae = float(np.mean(np.abs(val_actual - baseline_pred)))
        non_zero = val_actual > 0
        mape = (
            float(np.mean(np.abs((val_actual[non_zero] - val_fitted[non_zero]) / val_actual[non_zero])) * 100)
            if np.any(non_zero)
            else None
        )

    elif n_obs >= 3:
        model_used = "WeightedMovingAverage_Fallback"
        reliability = "MEDIUM"
        warnings.append("LIMITED_HISTORICAL_DATA: Dữ liệu dưới 14 kỳ, áp dụng trung bình trượt có trọng số.")
        weights = np.arange(1, n_obs + 1)
        wma = float(np.dot(ts.values, weights) / weights.sum())
        preds = np.full(req.horizon, max(0.0, wma))
        std = float(np.std(ts.values))
        lower = np.maximum(0, preds - std)
        upper = preds + std
        model_mae, baseline_mae, mape = None, None, None

    else:
        model_used = "NaiveMean_Fallback"
        reliability = "LOW"
        warnings.append("INSUFFICIENT_HISTORICAL_DATA: Dưới 3 kỳ dữ liệu hợp lệ, trả về giá trị trung bình fallback.")
        avg_val = float(ts.mean()) if n_obs > 0 else 0.0
        preds = np.full(req.horizon, avg_val)
        lower, upper = preds, preds
        model_mae, baseline_mae, mape = None, None, None

    if len(preds) > 1 and preds[-1] > preds[0] * 1.05:
        trend = "INCREASING"
    elif len(preds) > 1 and preds[-1] < preds[0] * 0.95:
        trend = "DECREASING"
    else:
        trend = "STABLE"

    return ForecastResponse(
        resource_category=req.resource_category,
        resource_id=req.resource_id,
        granularity=req.granularity,
        forecast_horizon=req.horizon,
        reliability=reliability,
        warnings=warnings,
        trend_direction=trend,
        historical_series=[
            ForecastDataPoint(period=idx.strftime("%Y-%m-%d"), value=float(val), is_predicted=False)
            for idx, val in ts.items()
        ],
        predictions=[
            ForecastDataPoint(
                period=d.strftime("%Y-%m-%d"),
                value=round(float(p), 2),
                lower_bound=round(float(l), 2),
                upper_bound=round(float(u), 2),
                is_predicted=True
            )
            for d, p, l, u in zip(future_dates, preds, lower, upper)
        ],
        evaluation=ForecastEvaluation(
            model_used=model_used,
            mae=round(model_mae, 3) if model_mae is not None else None,
            mape=round(mape, 2) if mape is not None else None,
            baseline_mae=round(baseline_mae, 3) if baseline_mae is not None else None,
        ),
        metadata={
            "generated_at": now_utc.isoformat(),
            "data_period_start": ts.index.min().strftime("%Y-%m-%d") if n_obs > 0 else None,
            "data_period_end": ts.index.max().strftime("%Y-%m-%d") if n_obs > 0 else None,
            "last_data_refresh": last_refresh.isoformat(),
            "observations_used": n_obs,
            "preprocessing_stats": prep_stats
        }
    )