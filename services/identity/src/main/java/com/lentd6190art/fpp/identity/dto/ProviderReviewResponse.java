
package com.lentd6190art.fpp.identity.dto;

import com.lentd6190art.fpp.identity.entity.ProviderStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ProviderReviewResponse(
        UUID providerProfileId,
        UUID userId,
        String email,
        String fullName,
        String businessName,
        String phone,
        String address,
        String serviceType,
        ProviderStatus status,
        OffsetDateTime createdAt
) {
}
