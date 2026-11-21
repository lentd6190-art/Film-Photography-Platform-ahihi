package com.fpp.ai.controller;

import com.fpp.ai.dto.DemandForecastingDataBatch;
import com.fpp.ai.dto.AnalyticsIngestResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    @PostMapping("/demand-forecasting")
    public ResponseEntity<AnalyticsIngestResponse> receiveAnalyticsData(@Valid @RequestBody DemandForecastingDataBatch batch) {
        int count = batch.records().size();
        AnalyticsIngestResponse response = new AnalyticsIngestResponse(
            "success",
            batch.batchId(),
            count,
            0,
            "Đã nhận " + count + " bản ghi analytics cho Demand Forecasting (FPP-52)."
        );
        return ResponseEntity.ok(response);
    }
}