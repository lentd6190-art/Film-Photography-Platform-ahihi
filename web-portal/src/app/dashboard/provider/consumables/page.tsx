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
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-gray-100 text-gray-600",
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
              <h1 className="text-2xl font-bold text-gray-900">
                Vật tư tiêu hao của tôi
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Theo dõi số lượng tồn kho, giá và tình trạng vật tư.
              </p>
            </div>

            <Link
              href="/dashboard/provider/consumables/create"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Thêm vật tư
            </Link>
          </section>

          <section className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm leading-6 text-blue-800">
              <strong>Chế độ kiểm thử giao diện:</strong> Dữ liệu đang được
              lưu trên trình duyệt bằng localStorage. Chưa kết nối Resource API.
            </p>
          </section>

          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Tổng vật tư</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? "--" : items.length}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Đang hoạt động</p>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {loading ? "--" : activeCount}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Cần nhập thêm</p>
              <p className="mt-2 text-3xl font-bold text-orange-600">
                {loading ? "--" : lowStockCount}
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-1">
                <label htmlFor="consumable-search"
                  className="mb-1.5 block text-sm font-medium text-gray-700">
                  Tìm kiếm vật tư
                </label>
                <input
                  id="consumable-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tên, mô tả hoặc đơn vị..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label htmlFor="consumable-status"
                  className="mb-1.5 block text-sm font-medium text-gray-700">
                  Trạng thái
                </label>
                <select
                  id="consumable-status"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm">
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="INACTIVE">Ngừng hoạt động</option>
                </select>
              </div>

              <div>
                <label htmlFor="consumable-stock"
                  className="mb-1.5 block text-sm font-medium text-gray-700">
                  Tình trạng tồn kho
                </label>
                <select
                  id="consumable-stock"
                  value={stockFilter}
                  onChange={(event) => setStockFilter(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm">
                  <option value="ALL">Tất cả</option>
                  <option value="LOW">Cần nhập thêm</option>
                  <option value="NORMAL">Tồn kho bình thường</option>
                </select>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Danh sách vật tư
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {loading ? "Đang tải dữ liệu..." :
                  `${filteredItems.length} vật tư được tìm thấy`}
              </p>
            </div>

            {error && (
              <div className="m-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="px-4 py-12 text-center text-sm text-gray-500">
                Đang tải danh sách vật tư...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-4xl" aria-hidden="true">📦</p>
                <h3 className="mt-3 font-semibold text-gray-800">
                  {items.length === 0
                    ? "Chưa có vật tư nào"
                    : "Không tìm thấy vật tư phù hợp"}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Thử thay đổi từ khóa hoặc bộ lọc.
                </p>
                {items.length === 0 && (
                  <Link
                    href="/dashboard/provider/consumables/create"
                    className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">
                    + Thêm vật tư
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Vật tư</th>
                      <th className="px-5 py-3 font-semibold">Tồn kho</th>
                      <th className="px-5 py-3 font-semibold">Ngưỡng nhập</th>
                      <th className="px-5 py-3 font-semibold">Đơn giá</th>
                      <th className="px-5 py-3 font-semibold">Trạng thái</th>
                      <th className="px-5 py-3 font-semibold">Hạn sử dụng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredItems.map((item) => {
                      const lowStock =
                        item.stockQuantity <= item.reorderLevel;

                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-5 py-4">
                            <Link
                              href={`/dashboard/provider/consumables/${item.id}`}
                              className="font-semibold text-blue-700 hover:underline">
                              {item.name}
                            </Link>
                            <p className="mt-1 text-xs text-gray-500">
                              {item.unit || "Chưa có đơn vị"}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <span className={lowStock
                              ? "font-semibold text-orange-600"
                              : "font-medium text-gray-900"}>
                              {item.stockQuantity} {item.unit}
                            </span>
                            {lowStock && (
                              <p className="mt-1 text-xs text-orange-600">
                                Cần nhập thêm
                              </p>
                            )}
                          </td>
                          <td className="px-5 py-4 text-gray-600">
                            {item.reorderLevel} {item.unit}
                          </td>
                          <td className="px-5 py-4 font-medium text-gray-900">
                            {formatPrice(item.unitPrice)}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[item.status]}`}>
                              {STATUS_LABELS[item.status]}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-gray-600">
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
