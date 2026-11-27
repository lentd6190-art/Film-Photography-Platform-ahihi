"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { providerInventoryLocalService } from "@/services/provider-inventory.local.service";
import type { Consumable } from "@/types/provider-inventory";

const STATUS_LABELS: Record<Consumable["status"], string> = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Ngừng hoạt động",
};

const STATUS_STYLES: Record<Consumable["status"], string> = {
  ACTIVE: "bg-green-50 text-[#27845B]",
  INACTIVE: "bg-[#F3EEE8] text-[#806F62]",
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN").format(price) + " đ";

export default function ConsumablesPage() {
  const [items, setItems] = useState<Consumable[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const data = await providerInventoryLocalService.getConsumables();

        if (active) setItems(data);
      } catch {
        if (active) {
          setError("Không thể tải danh sách vật tư. Vui lòng thử lại.");
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

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !keyword ||
        [item.name, item.description, item.unit]
          .some((value) => value.toLowerCase().includes(keyword));

      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter;

      const isLowStock = item.stockQuantity <= item.reorderLevel;
      const matchesStock =
        stockFilter === "ALL" ||
        (stockFilter === "LOW" && isLowStock) ||
        (stockFilter === "NORMAL" && !isLowStock);

      return matchesSearch && matchesStatus && matchesStock;
    });
  }, [items, search, statusFilter, stockFilter]);

  const activeCount = items.filter(
    (item) => item.status === "ACTIVE",
  ).length;

  const lowStockCount = items.filter(
    (item) => item.status === "ACTIVE" &&
      item.stockQuantity <= item.reorderLevel,
  ).length;

  return (
    <ProtectedRoute allowedRoles={["SERVICE_PROVIDER"]}>
      <DashboardLayout title="Quản lý Consumables">
        <div className="space-y-6">
          <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#49382D]">
                Vật tư tiêu hao của tôi
              </h1>
              <p className="mt-1 text-sm text-[#806F62]">
                Theo dõi số lượng tồn kho, giá và tình trạng vật tư.
              </p>
            </div>

            <Link
              href="/dashboard/provider/consumables/create"
              className="inline-flex items-center justify-center rounded-xl bg-[#FF5A00] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#E94F00]"
            >
              + Thêm vật tư
            </Link>
          </section>

          <section className="rounded-[18px] border border-[#E9DED2] bg-[#FFF9F2] p-4">
            <p className="text-sm leading-6 text-[#806F62]">
              <strong>Chế độ kiểm thử giao diện:</strong> Dữ liệu đang được
              lưu trên trình duyệt bằng localStorage. Chưa kết nối Resource API.
            </p>
          </section>

          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[18px] border border-[#E9DED2] bg-white p-5 shadow-sm">
              <p className="text-sm text-[#806F62]">Tổng vật tư</p>
              <p className="mt-2 text-3xl font-bold text-[#49382D]">
                {loading ? "--" : items.length}
              </p>
            </div>

            <div className="rounded-[18px] border border-[#E9DED2] bg-white p-5 shadow-sm">
              <p className="text-sm text-[#806F62]">Đang hoạt động</p>
              <p className="mt-2 text-3xl font-bold text-[#27845B]">
                {loading ? "--" : activeCount}
              </p>
            </div>

            <div className="rounded-[18px] border border-[#E9DED2] bg-white p-5 shadow-sm">
              <p className="text-sm text-[#806F62]">Cần nhập thêm</p>
              <p className="mt-2 text-3xl font-bold text-[#D99124]">
                {loading ? "--" : lowStockCount}
              </p>
            </div>
          </section>

          <section className="rounded-[18px] border border-[#E9DED2] bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-1">
                <label htmlFor="consumable-search"
                  className="mb-1.5 block text-sm font-medium text-[#49382D]">
                  Tìm kiếm vật tư
                </label>
                <input
                  id="consumable-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tên, mô tả hoặc đơn vị..."
                  className="w-full rounded-xl border border-[#DCCBBB] px-3 py-2.5 text-sm outline-none focus:border-[#FF5A00] focus:ring-2 focus:ring-[#FF5A00]/15"
                />
              </div>

              <div>
                <label htmlFor="consumable-status"
                  className="mb-1.5 block text-sm font-medium text-[#49382D]">
                  Trạng thái
                </label>
                <select
                  id="consumable-status"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="w-full rounded-xl border border-[#DCCBBB] bg-white px-3 py-2.5 text-sm">
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="INACTIVE">Ngừng hoạt động</option>
                </select>
              </div>

              <div>
                <label htmlFor="consumable-stock"
                  className="mb-1.5 block text-sm font-medium text-[#49382D]">
                  Tình trạng tồn kho
                </label>
                <select
                  id="consumable-stock"
                  value={stockFilter}
                  onChange={(event) => setStockFilter(event.target.value)}
                  className="w-full rounded-xl border border-[#DCCBBB] bg-white px-3 py-2.5 text-sm">
                  <option value="ALL">Tất cả</option>
                  <option value="LOW">Cần nhập thêm</option>
                  <option value="NORMAL">Tồn kho bình thường</option>
                </select>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[18px] border border-[#E9DED2] bg-white shadow-sm">
            <div className="border-b border-[#E9DED2] p-5">
              <h2 className="text-lg font-semibold text-[#49382D]">
                Danh sách vật tư
              </h2>
              <p className="mt-1 text-sm text-[#806F62]">
                {loading ? "Đang tải dữ liệu..." :
                  `${filteredItems.length} vật tư được tìm thấy`}
              </p>
            </div>

            {error && (
              <div className="m-5 rounded-xl bg-red-50 p-4 text-sm text-[#D94B43]">
                {error}
              </div>
            )}

            {loading ? (
              <div className="px-4 py-12 text-center text-sm text-[#806F62]">
                Đang tải danh sách vật tư...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-4xl" aria-hidden="true">📦</p>
                <h3 className="mt-3 font-semibold text-[#49382D]">
                  {items.length === 0
                    ? "Chưa có vật tư nào"
                    : "Không tìm thấy vật tư phù hợp"}
                </h3>
                <p className="mt-2 text-sm text-[#806F62]">
                  Thử thay đổi từ khóa hoặc bộ lọc.
                </p>
                {items.length === 0 && (
                  <Link
                    href="/dashboard/provider/consumables/create"
                    className="mt-4 inline-flex rounded-xl bg-[#FF5A00] px-4 py-2 text-sm font-medium text-white">
                    + Thêm vật tư
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="bg-[#FFF9F2] text-xs uppercase text-[#806F62]">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Vật tư</th>
                      <th className="px-5 py-3 font-semibold">Tồn kho</th>
                      <th className="px-5 py-3 font-semibold">Ngưỡng nhập</th>
                      <th className="px-5 py-3 font-semibold">Đơn giá</th>
                      <th className="px-5 py-3 font-semibold">Trạng thái</th>
                      <th className="px-5 py-3 font-semibold">Hạn sử dụng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9DED2]">
                    {filteredItems.map((item) => {
                      const lowStock =
                        item.stockQuantity <= item.reorderLevel;

                      return (
                        <tr key={item.id} className="hover:bg-[#FFF9F2]">
                          <td className="px-5 py-4">
                            <Link
                              href={`/dashboard/provider/consumables/${item.id}`}
                              className="font-semibold text-[#FF5A00] hover:underline">
                              {item.name}
                            </Link>
                            <p className="mt-1 text-xs text-[#806F62]">
                              {item.unit || "Chưa có đơn vị"}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <span className={lowStock
                              ? "font-semibold text-[#D99124]"
                              : "font-medium text-[#49382D]"}>
                              {item.stockQuantity} {item.unit}
                            </span>
                            {lowStock && (
                              <p className="mt-1 text-xs text-[#D99124]">
                                Cần nhập thêm
                              </p>
                            )}
                          </td>
                          <td className="px-5 py-4 text-[#806F62]">
                            {item.reorderLevel} {item.unit}
                          </td>
                          <td className="px-5 py-4 font-medium text-[#49382D]">
                            {formatPrice(item.unitPrice)}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[item.status]}`}>
                              {STATUS_LABELS[item.status]}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-[#806F62]">
                            {item.expiryDate || "Không có"}
                          </td>
                        </tr>
                      );
                    })}
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
