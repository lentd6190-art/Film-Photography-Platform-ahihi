
package com.lentd6190art.fpp.identity.service;

import com.lentd6190art.fpp.identity.entity.RefreshToken;
import com.lentd6190art.fpp.identity.entity.User;
import com.lentd6190art.fpp.identity.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Base64;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final long expirationMillis;
    private final SecureRandom secureRandom = new SecureRandom();

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            @Value("${app.jwt.refresh-token-expiration}") long expirationMillis
    ) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.expirationMillis = expirationMillis;
    }

    @Transactional
    public String create(User user) {
        byte[] randomBytes = new byte[64];
        secureRandom.nextBytes(randomBytes);

        String rawToken = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);

        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setTokenHash(hash(rawToken));
        token.setExpiresAt(
                OffsetDateTime.now(ZoneOffset.UTC)
                        .plusNanos(expirationMillis * 1_000_000)
        );

        refreshTokenRepository.save(token);
        return rawToken;
    }

    @Transactional
    public RefreshToken validate(String rawToken) {
        RefreshToken token = refreshTokenRepository
                .findByTokenHash(hash(rawToken))
                .orElseThrow(() ->
                        new IllegalArgumentException("Invalid refresh token"));

        if (token.getRevokedAt() != null
                || !token.getExpiresAt().isAfter(OffsetDateTime.now(ZoneOffset.UTC))) {
            throw new IllegalArgumentException(
                    "Refresh token is expired or revoked"
            );
        }

        if (!token.getUser().isActive()) {
            throw new IllegalArgumentException("Account is disabled");
        }

        return token;
    }

    @Transactional
    public void revoke(RefreshToken token) {
        token.setRevokedAt(OffsetDateTime.now(ZoneOffset.UTC));
        refreshTokenRepository.save(token);
    }

    private String hash(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(
                    token.getBytes(StandardCharsets.UTF_8)
            );
            return Base64.getEncoder().encodeToString(hashed);
        } catch (Exception exception) {
            throw new IllegalStateException(
                    "Unable to hash refresh token", exception);
        }
    }
}
