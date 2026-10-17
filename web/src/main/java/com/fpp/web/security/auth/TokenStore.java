
package com.fpp.web.security.auth;

import java.io.Serializable;

public class TokenStore implements Serializable {

    private static final long serialVersionUID = 1L;

    private String accessToken;
    private String refreshToken;

    public TokenStore() {
    }

    public TokenStore(String accessToken, String refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public boolean hasAccessToken() {
        return accessToken != null && !accessToken.isBlank();
    }

    public boolean hasRefreshToken() {
        return refreshToken != null && !refreshToken.isBlank();
    }

    public void clear() {
        accessToken = null;
        refreshToken = null;
    }
}
