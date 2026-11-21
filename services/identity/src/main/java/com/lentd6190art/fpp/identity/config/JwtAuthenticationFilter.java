package com.lentd6190art.fpp.identity.config;

import com.lentd6190art.fpp.identity.entity.Role;
import com.lentd6190art.fpp.identity.repository.UserRepository;
import com.lentd6190art.fpp.identity.service.JwtService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;
import java.util.UUID;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log =
            LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository
    ) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader == null
                || !authorizationHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authorizationHeader.substring(7);

        try {
            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                Claims claims = jwtService.parseToken(token);
                String userId = claims.getSubject();

                UUID parsedUserId = UUID.fromString(userId);

                var user = userRepository.findById(parsedUserId)
                        .orElseThrow(() ->
                                new IllegalStateException("User not found"));

                if (!user.isActive()) {
                    throw new IllegalStateException("Account is disabled");
                }

                Collection<SimpleGrantedAuthority> authorities =
                        user.getRoles().stream()
                                .map(Role::getName)
                                .map(role -> new SimpleGrantedAuthority(
                                        role.startsWith("ROLE_")
                                                ? role
                                                : "ROLE_" + role
                                ))
                                .toList();

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userId,
                                null,
                                authorities
                        );
                authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );

                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);

                log.debug(
                        "JWT authenticated userId={}, authorities={}",
                        userId,
                        authorities
                );
            }
        } catch (Exception exception) {
            SecurityContextHolder.clearContext();
            log.debug("JWT authentication failed: {}", exception.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
