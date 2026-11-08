
// Cung cấp các hàm gọi API xác thực và đăng ký Provider.

import apiClient from "@/lib/axios";
import { refreshAccessToken } from "@/lib/auth/refresh-token";

import type {
  AuthTokenResponse,
  LoginRequest,
  RefreshTokenRequest,
  ProviderRegisterRequest,
  ProviderRegisterResponse,
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

// Gửi thông tin đăng ký Provider lên Identity API.
async function registerProvider(
  data: ProviderRegisterRequest,
): Promise<ProviderRegisterResponse> {
  const response = await apiClient.post<ProviderRegisterResponse>(
    "/api/v1/auth/register/provider",
    data,
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
  registerProvider,
  refreshToken,
};

export { apiClient };
