import statistics
from app.models.schemas import (
    PricingRecommendationRequest,
    PricingRecommendationResponse,
    PricingIndicators,
)

class DynamicPricingEngine:
    MIN_HISTORICAL_RECORDS = 5
    HIGH_DEMAND_RATIO = 1.20
    LOW_DEMAND_RATIO = 0.80
    HIGH_UTILIZATION = 0.80
    LOW_UTILIZATION = 0.35
    MAX_INCREASE_PCT = 0.25
    MAX_DECREASE_PCT = 0.20

    def generate_recommendation(
        self, req: PricingRecommendationRequest
    ) -> PricingRecommendationResponse:
        history = req.historical_data or []
        utilization = req.resource_utilization if req.resource_utilization is not None else 0.0

        # 1. Xử lý trường hợp thiếu dữ liệu lịch sử
        if len(history) < self.MIN_HISTORICAL_RECORDS:
            safe_price = round(max(req.min_price, min(req.max_price, req.current_price)), 2)
            adj_amount = round(safe_price - req.current_price, 2)
            adj_pct = round((adj_amount / req.current_price) * 100, 2)

            return PricingRecommendationResponse(
                resource_id=req.resource_id,
                resource_name=req.resource_name,
                resource_category=req.resource_category,
                time_period=req.time_period,
                current_price=req.current_price,
                recommended_price=safe_price,
                recommended_adjustment_amount=adj_amount,
                recommended_adjustment_pct=adj_pct,
                indicators=PricingIndicators(
                    utilization_rate=round(utilization, 4),
                    historical_avg_demand=0.0,
                    historical_avg_price=req.current_price,
                    effective_demand=float(req.forecasted_demand or req.current_demand or 0),
                    demand_ratio=1.0,
                    demand_level="INSUFFICIENT_DATA",
                    forecast_used=req.forecasted_demand is not None,
                ),
                recommendation_reason=(
                    f"Insufficient historical booking data ({len(history)} records, "
                    f"minimum {self.MIN_HISTORICAL_RECORDS} required). "
                    "Maintaining current price within configured boundaries."
                ),
                auto_applied=False,
            )

        # 2. Tính trung bình lịch sử & nhu cầu hiệu dụng (ưu tiên Forecasted Demand từ FPP-52)
        hist_avg_demand = statistics.mean(item.demand_count for item in history)
        hist_avg_price = statistics.mean(item.price for item in history)

        forecast_used = req.forecasted_demand is not None
        effective_demand = (
            req.forecasted_demand
            if forecast_used
            else float(req.current_demand if req.current_demand is not None else hist_avg_demand)
        )
        demand_ratio = effective_demand / hist_avg_demand if hist_avg_demand > 0 else 1.0

        # 3. Đánh giá mức điều chỉnh dựa trên Demand & Resource Utilization
        adj_factor = 0.0
        reasons = []

        if demand_ratio >= self.HIGH_DEMAND_RATIO or utilization >= self.HIGH_UTILIZATION:
            demand_level = "HIGH"
            demand_boost = min(0.15, max(0.0, (demand_ratio - 1.0) * 0.25))
            util_boost = 0.10 if utilization >= self.HIGH_UTILIZATION else 0.0
            adj_factor = min(self.MAX_INCREASE_PCT, demand_boost + util_boost)

            if demand_ratio >= self.HIGH_DEMAND_RATIO:
                label = "Forecasted" if forecast_used else "Current"
                reasons.append(
                    f"{label} demand ({effective_demand:.1f}) is {demand_ratio:.2f}x "
                    f"higher than historical average ({hist_avg_demand:.1f})."
                )
            if utilization >= self.HIGH_UTILIZATION:
                reasons.append(f"High resource utilization at {utilization * 100:.0f}%.")

        elif demand_ratio <= self.LOW_DEMAND_RATIO or utilization <= self.LOW_UTILIZATION:
            demand_level = "LOW"
            demand_drop = min(0.12, max(0.0, (1.0 - demand_ratio) * 0.25))
            util_drop = 0.08 if utilization <= self.LOW_UTILIZATION else 0.0
            adj_factor = -min(self.MAX_DECREASE_PCT, demand_drop + util_drop)

            if demand_ratio <= self.LOW_DEMAND_RATIO:
                label = "Forecasted" if forecast_used else "Current"
                reasons.append(
                    f"{label} demand ({effective_demand:.1f}) is below historical average "
                    f"({hist_avg_demand:.1f}, ratio {demand_ratio:.2f}x)."
                )
            if utilization <= self.LOW_UTILIZATION:
                reasons.append(f"Low resource utilization at {utilization * 100:.0f}%.")
        else:
            demand_level = "NORMAL"
            reasons.append(
                f"Demand (ratio {demand_ratio:.2f}x) and utilization ({utilization * 100:.0f}%) "
                f"are within normal range (historical avg price: {hist_avg_price:,.0f})."
            )

        # 4. Áp dụng ràng buộc an toàn (Non-negative, Min & Max bounds)
        raw_recommended = req.current_price * (1.0 + adj_factor)
        final_price = round(max(req.min_price, min(req.max_price, raw_recommended)), 2)

        if final_price != round(raw_recommended, 2):
            reasons.append(
                f"Price clamped to configured boundaries [{req.min_price:,.0f} - {req.max_price:,.0f}]."
            )

        adj_amount = round(final_price - req.current_price, 2)
        adj_pct = round((adj_amount / req.current_price) * 100, 2)

        return PricingRecommendationResponse(
            resource_id=req.resource_id,
            resource_name=req.resource_name,
            resource_category=req.resource_category,
            time_period=req.time_period,
            current_price=req.current_price,
            recommended_price=final_price,
            recommended_adjustment_amount=adj_amount,
            recommended_adjustment_pct=adj_pct,
            indicators=PricingIndicators(
                utilization_rate=round(utilization, 4),
                historical_avg_demand=round(hist_avg_demand, 2),
                historical_avg_price=round(hist_avg_price, 2),
                effective_demand=round(effective_demand, 2),
                demand_ratio=round(demand_ratio, 2),
                demand_level=demand_level,
                forecast_used=forecast_used,
            ),
            recommendation_reason=" ".join(reasons),
            auto_applied=False,
        )