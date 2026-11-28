"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";

const statistics = [
  {
    title: "Dịch vụ của tôi",
    value: "0",
    description: "Tổng số dịch vụ đang quản lý",
    label: "SERVICES",
  },
  {
    title: "Lịch đặt đang chờ",
    value: "0",
    description: "Các yêu cầu cần được xử lý",
    label: "PENDING",
  },
  {
    title: "Lịch đặt đã hoàn thành",
    value: "0",
    description: "Các lịch đặt đã hoàn tất",
    label: "COMPLETED",
  },
];

export default function ProviderDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["SERVICE_PROVIDER"]}>
      <DashboardLayout title="Provider Dashboard">
        <div className="space-y-8">
          <section>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
              PROVIDER WORKSPACE
            </span>

            <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
              Tổng quan hoạt động
            </h1>

            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Theo dõi dịch vụ, lịch đặt và hoạt động kinh doanh của bạn trên
              Film Photography Platform.
            </p>
          </section>

          <section
            aria-label="Thống kê nhà cung cấp"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
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
              BUSINESS MANAGEMENT
            </span>

            <h2 className="mt-2 text-xl font-bold text-[var(--text-primary)]">
              Khu vực quản lý nhà cung cấp
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-secondary)]">
              Quản lý thông tin dịch vụ và theo dõi lịch đặt của khách hàng.
              Các chức năng chi tiết sẽ được triển khai theo từng module.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
                <span className="text-xs font-semibold tracking-wider text-[var(--primary)]">
                  SERVICE MANAGEMENT
                </span>

                <h3 className="mt-3 font-semibold text-[var(--text-primary)]">
                  Quản lý dịch vụ
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  Theo dõi và quản lý thông tin các dịch vụ cung cấp cho khách
                  hàng.
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
                  Quản lý lịch đặt
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  Theo dõi các yêu cầu đặt lịch và trạng thái phục vụ khách
                  hàng.
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
