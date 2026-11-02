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

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Đăng xuất và xóa token.
  const logout = useCallback(() => {
    tokenStorage.clearTokens();
    setUser(null);
  }, []);

  // Đăng nhập và lưu token.
  const login = useCallback(
    async (credentials: LoginRequest): Promise<void> => {
      const tokenResponse = await authService.login(credentials);

      const decodedUser = decodeJwt(tokenResponse.accessToken);

      if (!decodedUser) {
        tokenStorage.clearTokens();

        throw new Error(
          "Không thể đọc thông tin người dùng từ Access Token.",
        );
      }

      if (
        !tokenResponse.refreshToken ||
        !tokenResponse.accessToken
      ) {
        tokenStorage.clearTokens();

        throw new Error("API không trả về đầy đủ token.");
      }

      tokenStorage.setTokens(
        tokenResponse.accessToken,
        tokenResponse.refreshToken,
      );

      setUser(decodedUser);
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

        if (!accessToken || !refreshToken) {
          tokenStorage.clearTokens();
          return;
        }

        const decodedUser = decodeJwt(accessToken);

        // Nếu token có exp và vẫn còn hạn thì khôi phục phiên.
        if (
          decodedUser?.exp !== undefined &&
          decodedUser.exp * 1000 > Date.now()
        ) {
          if (isMounted) {
            setUser(decodedUser);
          }

          return;
        }

        // Token hết hạn hoặc không hợp lệ: thử refresh.
        const tokenResponse = await authService.refreshToken({
          refreshToken,
        });

        if (
          !tokenResponse.accessToken ||
          !tokenResponse.refreshToken
        ) {
          throw new Error("API không trả về đầy đủ token mới.");
        }

        const refreshedUser = decodeJwt(tokenResponse.accessToken);

        if (
          !refreshedUser ||
          refreshedUser.exp === undefined ||
          refreshedUser.exp * 1000 <= Date.now()
        ) {
          throw new Error("Access Token mới không hợp lệ hoặc đã hết hạn.");
        }

        // Lưu cả hai token mới do backend xoay vòng refresh token.
        tokenStorage.setTokens(
          tokenResponse.accessToken,
          tokenResponse.refreshToken,
        );

        if (isMounted) {
          setUser(refreshedUser);
        }
      } catch {
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

    void restoreSession();

    // Axios thông báo phiên đăng nhập đã hết hạn.
    const handleSessionExpired = (): void => {
      setUser(null);
    };

    // Axios thông báo token đã được làm mới thành công.
    const handleTokenRefreshed = (): void => {
      const accessToken = tokenStorage.getAccessToken();

      if (!accessToken) {
        setUser(null);
        return;
      }

      const decodedUser = decodeJwt(accessToken);

      if (decodedUser) {
        setUser(decodedUser);
      } else {
        tokenStorage.clearTokens();
        setUser(null);
      }
    };

    window.addEventListener("auth:logout", handleSessionExpired);

    window.addEventListener(
      "auth:token-refreshed",
      handleTokenRefreshed,
    );

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