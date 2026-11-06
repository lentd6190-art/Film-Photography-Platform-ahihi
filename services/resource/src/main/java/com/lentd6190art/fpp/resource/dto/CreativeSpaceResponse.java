package com.lentd6190art.fpp.resource.dto;

import com.lentd6190art.fpp.resource.model.enums.AvailabilityStatus;
import com.lentd6190art.fpp.resource.model.enums.CreativeSpaceType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record CreativeSpaceResponse(
        UUID id,
        UUID providerId,
        String name,
        String description,
        String address,
        BigDecimal latitude,
        BigDecimal longitude,
        Integer capacity,
        BigDecimal areaSqm,
        BigDecimal hourlyPrice,
        String status,
        CreativeSpaceType spaceType,
        String dimensions,
        String artisticStyle,
        String lighting,
        String ventilation,
        String acoustics,
        List<String> amenities,
        Map<String, Object> operatingHours,
        String policies,
        List<String> images,
        AvailabilityStatus availabilityStatus,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}