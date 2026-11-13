
package com.lentd6190art.fpp.identity.dto;

public record RefreshTokenResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        String refreshToken
) {}
