// Khai báo các vai trò được sử dụng trong Web Portal.

export const ROLES = {
  ADMIN: "ADMINISTRATOR",
  PROVIDER: "SERVICE_PROVIDER",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];
