"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { providerInventoryLocalService } from "@/services/provider-inventory.local.service";
import type { ConsumableFormData } from "@/types/provider-inventory";

export default function CreateConsumablePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [stockQuantity, setStockQuantity] = useState("0");
  const [reorderLevel, setReorderLevel] = useState("0");
  const [unitPrice, setUnitPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const stock = Number(stockQuantity);
    const reorder = Number(reorderLevel);
    const price = Number(unitPrice);

    if (!name.trim()) {
      setMessage("Vui lòng nhập tên vật tư.");
      return;
    }

    if (
      !Number.isInteger(stock) ||
      !Number.isInteger(reorder) ||
      stock < 0 ||
      reorder < 0
    ) {
      setMessage(
        "Số lượng tồn kho và ngưỡng nhập thêm phải là số nguyên không âm.",
      );
      return;
    }

    if (unitPrice.trim() === "" || !Number.isFinite(price) || price < 0) {
      setMessage("Vui lòng nhập đơn giá hợp lệ, không được âm.");
      return;
    }

    if (!unit.trim()) {
      setMessage("Vui lòng nhập đơn vị tính.");
      return;
    }

    const data: ConsumableFormData = {
      name: name.trim(),
      description: description.trim(),
      stockQuantity: stock,
      reorderLevel: reorder,
      unitPrice: price,
      unit: unit.trim(),
      expiryDate,
      status: "ACTIVE",
    };

    try {
      setSaving(true);

      await providerInventoryLocalService.createConsumable(data);

      router.push("/dashboard/provider/consumables");
    } catch {
      setMessage("Không thể lưu vật tư. Vui lòng thử lại.");
      setSaving(false);
    }
  }

  return (
    <ProtectedRoute allowedRoles={["SERVICE_PROVIDER"]}>
      <DashboardLayout title="Thêm vật tư tiêu hao">
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <Link
              href="/dashboard/provider/consumables"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              ← Quay lại danh sách vật tư
            </Link>

            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              Thêm vật tư tiêu hao mới
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Nhập thông tin và thiết lập mức tồn kho cho vật tư.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <section className="space-y-4">
              <h2 className="border-b border-gray-100 pb-3 text-lg font-semibold text-gray-900">
                Thông tin cơ bản
              </h2>

              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                  Tên vật tư *
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  maxLength={150}
                  placeholder="Ví dụ: Film Kodak Portra 400"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
                  Mô tả
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="Mô tả thông tin vật tư..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="border-b border-gray-100 pb-3 text-lg font-semibold text-gray-900">
                Quản lý tồn kho
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="stockQuantity" className="mb-1 block text-sm font-medium text-gray-700">
                    Số lượng tồn kho *
                  </label>
                  <input
                    id="stockQuantity"
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={stockQuantity}
                    onChange={(event) => setStockQuantity(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label htmlFor="reorderLevel" className="mb-1 block text-sm font-medium text-gray-700">
                    Ngưỡng cần nhập thêm *
                  </label>
                  <input
                    id="reorderLevel"
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={reorderLevel}
                    onChange={(event) => setReorderLevel(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Cảnh báo khi số lượng tồn kho bằng hoặc thấp hơn ngưỡng này.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="border-b border-gray-100 pb-3 text-lg font-semibold text-gray-900">
                Giá và hạn sử dụng
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="unitPrice" className="mb-1 block text-sm font-medium text-gray-700">
                    Đơn giá (VNĐ) *
                  </label>
                  <input
                    id="unitPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={unitPrice}
                    onChange={(event) => setUnitPrice(event.target.value)}
                    placeholder="Ví dụ: 180000"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label htmlFor="unit" className="mb-1 block text-sm font-medium text-gray-700">
                    Đơn vị tính *
                  </label>
                  <input
                    id="unit"
                    value={unit}
                    onChange={(event) => setUnit(event.target.value)}
                    maxLength={50}
                    required
                    placeholder="Cuộn, hộp, chiếc..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="expiryDate" className="mb-1 block text-sm font-medium text-gray-700">
                    Ngày hết hạn
                  </label>
                  <input
                    id="expiryDate"
                    type="date"
                    value={expiryDate}
                    onChange={(event) => setExpiryDate(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </section>

            {message && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {message}
              </div>
            )}

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
              <p className="font-semibold">Chế độ lưu dữ liệu kiểm thử</p>
              <p className="mt-1">
                Dữ liệu được lưu trên trình duyệt bằng localStorage.
                Chưa gửi dữ liệu lên Resource API.
              </p>
            </div>

            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
              <Link
                href="/dashboard/provider/consumables"
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Đang lưu..." : "Thêm vật tư"}
              </button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
