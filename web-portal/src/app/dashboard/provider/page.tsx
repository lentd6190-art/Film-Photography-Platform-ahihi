
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { creativeSpaceService } from "@/services/creative-space.service";

export default function ProviderDashboardPage() {
  const [spaceCount, setSpaceCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchSpaceCount = async () => {
      try {
        const spaces = await creativeSpaceService.getAll();

        if (!cancelled) {
          setSpaceCount(spaces.length);
          setError("");
        }
      } catch {
        if (!cancelled) {
          setError("Không thể tải thống kê Creative Spaces.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchSpaceCount();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ProtectedRoute allowedRoles={["SERVICE_PROVIDER"]}>
      <DashboardLayout title="Provider Dashboard">
        <div className="space-y-8">
          <section>
            <h1 className="text-2xl font-bold text-gray-900">
              Tổng quan nhà cung cấp
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Quản lý không gian sáng tạo và hoạt động kinh doanh của bạn.
            </p>
          </section>

          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Tổng Creative Spaces
              </p>

              <p className="mt-3 text-3xl font-bold text-gray-900">
                {loading ? "..." : error ? "--" : spaceCount}
              </p>

              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Tổng lượt đặt chỗ
              </p>
              <p className="mt-3 text-3xl font-bold text-gray-900">--</p>
              <p className="mt-2 text-xs text-gray-400">
                Chưa kết nối Booking API
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Đánh giá khách hàng
              </p>
              <p className="mt-3 text-3xl font-bold text-gray-900">--</p>
              <p className="mt-2 text-xs text-gray-400">
                Chưa kết nối Review API
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Quản lý Creative Spaces
            </h2>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-600">
                Quản lý các không gian Darkroom và Studio của bạn.
                Bạn có thể tạo mới, cập nhật thông tin và thay đổi trạng thái
                hoạt động của từng không gian.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/dashboard/provider/creative-spaces"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Xem danh sách Creative Spaces
                </Link>

                <Link
                  href="/dashboard/provider/creative-spaces/create"
                  className="rounded-lg border border-blue-600 px-5 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
                >
                  + Tạo Creative Space
                </Link>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Hoạt động khác
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="font-semibold text-gray-900">
                  Quản lý đặt chỗ
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Theo dõi và quản lý các yêu cầu đặt chỗ của khách hàng.
                </p>
                <p className="mt-3 text-xs text-gray-400">
                  Chức năng đang chờ tích hợp Booking API.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="font-semibold text-gray-900">
                  Quản lý đánh giá
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Theo dõi phản hồi và đánh giá từ khách hàng.
                </p>
                <p className="mt-3 text-xs text-gray-400">
                  Chức năng đang chờ tích hợp Review API.
                </p>
              </div>
            </div>
          </section>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
