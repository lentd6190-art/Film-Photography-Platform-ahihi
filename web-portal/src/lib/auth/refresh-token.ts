
// Quản lý việc làm mới token dùng chung cho Axios và AuthContext.

import axios from "axios";

import { tokenStorage } from "@/lib/auth/token-storage";
import type {
  AuthTokenResponse,
  RefreshTokenRequest,
} from "@/types/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// Dùng chung một Promise để tránh nhiều luồng refresh đồng thời.
let refreshPromise: Promise<AuthTokenResponse> | null = null;

// Thông báo cho AuthContext khi phiên đăng nhập hết hạn.
function notifySessionExpired(): void {
  tokenStorage.clearTokens();

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth:logout"));
  }
}

async function performRefresh(
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

  const tokenResponse = response.data;

  if (
    !tokenResponse?.accessToken?.trim() ||
    !tokenResponse?.refreshToken?.trim() ||
    tokenResponse.tokenType?.toLowerCase() !== "bearer" ||
    !Number.isFinite(tokenResponse.expiresIn) ||
    tokenResponse.expiresIn <= 0
  ) {
    throw new Error("Phản hồi refresh token từ API không hợp lệ.");
  }

  // Lưu cả hai token vì backend có thể xoay vòng Refresh Token.
  tokenStorage.setTokens(
    tokenResponse.accessToken,
    tokenResponse.refreshToken,
  );

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth:token-refreshed"));
  }

  return tokenResponse;
}

// Làm mới token; các lời gọi đồng thời dùng chung một Promise.
export function refreshAccessToken(
  request: RefreshTokenRequest,
): Promise<AuthTokenResponse> {
  if (!request.refreshToken?.trim()) {
    notifySessionExpired();
    return Promise.reject(new Error("Không có Refresh Token."));
  }

  if (!refreshPromise) {
    refreshPromise = performRefresh(request)
      .catch((error: unknown) => {
        notifySessionExpired();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}
