package com.lentd6190art.fpp.identity.config;

import com.lentd6190art.fpp.identity.controller.RbacTestController;
import com.lentd6190art.fpp.identity.entity.Role;
import com.lentd6190art.fpp.identity.entity.User;
import com.lentd6190art.fpp.identity.repository.UserRepository;
import com.lentd6190art.fpp.identity.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = RbacTestController.class)
@Import({SecurityConfig.class, SecurityConfigTest.JwtTestConfiguration.class})
class SecurityConfigTest {

    private static final String SECRET = Base64.getEncoder().encodeToString(
            "01234567890123456789012345678901".getBytes(StandardCharsets.UTF_8)
    );

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @MockitoBean
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        reset(userRepository);
    }

    @Test
    void adminEndpoint_shouldReturn401_whenTokenIsMissing() throws Exception {
        mockMvc.perform(get("/api/v1/admin/rbac-test"))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(userRepository);
    }

    @Test
    void adminEndpoint_shouldReturn403_whenUserHasWrongRole() throws Exception {
        UUID userId = UUID.randomUUID();
        User user = mock(User.class);
        Role photographerRole = mock(Role.class);

        when(user.isActive()).thenReturn(true);
        when(user.getRoles()).thenReturn(Set.of(photographerRole));
        when(photographerRole.getName()).thenReturn("PHOTOGRAPHER");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        String token = jwtService.generateAccessToken(
                userId,
                "photographer@example.com",
                java.util.List.of("PHOTOGRAPHER")
        );

        mockMvc.perform(get("/api/v1/admin/rbac-test")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());

        verify(userRepository).findById(userId);
    }

    @Test
    void adminEndpoint_shouldReturn200_whenUserIsAdministrator() throws Exception {
        UUID userId = UUID.randomUUID();
        User user = mock(User.class);
        Role adminRole = mock(Role.class);

        when(user.isActive()).thenReturn(true);
        when(user.getRoles()).thenReturn(Set.of(adminRole));
        when(adminRole.getName()).thenReturn("ADMINISTRATOR");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        String token = jwtService.generateAccessToken(
                userId,
                "admin@example.com",
                java.util.List.of("ADMINISTRATOR")
        );

        mockMvc.perform(get("/api/v1/admin/rbac-test")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message")
                        .value("RBAC authorization successful"));

        verify(userRepository).findById(userId);
    }

    @TestConfiguration
    @EnableWebSecurity
    static class JwtTestConfiguration {

        @Bean
        JwtService jwtService() {
            return new JwtService(SECRET, 15 * 60 * 1000L);
        }
    }
}
