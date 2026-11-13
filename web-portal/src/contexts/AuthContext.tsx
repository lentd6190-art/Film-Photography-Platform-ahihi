
"use client";

// Quản lý trạng thái đăng nhập, khôi phục phiên và thông tin người dùng.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { authService } from "@/services/auth.service";
import { refreshAccessToken } from "@/lib/auth/refresh-token";
import { tokenStorage } from "@/lib/auth/token-storage";
import { decodeJwt } from "@/lib/auth/jwt";

import type {
  LoginRequest,
  JwtPayload,
} from "@/types/auth";

interface AuthContextType {
  user: JwtPayload | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

// Kiểm tra Access Token có hợp lệ, có role và còn hạn hay không.
function validateAccessToken(accessToken: string): JwtPayload {
  const decodedUser = decodeJwt(accessToken);

  if (!decodedUser) {
    throw new Error("Access Token không hợp lệ.");
  }

  if (
    typeof decodedUser.exp !== "number" ||
    decodedUser.exp * 1000 <= Date.now()
  ) {
    throw new Error("Access Token đã hết hạn.");
  }

  if (
    !Array.isArray(decodedUser.roles) ||
    decodedUser.roles.length === 0
  ) {
    throw new Error("Tài khoản không có role hợp lệ.");
  }

  return decodedUser;
}

// Kiểm tra API có trả về đầy đủ hai token hay không.
function validateTokenResponse(
  accessToken?: string,
  refreshToken?: string,
): asserts accessToken is string {
  if (
    typeof accessToken !== "string" ||
    !accessToken.trim() ||
    typeof refreshToken !== "string" ||
    !refreshToken.trim()
  ) {
    throw new Error("API không trả về đầy đủ token.");
  }
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Đăng xuất và xóa toàn bộ thông tin xác thực.
  const logout = useCallback(() => {
    tokenStorage.clearTokens();
    setUser(null);
  }, []);

  // Đăng nhập và lưu token sau khi xác thực hợp lệ.
  const login = useCallback(
    async (credentials: LoginRequest): Promise<void> => {
      // Xóa phiên cũ trước khi đăng nhập tài khoản mới.
      tokenStorage.clearTokens();
      setUser(null);

      try {
        const tokenResponse = await authService.login(credentials);

        validateTokenResponse(
          tokenResponse.accessToken,
          tokenResponse.refreshToken,
        );

        const decodedUser = validateAccessToken(
          tokenResponse.accessToken,
        );

        // Chỉ lưu token sau khi kiểm tra thành công.
        tokenStorage.setTokens(
          tokenResponse.accessToken,
          tokenResponse.refreshToken,
        );

        setUser(decodedUser);
      } catch (error) {
        tokenStorage.clearTokens();
        setUser(null);
        throw error;
      }
    },
    [],
  );

  // Khôi phục phiên đăng nhập khi tải lại ứng dụng.
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async (): Promise<void> => {
      try {
        const accessToken = tokenStorage.getAccessToken();
        const refreshToken = tokenStorage.getRefreshToken();

        // Không có đủ hai token thì xem như chưa đăng nhập.
        if (!accessToken || !refreshToken) {
          tokenStorage.clearTokens();
          return;
        }

        // Ưu tiên sử dụng Access Token nếu còn hạn.
        try {
          const decodedUser = validateAccessToken(accessToken);

          if (isMounted) {
            setUser(decodedUser);
          }

          return;
        } catch {
          // Access Token không hợp lệ hoặc hết hạn.
          // Tiếp tục thử khôi phục bằng Refresh Token.
        }

        // Sử dụng chung cơ chế refresh với Axios.
        const tokenResponse = await refreshAccessToken({
          refreshToken,
        });

        validateTokenResponse(
          tokenResponse.accessToken,
          tokenResponse.refreshToken,
        );

        const refreshedUser = validateAccessToken(
          tokenResponse.accessToken,
        );

        if (isMounted) {
          setUser(refreshedUser);
        }
      } catch {
        // Refresh thất bại: xóa phiên đăng nhập.
        tokenStorage.clearTokens();

        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Axios thông báo phiên đăng nhập đã hết hạn.
    const handleSessionExpired = (): void => {
      tokenStorage.clearTokens();

      if (isMounted) {
        setUser(null);
      }
    };

    // Axios thông báo token đã được làm mới thành công.
    const handleTokenRefreshed = (): void => {
      const accessToken = tokenStorage.getAccessToken();

      if (!accessToken) {
        if (isMounted) {
          setUser(null);
        }

        return;
      }

      try {
        const decodedUser = validateAccessToken(accessToken);

        if (isMounted) {
          setUser(decodedUser);
        }
      } catch {
        tokenStorage.clearTokens();

        if (isMounted) {
          setUser(null);
        }
      }
    };

    // Đăng ký sự kiện trước khi bắt đầu khôi phục phiên.
    window.addEventListener(
      "auth:logout",
      handleSessionExpired,
    );

    window.addEventListener(
      "auth:token-refreshed",
      handleTokenRefreshed,
    );

    void restoreSession();

    return () => {
      isMounted = false;

      window.removeEventListener(
        "auth:logout",
        handleSessionExpired,
      );

      window.removeEventListener(
        "auth:token-refreshed",
        handleTokenRefreshed,
      );
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook truy cập trạng thái xác thực từ các component.
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth phải được sử dụng bên trong AuthProvider.",
    );
  }

  return context;
}
