
package com.lentd6190art.fpp.resource.config;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class JwtAuthenticationFilterTest {

    private JwtService jwtService;
    private JwtAuthenticationFilter filter;
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        jwtService = mock(JwtService.class);
        filter = new JwtAuthenticationFilter(jwtService);
        filterChain = mock(FilterChain.class);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilterInternal_shouldKeepUserIdAsPrincipalAndExtractProviderId()
            throws Exception {

        UUID userId = UUID.randomUUID();
        UUID providerId = UUID.randomUUID();

        Claims claims = mock(Claims.class);

        when(jwtService.parseToken("valid-token"))
                .thenReturn(claims);
        when(claims.getSubject())
                .thenReturn(userId.toString());
        when(claims.get("roles"))
                .thenReturn(List.of("SERVICE_PROVIDER"));
        when(claims.get("providerId"))
                .thenReturn(providerId.toString());

        doFilter("valid-token");

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        assertNotNull(authentication);
        assertEquals(userId.toString(), authentication.getPrincipal());

        assertInstanceOf(
                ProviderAuthenticationDetails.class,
                authentication.getDetails()
        );

        ProviderAuthenticationDetails details =
                (ProviderAuthenticationDetails) authentication.getDetails();

        assertEquals(providerId, details.providerId());

        assertTrue(authentication.getAuthorities().contains(
                new SimpleGrantedAuthority("ROLE_SERVICE_PROVIDER")
        ));
    }

    @Test
    void doFilterInternal_shouldAuthenticateUserWithoutProviderId()
            throws Exception {

        UUID userId = UUID.randomUUID();

        Claims claims = mock(Claims.class);

        when(jwtService.parseToken("valid-token"))
                .thenReturn(claims);
        when(claims.getSubject())
                .thenReturn(userId.toString());
        when(claims.get("roles"))
                .thenReturn(List.of("CUSTOMER"));

        doFilter("valid-token");

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        assertNotNull(authentication);
        assertEquals(userId.toString(), authentication.getPrincipal());

        ProviderAuthenticationDetails details =
                (ProviderAuthenticationDetails) authentication.getDetails();

        assertNull(details.providerId());
    }

    @Test
    void doFilterInternal_shouldNotCreateProviderIdentityWhenProviderIdIsInvalid()
            throws Exception {

        UUID userId = UUID.randomUUID();

        Claims claims = mock(Claims.class);

        when(jwtService.parseToken("valid-token"))
                .thenReturn(claims);
        when(claims.getSubject())
                .thenReturn(userId.toString());
        when(claims.get("roles"))
                .thenReturn(List.of("SERVICE_PROVIDER"));
        when(claims.get("providerId"))
                .thenReturn("not-a-valid-uuid");

        doFilter("valid-token");

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        assertNotNull(authentication);
        assertEquals(userId.toString(), authentication.getPrincipal());

        ProviderAuthenticationDetails details =
                (ProviderAuthenticationDetails) authentication.getDetails();

        assertNull(details.providerId());
    }

    @Test
    void doFilterInternal_shouldClearSecurityContextWhenTokenIsInvalid()
            throws Exception {

        when(jwtService.parseToken("invalid-token"))
                .thenThrow(new RuntimeException("Invalid token"));

        doFilter("invalid-token");

        assertNull(
                SecurityContextHolder.getContext().getAuthentication()
        );
    }

    private void doFilter(String token) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);

        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }
}
