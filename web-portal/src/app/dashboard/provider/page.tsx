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

  const statistics = [
    {
      title: "Creative Spaces",
      value: loading ? "..." : error ? "--" : String(spaceCount),
      description: "Tổng không gian sáng tạo",
      accent: "bg-[#FFF0E5] text-[#FF5A00]",
    },
    {
      title: "Lượt đặt chỗ",
      value: "--",
      description: "Chưa kết nối Booking API",
      accent: "bg-[#F5EEE5] text-[#806F62]",
    },
    {
      title: "Đánh giá khách hàng",
      value: "--",
      description: "Chưa kết nối Review API",
      accent: "bg-[#F5EEE5] text-[#806F62]",
    },
  ];

  return (
    <ProtectedRoute allowedRoles={["SERVICE_PROVIDER"]}>
      <DashboardLayout title="Provider Dashboard">
        <div className="space-y-8">
          <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
                PROVIDER WORKSPACE
              </span>
              <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
                Tổng quan nhà cung cấp
              </h1>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Quản lý không gian sáng tạo, thiết bị và vật tư của bạn.
              </p>
            </div>

            <Link
              href="/dashboard/provider/creative-spaces/create"
              className="fpp-button-primary"
            >
              + Tạo Creative Space
            </Link>
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
                  <span
                    className={`rounded-xl px-3 py-2 text-xs font-semibold ${item.accent}`}
                  >
                    {item.title === "Creative Spaces" ? "SPACE" : "SOON"}
                  </span>
                </div>
                <p className="mt-3 text-xs text-[var(--text-muted)]">
                  {item.description}
                </p>
                {item.title === "Creative Spaces" && error && (
                  <p role="alert" className="mt-2 text-xs text-red-600">
                    {error}
                  </p>
                )}
              </article>
            ))}
          </section>

          <section className="fpp-card p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
                  YOUR CREATIVE SPACE
                </span>
                <h2 className="mt-2 text-xl font-bold text-[var(--text-primary)]">
                  Quản lý không gian sáng tạo
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                  Quản lý các không gian Darkroom và Studio. Bạn có thể tạo mới,
                  cập nhật thông tin và thay đổi trạng thái hoạt động của từng
                  không gian.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard/provider/creative-spaces"
                  className="fpp-button-secondary"
                >
                  Xem danh sách
                </Link>
                <Link
                  href="/dashboard/provider/creative-spaces/create"
                  className="fpp-button-primary"
                >
                  + Tạo mới
                </Link>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Quản lý tài nguyên
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Truy cập nhanh các khu vực quản lý tài nguyên của bạn.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Link
                href="/dashboard/provider/equipment"
                className="fpp-card group p-6 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)]"
              >
                <span className="inline-flex rounded-xl bg-[#FFF0E5] px-3 py-2 text-sm font-semibold text-[var(--primary)]">
                  EQUIPMENT
                </span>
                <h3 className="mt-4 font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)]">
                  Quản lý thiết bị
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  Theo dõi danh sách máy ảnh, ống kính và thiết bị phục vụ nhiếp
                  ảnh.
                </p>
                <span className="mt-4 inline-block text-sm font-semibold text-[var(--primary)]">
                  Mở quản lý thiết bị →
                </span>
              </Link>

              <Link
                href="/dashboard/provider/consumables"
                className="fpp-card group p-6 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)]"
              >
                <span className="inline-flex rounded-xl bg-[#FFF0E5] px-3 py-2 text-sm font-semibold text-[var(--primary)]">
                  CONSUMABLES
                </span>
                <h3 className="mt-4 font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)]">
                  Quản lý vật tư tiêu hao
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  Theo dõi số lượng tồn kho và giá của các loại vật tư.
                </p>
                <span className="mt-4 inline-block text-sm font-semibold text-[var(--primary)]">
                  Mở quản lý vật tư →
                </span>
              </Link>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Hoạt động khác
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Các chức năng sẽ được hoàn thiện khi dịch vụ tương ứng được tích hợp.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <article className="fpp-card p-5">
                <h3 className="font-semibold text-[var(--text-primary)]">
                  Quản lý đặt chỗ
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  Theo dõi và quản lý các yêu cầu đặt chỗ của khách hàng.
                </p>
                <p className="mt-4 inline-block rounded-full bg-[#F5EEE5] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
                  Chờ tích hợp Booking API
                </p>
              </article>

              <article className="fpp-card p-5">
                <h3 className="font-semibold text-[var(--text-primary)]">
                  Quản lý đánh giá
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  Theo dõi phản hồi và đánh giá từ khách hàng.
                </p>
                <p className="mt-4 inline-block rounded-full bg-[#F5EEE5] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
                  Chờ tích hợp Review API
                </p>
              </article>
            </div>
          </section>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
