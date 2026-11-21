
"use client";

// Bảo vệ trang và kiểm tra quyền truy cập theo vai trò người dùng.

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const hasPermission =
    allowedRoles === undefined ||
    (user !== null &&
      allowedRoles.some((role) => user.roles.includes(role)));

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!hasPermission) {
      router.replace("/unauthorized");
    }
  }, [isLoading, isAuthenticated, hasPermission, router]);

  if (isLoading || !isAuthenticated || !hasPermission) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
          <p className="mt-4 text-sm text-gray-600">
            Đang kiểm tra quyền truy cập...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
