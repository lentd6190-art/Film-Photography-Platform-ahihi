
package com.fpp.web.service;

import org.springframework.stereotype.Service;

import com.fpp.web.security.auth.TokenStore;

import jakarta.servlet.http.HttpSession;

@Service
public class TokenService {

    private static final String TOKEN_SESSION_KEY = "TOKEN_STORE";

    public void saveTokens(
            HttpSession session,
            String accessToken,
            String refreshToken) {

        TokenStore tokenStore = new TokenStore(
                accessToken,
                refreshToken
        );

        session.setAttribute(TOKEN_SESSION_KEY, tokenStore);
    }

    public TokenStore getTokens(HttpSession session) {
        Object value = session.getAttribute(TOKEN_SESSION_KEY);

        if (value instanceof TokenStore tokenStore) {
            return tokenStore;
        }

        return null;
    }

    public String getAccessToken(HttpSession session) {
        TokenStore tokenStore = getTokens(session);

        if (tokenStore == null || !tokenStore.hasAccessToken()) {
            return null;
        }

        return tokenStore.getAccessToken();
    }

    public String getRefreshToken(HttpSession session) {
        TokenStore tokenStore = getTokens(session);

        if (tokenStore == null || !tokenStore.hasRefreshToken()) {
            return null;
        }

        return tokenStore.getRefreshToken();
    }

    public void clearTokens(HttpSession session) {
        TokenStore tokenStore = getTokens(session);

        if (tokenStore != null) {
            tokenStore.clear();
        }

        session.removeAttribute(TOKEN_SESSION_KEY);
    }
}
