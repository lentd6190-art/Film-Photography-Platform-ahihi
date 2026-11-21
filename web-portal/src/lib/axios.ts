
// Cấu hình Axios, tự động gắn Access Token và làm mới token khi nhận lỗi 401.

import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

import { tokenStorage } from "@/lib/auth/token-storage";
import { refreshAccessToken } from "@/lib/auth/refresh-token";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

function isAuthEndpoint(url?: string): boolean {
  if (!url) return false;

  return (
    url.includes("/api/v1/auth/login") ||
    url.includes("/api/v1/auth/refresh-token")
  );
}

// Tự động gắn Access Token vào request cần xác thực.
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (isAuthEndpoint(config.url)) {
      return config;
    }

    const accessToken = tokenStorage.getAccessToken();

    if (accessToken) {
      config.headers.set("Authorization", `Bearer ${accessToken}`);
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Xử lý lỗi 401 và thử lại request sau khi refresh token.
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest =
      error.config as RetryableRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
      tokenStorage.clearTokens();

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:logout"));
      }

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const tokenResponse = await refreshAccessToken({
        refreshToken,
      });

      originalRequest.headers.set(
        "Authorization",
        `Bearer ${tokenResponse.accessToken}`,
      );

      return apiClient(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);

export default apiClient;
