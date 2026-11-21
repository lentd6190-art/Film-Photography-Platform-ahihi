package com.fpp.ai.dto;

public record AnalyticsIngestResponse(
    String status,
    String batchId,
    int processedCount,
    int invalidRecordsCount,
    String message
) {}