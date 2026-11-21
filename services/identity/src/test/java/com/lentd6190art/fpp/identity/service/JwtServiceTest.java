package com.lentd6190art.fpp.identity.service;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    private static final String SECRET = Base64.getEncoder().encodeToString(
            "01234567890123456789012345678901".getBytes(StandardCharsets.UTF_8)
    );

    private static final long EXPIRATION = 15 * 60 * 1000L;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(SECRET, EXPIRATION);
    }

    @Test
    void generateAccessToken_shouldContainCorrectClaims() {
        UUID userId = UUID.randomUUID();
        String email = "test@example.com";
        List<String> roles = List.of("ADMINISTRATOR", "SERVICE_PROVIDER");

        String token = jwtService.generateAccessToken(userId, email, roles);
        Claims claims = jwtService.parseToken(token);

        assertEquals(userId.toString(), claims.getSubject());
        assertEquals(email, claims.get("email"));
        assertEquals(roles, claims.get("roles"));
    }

    @Test
    void generateAccessToken_shouldHaveFutureExpiration() {
        String token = jwtService.generateAccessToken(
                UUID.randomUUID(),
                "test@example.com",
                List.of("PHOTOGRAPHER")
        );

        Claims claims = jwtService.parseToken(token);

        assertNotNull(claims.getIssuedAt());
        assertNotNull(claims.getExpiration());
        assertTrue(claims.getExpiration().after(claims.getIssuedAt()));
    }

    @Test
    void isTokenValid_shouldReturnTrueForValidToken() {
        String token = jwtService.generateAccessToken(
                UUID.randomUUID(),
                "test@example.com",
                List.of("ADMINISTRATOR")
        );

        assertTrue(jwtService.isTokenValid(token));
    }

    @Test
    void isTokenValid_shouldReturnFalseForInvalidToken() {
        assertFalse(jwtService.isTokenValid("not-a-valid-jwt"));
    }
}