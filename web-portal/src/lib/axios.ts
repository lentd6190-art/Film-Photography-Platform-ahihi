// Cấu hình Axios, tự động gắn Access Token và làm mới token khi nhận lỗi 401.

import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

import { tokenStorage } from "@/lib/auth/token-storage";
import type { AuthTokenResponse } from "@/types/auth";

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

interface PendingRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let pendingRequests: PendingRequest[] = [];

function isAuthEndpoint(url?: string): boolean {
  if (!url) return false;

  return (
    url.includes("/api/v1/auth/login") ||
    url.includes("/api/v1/auth/refresh-token")
  );
}

// Giải quyết hoặc từ chối các request đang chờ token mới.
function processPendingRequests(
  error: unknown,
  token: string | null = null,
): void {
  pendingRequests.forEach((request) => {
    if (error) {
      request.reject(error);
    } else if (token) {
      request.resolve(token);
    } else {
      request.reject(new Error("Không nhận được Access Token mới."));
    }
  });

  pendingRequests = [];
}

// Xóa phiên và thông báo cho AuthContext.
function notifySessionExpired(): void {
  tokenStorage.clearTokens();

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth:logout"));
  }
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

// Xử lý lỗi 401 và tự động refresh Access Token.
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
      notifySessionExpired();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // Nếu một request khác đang refresh, chờ kết quả để dùng token mới.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({
          resolve: (newAccessToken) => {
            originalRequest.headers.set(
              "Authorization",
              `Bearer ${newAccessToken}`,
            );

            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      // Dùng Axios riêng để tránh gọi lại response interceptor.
      const response = await axios.post<AuthTokenResponse>(
        `${API_BASE_URL}/api/v1/auth/refresh-token`,
        { refreshToken },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        },
      );

      const tokenResponse = response.data;

      if (
        !tokenResponse?.accessToken ||
        !tokenResponse?.refreshToken
      ) {
        throw new Error("API không trả về đầy đủ token mới.");
      }

      // Backend xoay vòng Refresh Token nên phải lưu cả hai token.
      tokenStorage.setTokens(
        tokenResponse.accessToken,
        tokenResponse.refreshToken,
      );

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:token-refreshed"));
      }

      // Cho các request đang chờ sử dụng Access Token mới.
      processPendingRequests(null, tokenResponse.accessToken);

      originalRequest.headers.set(
        "Authorization",
        `Bearer ${tokenResponse.accessToken}`,
      );

      // Thử lại request ban đầu.
      return apiClient(originalRequest);
    } catch (refreshError) {
      processPendingRequests(refreshError);
      notifySessionExpired();

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;