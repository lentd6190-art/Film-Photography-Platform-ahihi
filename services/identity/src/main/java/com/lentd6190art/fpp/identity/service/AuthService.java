
package com.lentd6190art.fpp.identity.service;

import com.lentd6190art.fpp.identity.dto.LoginRequest;
import com.lentd6190art.fpp.identity.dto.LoginResponse;
import com.lentd6190art.fpp.identity.dto.RegisterRequest;
import com.lentd6190art.fpp.identity.entity.User;
import com.lentd6190art.fpp.identity.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.lentd6190art.fpp.identity.entity.Role;
import com.lentd6190art.fpp.identity.repository.RoleRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final RoleRepository roleRepository;
        public AuthService(
                UserRepository userRepository,
                RoleRepository roleRepository,
                PasswordEncoder passwordEncoder,
                JwtService jwtService,
                RefreshTokenService refreshTokenService
        ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        }
        @Transactional
        public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
                throw new IllegalArgumentException("Email already exists");
        }

        Role photographerRole = roleRepository
                .findByName("PHOTOGRAPHER")
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Default PHOTOGRAPHER role not found"
                        )
                );
        User user = new User();
        user.setEmail(request.email());
        user.setFullName(request.fullName());
        user.setPasswordHash(
                passwordEncoder.encode(request.password())
        );
        user.getRoles().add(photographerRole);

        userRepository.save(user);
        }
    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid email or password"
                        )
                );
        if (!passwordEncoder.matches(
                request.password(),
                user.getPasswordHash()
        )) {
            throw new IllegalArgumentException(
                    "Invalid email or password"
            );
        }

        if (!user.isActive()) {
            throw new IllegalArgumentException("Account is disabled");
        }
        String accessToken = jwtService.generateAccessToken(
                user.getId(),
                user.getEmail()
        );
        String refreshToken = refreshTokenService.create(user);

        return new LoginResponse(
                accessToken,
                "Bearer",
                900,
                refreshToken
        );
    }
}
