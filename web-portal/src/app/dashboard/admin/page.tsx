
"use client";

// Dashboard dành riêng cho người dùng có vai trò ADMINISTRATOR.

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";

const statistics = [
  { title: "Tổng người dùng", value: "0" },
  { title: "Tổng nhà cung cấp", value: "0" },
  { title: "Tổng đơn đặt lịch", value: "0" },
  { title: "Tổng dịch vụ", value: "0" },
];

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMINISTRATOR"]}>
      <DashboardLayout title="Admin Dashboard">
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Tổng quan hệ thống
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Theo dõi và quản lý hoạt động của nền tảng.
          </p>
        </section>

        <section
          aria-label="Thống kê hệ thống"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4"
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
            Chức năng quản trị
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Khu vực dành cho quản lý người dùng, nhà cung cấp,
            dịch vụ và hoạt động của hệ thống.
          </p>
        </section>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
