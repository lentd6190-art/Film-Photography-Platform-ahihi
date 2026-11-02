
"use client";

// Hiển thị thông báo khi người dùng không có quyền truy cập.

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function UnauthorizedPage() {
  const { logout } = useAuth();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg">
        <h1 className="text-3xl font-bold text-red-600">
          403 - Access Denied
        </h1>

        <p className="mt-4 text-gray-600">
          Bạn không có quyền truy cập vào trang này.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Về trang chủ
          </Link>

          <button
            onClick={logout}
            className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-100"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </main>
  );
}
