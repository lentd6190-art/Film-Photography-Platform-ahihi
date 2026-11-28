"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";

const statistics = [
  {
    title: "Tổng người dùng",
    value: "0",
    description: "Người dùng trên nền tảng",
    label: "USERS",
  },
  {
    title: "Tổng nhà cung cấp",
    value: "0",
    description: "Tài khoản nhà cung cấp",
    label: "PROVIDERS",
  },
  {
    title: "Tổng đơn đặt lịch",
    value: "0",
    description: "Đơn đặt lịch trên hệ thống",
    label: "BOOKINGS",
  },
  {
    title: "Tổng dịch vụ",
    value: "0",
    description: "Dịch vụ đang được quản lý",
    label: "SERVICES",
  },
];

export default function AdminDashboardPage() {


  return (
    <ProtectedRoute allowedRoles={["ADMINISTRATOR"]}>
      <DashboardLayout title="Admin Dashboard">
        <div className="space-y-8">
          <section>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
              ADMIN WORKSPACE
            </span>

            <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
              Tổng quan hệ thống
            </h1>

            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Theo dõi và quản lý hoạt động của Film Photography Platform.
            </p>
          </section>

          <section
            aria-label="Thống kê hệ thống"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            {statistics.map((item) => (
              <article key={item.title} className="fpp-card p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-secondary)]">
                      {item.title}
                    </p>

                    <p className="mt-4 text-3xl font-bold text-[var(--text-primary)]">
                      {item.value}
                    </p>
                  </div>

                  <span className="rounded-xl bg-[#FFF0E5] px-3 py-2 text-xs font-semibold text-[var(--primary)]">
                    {item.label}
                  </span>
                </div>

                <p className="mt-3 text-xs text-[var(--text-muted)]">
                  {item.description}
                </p>
              </article>
            ))}
          </section>

          <section className="fpp-card p-6 sm:p-8">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
              SYSTEM MANAGEMENT
            </span>

            <h2 className="mt-2 text-xl font-bold text-[var(--text-primary)]">
              Chức năng quản trị
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-secondary)]">
              Khu vực dành cho quản lý người dùng, nhà cung cấp, dịch vụ và
              hoạt động của hệ thống. Các chức năng quản trị sẽ được hoàn thiện
              theo phạm vi triển khai của từng module.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
                <span className="text-xs font-semibold tracking-wider text-[var(--primary)]">
                  USER MANAGEMENT
                </span>

                <h3 className="mt-3 font-semibold text-[var(--text-primary)]">
                  Quản lý người dùng
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  Khu vực quản lý tài khoản và thông tin người dùng.
                </p>

                <span className="mt-4 inline-block rounded-full bg-[#F5EEE5] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
                  Chưa triển khai giao diện
                </span>
              </article>

              <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
                <span className="text-xs font-semibold tracking-wider text-[var(--primary)]">
                  PROVIDER MANAGEMENT
                </span>

                <h3 className="mt-3 font-semibold text-[var(--text-primary)]">
                  Quản lý nhà cung cấp
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  Khu vực theo dõi và quản lý các nhà cung cấp dịch vụ.
                </p>

                <span className="mt-4 inline-block rounded-full bg-[#F5EEE5] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
                  Chưa triển khai giao diện
                </span>
              </article>

              <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
                <span className="text-xs font-semibold tracking-wider text-[var(--primary)]">
                  SERVICE MANAGEMENT
                </span>

                <h3 className="mt-3 font-semibold text-[var(--text-primary)]">
                  Quản lý dịch vụ
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  Khu vực quản lý danh sách và thông tin dịch vụ.
                </p>

                <span className="mt-4 inline-block rounded-full bg-[#F5EEE5] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
                  Chưa triển khai giao diện
                </span>
              </article>

              <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
                <span className="text-xs font-semibold tracking-wider text-[var(--primary)]">
                  BOOKING MANAGEMENT
                </span>

                <h3 className="mt-3 font-semibold text-[var(--text-primary)]">
                  Quản lý đặt lịch
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  Khu vực theo dõi và quản lý hoạt động đặt lịch.
                </p>

                <span className="mt-4 inline-block rounded-full bg-[#F5EEE5] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
                  Chưa triển khai giao diện
                </span>
              </article>
            </div>
          </section>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
