// Cung cấp các hàm gọi API đăng nhập và làm mới token.

import axios from "axios";

import apiClient from "@/lib/axios";

import type {
  AuthTokenResponse,
  LoginRequest,
  RefreshTokenRequest,
} from "@/types/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// Gửi email và password lên Identity API để đăng nhập.
async function login(
  credentials: LoginRequest,
): Promise<AuthTokenResponse> {
  const response = await apiClient.post<AuthTokenResponse>(
    "/api/v1/auth/login",
    credentials,
  );

  return response.data;
}

// Làm mới Access Token bằng Refresh Token.
async function refreshToken(
  request: RefreshTokenRequest,
): Promise<AuthTokenResponse> {
  const response = await axios.post<AuthTokenResponse>(
    `${API_BASE_URL}/api/v1/auth/refresh-token`,
    request,
    {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
    },
  );

  return response.data;
}

export const authService = {
  login,
  refreshToken,
};

export { apiClient };