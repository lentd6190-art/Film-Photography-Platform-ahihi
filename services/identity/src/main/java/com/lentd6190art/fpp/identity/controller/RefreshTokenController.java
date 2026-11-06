
package com.lentd6190art.fpp.identity.controller;

import com.lentd6190art.fpp.identity.dto.RefreshTokenRequest;
import com.lentd6190art.fpp.identity.dto.RefreshTokenResponse;
import com.lentd6190art.fpp.identity.entity.RefreshToken;
import com.lentd6190art.fpp.identity.entity.User;
import com.lentd6190art.fpp.identity.service.JwtService;
import com.lentd6190art.fpp.identity.service.RefreshTokenService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class RefreshTokenController {

    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;
    private final long accessTokenExpiration;

    public RefreshTokenController(
            RefreshTokenService refreshTokenService,
            JwtService jwtService,
            @Value("${app.jwt.access-token-expiration}") long accessTokenExpiration
    ) {
        this.refreshTokenService = refreshTokenService;
        this.jwtService = jwtService;
        this.accessTokenExpiration = accessTokenExpiration;
    }

    @PostMapping("/refresh-token")
    @Transactional
    public ResponseEntity<RefreshTokenResponse> refresh(
            @Valid @RequestBody RefreshTokenRequest request) {

        RefreshToken oldToken =
                refreshTokenService.validate(request.refreshToken());

        User user = oldToken.getUser();

        // Revoke the old token before issuing a replacement.
        refreshTokenService.revoke(oldToken);

        String newRefreshToken = refreshTokenService.create(user);
        String newAccessToken = jwtService.generateAccessToken(
                user.getId(),
                user.getEmail()
        );

        return ResponseEntity.ok(new RefreshTokenResponse(
                newAccessToken,
                "Bearer",
                accessTokenExpiration / 1000,
                newRefreshToken
        ));
    }
}
