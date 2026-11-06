
"use client";

// Dashboard dành riêng cho người dùng có vai trò SERVICE_PROVIDER.

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";

const statistics = [
  { title: "Dịch vụ của tôi", value: "0" },
  { title: "Lịch đặt đang chờ", value: "0" },
  { title: "Lịch đặt đã hoàn thành", value: "0" },
];

export default function ProviderDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["SERVICE_PROVIDER"]}>
      <DashboardLayout title="Provider Dashboard">
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Tổng quan hoạt động
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Theo dõi dịch vụ và lịch đặt của bạn.
          </p>
        </section>

        <section
          aria-label="Thống kê nhà cung cấp"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
        >
          {statistics.map((item) => (
            <article
              key={item.title}
              className="rounded-xl bg-white p-6 shadow-sm"
            >
              <p className="text-sm text-gray-500">
                {item.title}
              </p>
              <p className="mt-3 text-3xl font-bold text-gray-900">
                {item.value}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">
            Quản lý dịch vụ
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Khu vực dành cho nhà cung cấp theo dõi dịch vụ
            và quản lý lịch đặt của khách hàng.
          </p>
        </section>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
