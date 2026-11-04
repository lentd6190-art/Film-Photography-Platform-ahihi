
// Cung cấp các hàm gọi API đăng nhập và làm mới token.

import apiClient from "@/lib/axios";
import { refreshAccessToken } from "@/lib/auth/refresh-token";

import type {
  AuthTokenResponse,
  LoginRequest,
  RefreshTokenRequest,
} from "@/types/auth";

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

// Làm mới token thông qua cơ chế dùng chung.
function refreshToken(
  request: RefreshTokenRequest,
): Promise<AuthTokenResponse> {
  return refreshAccessToken(request);
}

export const authService = {
  login,
  refreshToken,
};

export { apiClient };
