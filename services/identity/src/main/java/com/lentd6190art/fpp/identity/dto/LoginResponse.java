package com.lentd6190art.fpp.identity.dto;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        String refreshToken
) {}