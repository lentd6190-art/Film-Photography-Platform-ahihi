
"use client";

// Cung cấp bố cục chung cho Dashboard Admin và Service Provider.

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

export default function DashboardLayout({
  children,
  title,
}: DashboardLayoutProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const roles = user?.roles ?? [];

  const isAdmin = roles.includes("ADMINISTRATOR");
  const isProvider = roles.includes("SERVICE_PROVIDER");

  const dashboardLinks = [
    ...(isAdmin
      ? [{ href: "/dashboard/admin", label: "Admin Dashboard" }]
      : []),
    ...(isProvider
      ? [{ href: "/dashboard/provider", label: "Provider Dashboard" }]
      : []),
  ];

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar trên màn hình desktop */}
      <aside className="hidden w-64 flex-col bg-slate-900 text-white md:flex">
        <div className="border-b border-slate-700 p-6">
          <h1 className="text-xl font-bold">Film Photography</h1>
          <p className="mt-1 text-sm text-slate-400">
            Management Portal
          </p>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          <Link
            href="/"
            className="block rounded-lg px-4 py-3 text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            Trang chủ
          </Link>

          {dashboardLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-lg px-4 py-3 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-700 p-4">
          <p className="text-xs text-slate-400">Vai trò</p>
          <p className="mt-1 break-words text-sm font-medium">
            {roles.join(", ") || "Chưa xác định"}
          </p>
        </div>
      </aside>

      {/* Nội dung chính */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {title}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Xin chào, {user?.email ?? "Người dùng"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="shrink-0 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Đăng xuất
            </button>
          </div>

          {/* Điều hướng trên màn hình nhỏ */}
          <nav className="mt-4 flex flex-wrap gap-2 md:hidden">
            <Link
              href="/"
              className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700"
            >
              Trang chủ
            </Link>

            {dashboardLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
