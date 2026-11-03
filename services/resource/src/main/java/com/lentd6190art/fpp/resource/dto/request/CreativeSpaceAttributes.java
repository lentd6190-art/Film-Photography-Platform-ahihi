package com.lentd6190art.fpp.resource.dto.request;

import java.math.BigDecimal;

public record CreativeSpaceAttributes(
    String address,
    BigDecimal latitude,
    BigDecimal longitude,
    Integer capacity,
    BigDecimal areaSqm,
    BigDecimal hourlyPrice,
    String status
) {
}
