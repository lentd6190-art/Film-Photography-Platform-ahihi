
"use client";

// Điều hướng người dùng đến trang phù hợp sau khi kiểm tra đăng nhập.

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    if (user.roles.includes("ADMINISTRATOR")) {
      router.replace("/dashboard/admin");
      return;
    }

    if (user.roles.includes("SERVICE_PROVIDER")) {
      router.replace("/dashboard/provider");
      return;
    }

    router.replace("/unauthorized");
  }, [user, isAuthenticated, isLoading, router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-gray-600">Đang chuyển hướng...</p>
    </main>
  );
}
