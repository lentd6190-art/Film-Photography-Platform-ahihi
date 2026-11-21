// Khai báo kiểu dữ liệu dùng trong chức năng xác thực.

export interface LoginRequest {
    email: string;
    password: string;
  }
  export interface AuthTokenResponse {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    refreshToken: string;
  }
  export interface RefreshTokenRequest {
    refreshToken: string;
  }
  export interface JwtPayload {
    sub: string;
    email: string;
    roles: string[];
    exp?: number;
    iat?: number;
  }