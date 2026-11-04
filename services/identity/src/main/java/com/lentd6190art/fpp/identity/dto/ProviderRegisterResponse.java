package com.lentd6190art.fpp.identity.dto;

import com.lentd6190art.fpp.identity.entity.ProviderStatus;

import java.util.UUID;

public record ProviderRegisterResponse(
        UUID userId,
        UUID providerProfileId,
        ProviderStatus status,
        String message
) {
}