// Quản lý Access Token và Refresh Token trong sessionStorage.

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const tokenStorage = {
  // Lưu cả hai token sau khi đăng nhập hoặc refresh thành công.
  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === "undefined") return;

    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  // Lấy Access Token.
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;

    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  },

  // Lấy Refresh Token.
  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;

    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  },

  // Xóa cả hai token khi logout hoặc refresh thất bại.
  clearTokens(): void {
    if (typeof window === "undefined") return;

    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};