package com.lentd6190art.fpp.resource.dto.request;

import java.math.BigDecimal;

public record EquipmentAttributes(
    String category,
    String brand,
    String model,
    String equipmentCondition,
    String status,
    BigDecimal rentalPrice
) {
}
