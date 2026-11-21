package com.fpp.ai.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record BookingAnalyticsRecord(
    @NotBlank String bookingId,
    @NotBlank String userId,
    @NotBlank String serviceType,
    @NotBlank String locationId,
    @NotNull LocalDateTime timestamp,
    @Min(0) Double amount,
    @NotBlank String status
) {}