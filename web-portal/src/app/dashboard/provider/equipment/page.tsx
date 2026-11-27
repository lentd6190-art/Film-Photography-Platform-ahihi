"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { providerInventoryLocalService } from "@/services/provider-inventory.local.service";
import { creativeSpaceService } from "@/services/creative-space.service";
import type { Equipment } from "@/types/provider-inventory";
import type { CreativeSpace } from "@/types/creative-space";

const STATUS_LABELS: Record<Equipment["status"], string> = {
  AVAILABLE: "Sẵn sàng",
  RENTED: "Đang được thuê",
  MAINTENANCE: "Đang bảo trì",
  INACTIVE: "Ngừng hoạt động",
};

const STATUS_STYLES: Record<Equipment["status"], string> = {
  AVAILABLE: "bg-green-50 text-[#27845B]",
  RENTED: "bg-orange-50 text-[#E94F00]",
  MAINTENANCE: "bg-amber-50 text-[#D99124]",
  INACTIVE: "bg-[#F3EEE8] text-[#806F62]",
};

const CONDITION_LABELS: Record<Equipment["condition"], string> = {
  NEW: "Mới",
  EXCELLENT: "Rất tốt",
  GOOD: "Tốt",
  FAIR: "Khá",
  POOR: "Kém",
  DAMAGED: "Hư hỏng",
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN").format(price) + " đ";

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [spaces, setSpaces] = useState<CreativeSpace[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [equipmentData, spaceData] = await Promise.all([
          providerInventoryLocalService.getEquipment(),
          creativeSpaceService.getAll(),
        ]);

        if (!active) return;

        setEquipment(equipmentData);
        setSpaces(spaceData.filter((space) => space.status === "ACTIVE"));
      } catch {
        if (active) {
          setError("Không thể tải dữ liệu thiết bị. Vui lòng thử lại.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const filteredEquipment = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return equipment.filter((item) => {
      const matchesSearch =
        !keyword ||
        [
          item.name,
          item.category,
          item.brand,
          item.model,
          item.description,
        ].some((value) => value.toLowerCase().includes(keyword));

      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [equipment, search, statusFilter]);

  const availableCount = equipment.filter(
    (item) => item.status === "AVAILABLE",
  ).length;

  const maintenanceCount = equipment.filter(
    (item) => item.status === "MAINTENANCE",
  ).length;

  const getSpaceName = (spaceId: string) =>
    spaces.find((space) => space.id === spaceId)?.name || "Chưa liên kết";

  return (
    <ProtectedRoute allowedRoles={["SERVICE_PROVIDER"]}>
      <DashboardLayout title="Quản lý Equipment">
        <div className="space-y-6">
          <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#49382D]">
                Thiết bị của tôi
              </h1>
              <p className="mt-1 text-sm text-[#806F62]">
                Quản lý danh sách thiết bị phục vụ hoạt động kinh doanh.
              </p>
            </div>

            <Link
              href="/dashboard/provider/equipment/create"
              className="inline-flex items-center justify-center rounded-xl bg-[#FF5A00] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#E94F00]"
            >
              + Thêm thiết bị
            </Link>
          </section>

          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[18px] border border-[#E9DED2] bg-white p-5 shadow-sm">
              <p className="text-sm text-[#806F62]">Tổng thiết bị</p>
              <p className="mt-2 text-3xl font-bold text-[#49382D]">
                {loading ? "--" : equipment.length}
              </p>
            </div>

            <div className="rounded-[18px] border border-[#E9DED2] bg-white p-5 shadow-sm">
              <p className="text-sm text-[#806F62]">Đang sẵn sàng</p>
              <p className="mt-2 text-3xl font-bold text-[#27845B]">
                {loading ? "--" : availableCount}
              </p>
            </div>

            <div className="rounded-[18px] border border-[#E9DED2] bg-white p-5 shadow-sm">
              <p className="text-sm text-[#806F62]">Đang bảo trì</p>
              <p className="mt-2 text-3xl font-bold text-[#D99124]">
                {loading ? "--" : maintenanceCount}
              </p>
            </div>
          </section>

          <section className="rounded-[18px] border border-[#E9DED2] bg-[#FFF9F2] p-4">
            <p className="text-sm leading-6 text-[#806F62]">
              <strong>Chế độ kiểm thử giao diện:</strong> Dữ liệu thiết bị
              hiện được lưu trên trình duyệt bằng localStorage. Chưa có kết
              nối Resource API. Có thể tạo và quản lý dữ liệu mẫu độc lập
              để kiểm thử frontend.
            </p>
          </section>

          <section className="rounded-[18px] border border-[#E9DED2] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex-1">
                <label
                  htmlFor="equipment-search"
                  className="mb-1.5 block text-sm font-medium text-[#49382D]"
                >
                  Tìm kiếm thiết bị
                </label>
                <input
                  id="equipment-search"
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tên, danh mục, thương hiệu hoặc model..."
                  className="w-full rounded-xl border border-[#DCCBBB] px-3 py-2.5 text-sm outline-none focus:border-[#FF5A00] focus:ring-2 focus:ring-[#FF5A00]/15"
                />
              </div>

              <div className="md:w-56">
                <label
                  htmlFor="equipment-status"
                  className="mb-1.5 block text-sm font-medium text-[#49382D]"
                >
                  Trạng thái
                </label>
                <select
                  id="equipment-status"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="w-full rounded-xl border border-[#DCCBBB] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#FF5A00] focus:ring-2 focus:ring-[#FF5A00]/15"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="AVAILABLE">Sẵn sàng</option>
                  <option value="RENTED">Đang được thuê</option>
                  <option value="MAINTENANCE">Đang bảo trì</option>
                  <option value="INACTIVE">Ngừng hoạt động</option>
                </select>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[18px] border border-[#E9DED2] bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-2 border-b border-[#E9DED2] p-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-semibold text-[#49382D]">
                  Danh sách thiết bị
                </h2>
                <p className="mt-1 text-sm text-[#806F62]">
                  {loading
                    ? "Đang tải dữ liệu..."
                    : `${filteredEquipment.length} thiết bị được tìm thấy`}
                </p>
              </div>
            </div>

            {error && (
              <div className="m-5 rounded-xl bg-red-50 p-4 text-sm text-[#D94B43]">
                {error}
              </div>
            )}

            {loading ? (
              <div className="px-4 py-12 text-center text-sm text-[#806F62]">
                Đang tải danh sách thiết bị...
              </div>
            ) : filteredEquipment.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-4xl" aria-hidden="true">📷</p>
                <h3 className="mt-3 font-semibold text-[#49382D]">
                  {equipment.length === 0
                    ? "Chưa có thiết bị nào"
                    : "Không tìm thấy thiết bị phù hợp"}
                </h3>
                <p className="mt-2 text-sm text-[#806F62]">
                  {equipment.length === 0
                    ? "Hãy thêm thiết bị đầu tiên vào danh sách quản lý."
                    : "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái."}
                </p>
                {equipment.length === 0 && (
                  <Link
                    href="/dashboard/provider/equipment/create"
                    className="mt-4 inline-flex rounded-xl bg-[#FF5A00] px-4 py-2 text-sm font-medium text-white hover:bg-[#E94F00]"
                  >
                    + Thêm thiết bị
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="bg-[#FFF9F2] text-xs uppercase text-[#806F62]">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Thiết bị</th>
                      <th className="px-5 py-3 font-semibold">Danh mục</th>
                      <th className="px-5 py-3 font-semibold">Tình trạng</th>
                      <th className="px-5 py-3 font-semibold">Trạng thái</th>
                      <th className="px-5 py-3 font-semibold">Giá thuê</th>
                      <th className="px-5 py-3 font-semibold">Creative Space</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9DED2]">
                    {filteredEquipment.map((item) => (
                      <tr
                        key={item.id}
                        className="transition hover:bg-[#FFF9F2]"
                      >
                        <td className="px-5 py-4">
                          <Link
                            href={`/dashboard/provider/equipment/${item.id}`}
                            className="font-semibold text-[#FF5A00] hover:text-[#E94F00] hover:underline"
                          >
                            {item.name}
                          </Link>
                          <p className="mt-1 text-xs text-[#806F62]">
                            {[item.brand, item.model]
                              .filter(Boolean)
                              .join(" · ") || "Chưa có thông tin"}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-[#806F62]">
                          {item.category}
                        </td>
                        <td className="px-5 py-4 text-[#806F62]">
                          {CONDITION_LABELS[item.condition]}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[item.status]}`}
                          >
                            {STATUS_LABELS[item.status]}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-medium text-[#49382D]">
                          {formatPrice(item.rentalPrice)}
                        </td>
                        <td className="px-5 py-4 text-[#806F62]">
                          {getSpaceName(item.relatedCreativeSpaceId)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
