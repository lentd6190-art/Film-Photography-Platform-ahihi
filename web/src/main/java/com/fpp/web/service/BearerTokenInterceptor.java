
package com.fpp.web.service;

import java.io.IOException;

import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@Component
public class BearerTokenInterceptor
        implements ClientHttpRequestInterceptor {

    private final TokenService tokenService;
    private final HttpServletRequest request;

    public BearerTokenInterceptor(
            TokenService tokenService,
            HttpServletRequest request) {
        this.tokenService = tokenService;
        this.request = request;
    }

    @Override
    public ClientHttpResponse intercept(
            HttpRequest httpRequest,
            byte[] body,
            ClientHttpRequestExecution execution)
            throws IOException {

        // Get the current session without creating a new one.
        HttpSession session = request.getSession(false);

        // Do not attach a token when no session exists.
        if (session == null) {
            return execution.execute(httpRequest, body);
        }

        String accessToken = tokenService.getAccessToken(session);

        // Attach the Bearer token only when it is present and non-blank.
        if (accessToken != null && !accessToken.isBlank()) {
            httpRequest.getHeaders().setBearerAuth(accessToken);
        }

        return execution.execute(httpRequest, body);
    }
}
