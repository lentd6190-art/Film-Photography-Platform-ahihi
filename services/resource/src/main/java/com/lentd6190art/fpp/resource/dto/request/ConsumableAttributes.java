package com.lentd6190art.fpp.resource.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ConsumableAttributes(
    Integer stockQuantity,
    Integer reorderLevel,
    BigDecimal unitPrice,
    String unit,
    LocalDate expiryDate,
    String status
) {
}
