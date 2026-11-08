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
  // Dữ liệu gửi lên API khi đăng ký Provider.
export interface ProviderRegisterRequest {
  email: string;
  password: string;
  fullName: string;
  businessName: string;
  phone: string;
  address: string;
  serviceType: string;
}

// Dữ liệu nhận về sau khi đăng ký Provider thành công.
export interface ProviderRegisterResponse {
  userId: string;
  providerProfileId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  message: string;
}