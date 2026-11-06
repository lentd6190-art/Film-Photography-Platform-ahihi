package com.lentd6190art.fpp.resource.dto;

import com.lentd6190art.fpp.resource.model.enums.AvailabilityStatus;
import com.lentd6190art.fpp.resource.model.enums.CreativeSpaceType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record CreativeSpaceRequest(

        @NotBlank
        @Size(max = 200)
        String name,

        String description,

        @NotBlank
        @Size(max = 500)
        String address,

        @DecimalMin("-90.0")
        @DecimalMax("90.0")
        BigDecimal latitude,

        @DecimalMin("-180.0")
        @DecimalMax("180.0")
        BigDecimal longitude,

        @NotNull
        @Positive
        Integer capacity,

        @DecimalMin(value = "0.01")
        BigDecimal areaSqm,

        @NotNull
        @DecimalMin(value = "0.0")
        BigDecimal hourlyPrice,

        @NotNull
        CreativeSpaceType spaceType,

        @NotBlank
        @Size(max = 100)
        String dimensions,

        @Size(max = 150)
        String artisticStyle,

        String lighting,

        String ventilation,

        String acoustics,

        List<@NotBlank String> amenities,

        Map<String, Object> operatingHours,

        String policies,

        List<@NotBlank String> images,

        AvailabilityStatus availabilityStatus
) {
}