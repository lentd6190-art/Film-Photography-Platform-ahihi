package com.lentd6190art.fpp.identity.config;

import com.lentd6190art.fpp.identity.entity.Role;
import com.lentd6190art.fpp.identity.entity.User;
import com.lentd6190art.fpp.identity.repository.UserRepository;
import com.lentd6190art.fpp.identity.service.JwtService;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class JwtAuthenticationFilterTest {

    private static final String SECRET = Base64.getEncoder().encodeToString(
            "01234567890123456789012345678901".getBytes(StandardCharsets.UTF_8)
    );

    private JwtService jwtService;
    private UserRepository userRepository;
    private JwtAuthenticationFilter filter;
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(SECRET, 15 * 60 * 1000L);
        userRepository = mock(UserRepository.class);
        filterChain = mock(FilterChain.class);
        filter = new JwtAuthenticationFilter(jwtService, userRepository);

        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilterInternal_shouldAuthenticateActiveUserWithDatabaseRoles()
            throws Exception {

        UUID userId = UUID.randomUUID();
        User user = mock(User.class);
        Role adminRole = mock(Role.class);
        Role providerRole = mock(Role.class);

        when(user.isActive()).thenReturn(true);
        when(user.getRoles()).thenReturn(Set.of(adminRole, providerRole));
        when(adminRole.getName()).thenReturn("ADMINISTRATOR");
        when(providerRole.getName()).thenReturn("ROLE_SERVICE_PROVIDER");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        String token = jwtService.generateAccessToken(
                userId,
                "admin@example.com",
                List.of("PHOTOGRAPHER")
        );

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, filterChain);

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        assertNotNull(authentication);
        assertEquals(userId.toString(), authentication.getPrincipal());
        assertTrue(authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMINISTRATOR")));
        assertTrue(authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_SERVICE_PROVIDER")));

        verify(userRepository).findById(userId);
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_shouldSkipWhenAuthorizationHeaderIsMissing()
            throws Exception {

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verifyNoInteractions(userRepository);
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_shouldRejectWhenUserDoesNotExist()
            throws Exception {

        UUID userId = UUID.randomUUID();

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        String token = jwtService.generateAccessToken(
                userId,
                "missing@example.com",
                List.of("ADMINISTRATOR")
        );

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(userRepository).findById(userId);
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_shouldRejectInactiveUser()
            throws Exception {

        UUID userId = UUID.randomUUID();
        User user = mock(User.class);

        when(user.isActive()).thenReturn(false);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        String token = jwtService.generateAccessToken(
                userId,
                "disabled@example.com",
                List.of("ADMINISTRATOR")
        );

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(userRepository).findById(userId);
        verify(filterChain).doFilter(request, response);
    }
}