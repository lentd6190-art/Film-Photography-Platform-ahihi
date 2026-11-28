
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

interface DashboardLink {
  href: string;
  label: string;
}

export default function DashboardLayout({
  children,
  title,
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const roles = user?.roles ?? [];
  const isAdmin = roles.includes("ADMINISTRATOR");
  const isProvider = roles.includes("SERVICE_PROVIDER");

  // Chỉ hiển thị những trang Dashboard đã tồn tại.
  const dashboardLinks: DashboardLink[] = [
      ...(isAdmin
        ? [{ href: "/dashboard/admin", label: "Admin Dashboard" }]
        : []),
      ...(isProvider
        ? [{ href: "/dashboard/provider", label: "Provider Dashboard" }]
        : []),
    ];

  function isActive(href: string): boolean {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function handleLogout(): void {
    logout();
    router.replace("/login");
  }

  function renderNavigationLinks(mobile = false) {
    return (
      <>
        <Link
          href="/"
          aria-current={pathname === "/" ? "page" : undefined}
          className={`block shrink-0 rounded-xl px-4 py-3 text-sm font-medium transition ${
            pathname === "/"
              ? "bg-orange-100 text-orange-700"
              : "text-[#806F62] hover:bg-white hover:text-[#49382D]"
          } ${mobile ? "whitespace-nowrap" : ""}`}
        >
          Trang chủ
        </Link>

        {dashboardLinks.map((link) => {
          const active = isActive(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`block shrink-0 rounded-xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-orange-100 text-[#E94F00]"
                  : "text-[#806F62] hover:bg-white hover:text-[#49382D]"
              } ${mobile ? "whitespace-nowrap" : ""}`}
            >
              {link.label}
            </Link>
          );
        })}
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8F1E7] text-[#49382D]">
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-[#E9DED2] bg-[#FFF9F2] lg:flex">
        <div className="border-b border-[#E9DED2] px-7 py-7">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-extrabold tracking-tight text-[#FF5A00]">
              FILM.
            </span>
            <span className="ml-2 text-lg font-bold text-[#49382D]">
              Studio
            </span>
          </Link>

          <p className="mt-2 text-xs font-medium tracking-[0.16em] text-[#A39487]">
            FILM PHOTOGRAPHY PLATFORM
          </p>

          <div className="mt-5 inline-flex rounded-full bg-orange-100 px-3 py-1.5 text-xs font-semibold text-[#E94F00]">
            Management Portal
          </div>
        </div>

        <div className="px-5 pt-7">
          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-[#A39487]">
            Menu chính
          </p>

          <nav
            aria-label="Điều hướng chính"
            className="space-y-1.5"
          >
            {renderNavigationLinks()}
          </nav>
        </div>

        <div className="mt-auto border-t border-[#E9DED2] p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#A39487]">
            Vai trò tài khoản
          </p>

          <p className="mt-2 break-words text-sm font-semibold text-[#49382D]">
            {roles.join(", ") || "Chưa xác định"}
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-[#E9DED2] bg-white/95 px-4 py-4 backdrop-blur sm:px-7 lg:px-10">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2 lg:hidden">
                <span className="text-lg font-extrabold text-[#FF5A00]">
                  FILM.
                </span>

                <span className="text-sm font-bold text-[#49382D]">
                  Studio
                </span>
              </div>

              <h1 className="truncate text-lg font-bold text-[#49382D] sm:text-xl">
                {title}
              </h1>

              <p className="mt-1 hidden text-sm text-[#806F62] sm:block">
                Xin chào, {user?.email ?? "Người dùng"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="shrink-0 rounded-xl border border-[#F2D2C0] bg-[#FFF5EF] px-3 py-2.5 text-sm font-semibold text-[#D94B43] transition hover:bg-[#FDE9DF] sm:px-4"
            >
              Đăng xuất
            </button>
          </div>

          {/* Mobile navigation */}
          <nav
            aria-label="Điều hướng chính"
            className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden"
          >
            {renderNavigationLinks(true)}
          </nav>
        </header>

        <main className="w-full flex-1 p-4 sm:p-7 lg:p-10">
          <div className="mx-auto w-full max-w-[1440px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
