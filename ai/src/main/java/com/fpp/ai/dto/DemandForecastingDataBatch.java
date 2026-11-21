package com.fpp.ai.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.List;

public record DemandForecastingDataBatch(
    @NotBlank String batchId,
    @NotBlank String source,
    LocalDateTime createdAt,
    @NotEmpty @Valid List<BookingAnalyticsRecord> records
) {}