"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { providerInventoryLocalService } from "@/services/provider-inventory.local.service";
import type {
  Consumable,
  ConsumableFormData,
} from "@/types/provider-inventory";

function formatPrice(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + " đ";
}

function formatDate(value: string) {
  if (!value) return "Chưa cập nhật";
  return new Date(value + "T00:00:00").toLocaleDateString("vi-VN");
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-[#806F62]">{label}</p>
      <p className="mt-1 whitespace-pre-wrap font-medium text-[#49382D]">
        {value || "Chưa cập nhật"}
      </p>
    </div>
  );
}

function ConsumableDetailContent() {
  const params = useParams<{ id: string }>();

  const id = params.id;

  const [item, setItem] = useState<Consumable | null>(null);
  const [form, setForm] = useState<ConsumableFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const result =
          await providerInventoryLocalService.getConsumableById(id);

        if (!active) return;

        setItem(result);

        if (result) {
          setForm({
            name: result.name,
            description: result.description,
            stockQuantity: result.stockQuantity,
            reorderLevel: result.reorderLevel,
            unitPrice: result.unitPrice,
            unit: result.unit,
            expiryDate: result.expiryDate,
            status: result.status,
          });
        }
      } catch {
        if (active) {
          setError("Không thể tải thông tin Consumable.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    if (id) loadData();

    return () => {
      active = false;
    };
  }, [id]);

  function updateField<K extends keyof ConsumableFormData>(
    field: K,
    value: ConsumableFormData[K],
  ) {
    setForm((current) =>
      current ? { ...current, [field]: value } : current,
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form || !item) return;

    setError("");
    setSuccess("");

    const stock = Number(form.stockQuantity);
    const reorder = Number(form.reorderLevel);
    const price = Number(form.unitPrice);

    if (!form.name.trim()) {
      setError("Vui lòng nhập tên Consumable.");
      return;
    }

    if (!form.unit.trim()) {
      setError("Vui lòng nhập đơn vị tính.");
      return;
    }

    if (
      !Number.isInteger(stock) ||
      stock < 0 ||
      !Number.isInteger(reorder) ||
      reorder < 0
    ) {
      setError("Số lượng tồn và ngưỡng tồn kho phải là số nguyên không âm.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("Đơn giá phải là số hợp lệ và không âm.");
      return;
    }

    const data: ConsumableFormData = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      unit: form.unit.trim(),
      stockQuantity: stock,
      reorderLevel: reorder,
      unitPrice: price,
    };

    try {
      setSaving(true);

      const updated = await providerInventoryLocalService.updateConsumable(
        item.id,
        data,
      );

      if (!updated) {
        setError("Không tìm thấy Consumable để cập nhật.");
        return;
      }

      setItem(updated);
      setForm({
        name: updated.name,
        description: updated.description,
        stockQuantity: updated.stockQuantity,
        reorderLevel: updated.reorderLevel,
        unitPrice: updated.unitPrice,
        unit: updated.unit,
        expiryDate: updated.expiryDate,
        status: updated.status,
      });
      setEditing(false);
      setSuccess("Đã cập nhật Consumable thành công.");
    } catch {
      setError("Không thể lưu thay đổi. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProtectedRoute allowedRoles={["SERVICE_PROVIDER"]}>
      <DashboardLayout title="Chi tiết Consumable">
        <div className="mx-auto max-w-5xl space-y-6">
          <Link
            href="/dashboard/provider/consumables"
            className="text-sm font-medium text-[#B94B00] hover:text-[#E94F00]"
          >
            ← Quay lại danh sách Consumables
          </Link>

          {loading ? (
            <div className="rounded-2xl border border-[#E9DED2] bg-white p-10 text-center text-[#806F62]">
              Đang tải thông tin Consumable...
            </div>
          ) : error && !item ? (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
              {error}
            </div>
          ) : !item || !form ? (
            <div className="rounded-2xl border border-[#E9DED2] bg-white p-10 text-center">
              <h2 className="font-semibold text-[#49382D]">
                Không tìm thấy Consumable
              </h2>
              <p className="mt-2 text-sm text-[#806F62]">
                Consumable không tồn tại trong dữ liệu kiểm thử.
              </p>
            </div>
          ) : (
            <>
              <section className="flex flex-col justify-between gap-4 rounded-2xl border border-[#E9DED2] bg-white p-6 shadow-sm sm:flex-row sm:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold text-[#49382D]">
                      {item.name}
                    </h1>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "border border-[#E9DED2] bg-[#F8F1E7] text-[#806F62]"
                      }`}
                    >
                      {item.status === "ACTIVE" ? "Đang hoạt động" : "Ngừng hoạt động"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#806F62]">
                    {item.stockQuantity <= item.reorderLevel
                      ? "Cảnh báo: Tồn kho thấp"
                      : "Tồn kho bình thường"}
                  </p>
                </div>

                {!editing && (
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setSuccess("");
                      setEditing(true);
                    }}
                    className="rounded-xl bg-[#FF5A00] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#E94F00]"
                  >
                    Chỉnh sửa
                  </button>
                )}
              </section>

              {error && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  {success}
                </div>
              )}

              {editing ? (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-6 rounded-2xl border border-[#E9DED2] bg-white p-6 shadow-sm"
                >
                  <h2 className="border-b pb-3 text-lg font-semibold text-[#49382D]">
                    Chỉnh sửa Consumable
                  </h2>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-[#49382D]">
                        Tên Consumable *
                      </label>
                      <input
                        id="name"
                        required
                        value={form.name}
                        onChange={(event) => updateField("name", event.target.value)}
                        className="w-full rounded-xl border border-[#E9DED2] bg-white px-3 py-2.5 text-sm text-[#49382D] outline-none transition-colors focus:border-[#FF5A00] focus:ring-2 focus:ring-[#FFE1CC]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-[#49382D]">
                        Mô tả
                      </label>
                      <textarea
                        id="description"
                        rows={3}
                        value={form.description}
                        onChange={(event) => updateField("description", event.target.value)}
                        className="w-full rounded-xl border border-[#E9DED2] bg-white px-3 py-2.5 text-sm text-[#49382D] outline-none transition-colors focus:border-[#FF5A00] focus:ring-2 focus:ring-[#FFE1CC]"
                      />
                    </div>

                    <div>
                      <label htmlFor="stockQuantity" className="mb-1.5 block text-sm font-medium text-[#49382D]">
                        Số lượng tồn kho *
                      </label>
                      <input
                        id="stockQuantity"
                        type="number"
                        min="0"
                        step="1"
                        required
                        value={form.stockQuantity}
                        onChange={(event) => updateField("stockQuantity", Number(event.target.value))}
                        className="w-full rounded-xl border border-[#E9DED2] bg-white px-3 py-2.5 text-sm text-[#49382D] outline-none transition-colors focus:border-[#FF5A00] focus:ring-2 focus:ring-[#FFE1CC]"
                      />
                    </div>

                    <div>
                      <label htmlFor="reorderLevel" className="mb-1.5 block text-sm font-medium text-[#49382D]">
                        Ngưỡng tồn kho *
                      </label>
                      <input
                        id="reorderLevel"
                        type="number"
                        min="0"
                        step="1"
                        required
                        value={form.reorderLevel}
                        onChange={(event) => updateField("reorderLevel", Number(event.target.value))}
                        className="w-full rounded-xl border border-[#E9DED2] bg-white px-3 py-2.5 text-sm text-[#49382D] outline-none transition-colors focus:border-[#FF5A00] focus:ring-2 focus:ring-[#FFE1CC]"
                      />
                    </div>

                    <div>
                      <label htmlFor="unitPrice" className="mb-1.5 block text-sm font-medium text-[#49382D]">
                        Đơn giá (VNĐ) *
                      </label>
                      <input
                        id="unitPrice"
                        type="number"
                        min="0"
                        step="any"
                        required
                        value={form.unitPrice}
                        onChange={(event) => updateField("unitPrice", Number(event.target.value))}
                        className="w-full rounded-xl border border-[#E9DED2] bg-white px-3 py-2.5 text-sm text-[#49382D] outline-none transition-colors focus:border-[#FF5A00] focus:ring-2 focus:ring-[#FFE1CC]"
                      />
                    </div>

                    <div>
                      <label htmlFor="unit" className="mb-1.5 block text-sm font-medium text-[#49382D]">
                        Đơn vị tính *
                      </label>
                      <input
                        id="unit"
                        required
                        value={form.unit}
                        onChange={(event) => updateField("unit", event.target.value)}
                        placeholder="Ví dụ: cuộn, hộp, tờ"
                        className="w-full rounded-xl border border-[#E9DED2] bg-white px-3 py-2.5 text-sm text-[#49382D] outline-none transition-colors focus:border-[#FF5A00] focus:ring-2 focus:ring-[#FFE1CC]"
                      />
                    </div>

                    <div>
                      <label htmlFor="expiryDate" className="mb-1.5 block text-sm font-medium text-[#49382D]">
                        Hạn sử dụng
                      </label>
                      <input
                        id="expiryDate"
                        type="date"
                        value={form.expiryDate}
                        onChange={(event) => updateField("expiryDate", event.target.value)}
                        className="w-full rounded-xl border border-[#E9DED2] bg-white px-3 py-2.5 text-sm text-[#49382D] outline-none transition-colors focus:border-[#FF5A00] focus:ring-2 focus:ring-[#FFE1CC]"
                      />
                    </div>

                    <div>
                      <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-[#49382D]">
                        Trạng thái
                      </label>
                      <select
                        id="status"
                        value={form.status}
                        onChange={(event) =>
                          updateField("status", event.target.value as ConsumableFormData["status"])
                        }
                        className="w-full rounded-xl border border-[#E9DED2] bg-white px-3 py-2.5 text-sm text-[#49382D] outline-none transition-colors focus:border-[#FF5A00] focus:ring-2 focus:ring-[#FFE1CC]"
                      >
                        <option value="ACTIVE">Đang hoạt động</option>
                        <option value="INACTIVE">Ngừng hoạt động</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-3 border-t pt-5">
                    <button
                      type="button"
                      onClick={() => {
                        setForm({
                          name: item.name,
                          description: item.description,
                          stockQuantity: item.stockQuantity,
                          reorderLevel: item.reorderLevel,
                          unitPrice: item.unitPrice,
                          unit: item.unit,
                          expiryDate: item.expiryDate,
                          status: item.status,
                        });
                        setEditing(false);
                        setError("");
                      }}
                      disabled={saving}
                      className="rounded-xl border border-[#DCCBBB] px-4 py-2.5 text-sm font-medium text-[#806F62] hover:bg-[#FFF9F2] disabled:opacity-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-xl bg-[#FF5A00] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#E94F00] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <section className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-[#E9DED2] bg-white p-5 shadow-sm">
                      <p className="text-sm text-[#806F62]">Số lượng tồn kho</p>
                      <p className="mt-2 text-2xl font-bold text-[#49382D]">
                        {item.stockQuantity} {item.unit}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[#E9DED2] bg-white p-5 shadow-sm">
                      <p className="text-sm text-[#806F62]">Ngưỡng tồn kho</p>
                      <p className="mt-2 text-2xl font-bold text-[#49382D]">
                        {item.reorderLevel} {item.unit}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[#E9DED2] bg-white p-5 shadow-sm">
                      <p className="text-sm text-[#806F62]">Đơn giá</p>
                      <p className="mt-2 text-2xl font-bold text-[#FF5A00]">
                        {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                  </section>

                  <section className="space-y-5 rounded-2xl border border-[#E9DED2] bg-white p-6 shadow-sm">
                    <h2 className="border-b pb-3 text-lg font-semibold text-[#49382D]">
                      Thông tin cơ bản
                    </h2>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <InfoItem label="Tên Consumable" value={item.name} />
                      <InfoItem label="Đơn vị tính" value={item.unit} />
                      <InfoItem label="Mô tả" value={item.description} />
                      <InfoItem label="Hạn sử dụng" value={formatDate(item.expiryDate)} />
                      <InfoItem label="Trạng thái" value={item.status === "ACTIVE" ? "Đang hoạt động" : "Ngừng hoạt động"} />
                      <InfoItem
                        label="Tình trạng tồn kho"
                        value={item.stockQuantity <= item.reorderLevel ? "Tồn kho thấp - cần bổ sung" : "Tồn kho bình thường"}
                      />
                    </div>
                  </section>

                  <section className="rounded-2xl border border-[#E9DED2] bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-[#49382D]">
                      Lịch sử dữ liệu
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <InfoItem
                        label="Ngày tạo"
                        value={new Date(item.createdAt).toLocaleString("vi-VN")}
                      />
                      <InfoItem
                        label="Cập nhật gần nhất"
                        value={new Date(item.updatedAt).toLocaleString("vi-VN")}
                      />
                    </div>
                  </section>
                </>
              )}

              <p className="text-xs text-[#806F62]">
                Dữ liệu hiện được lưu trên localStorage để kiểm thử giao diện frontend.
              </p>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
    );
}

export default function ConsumableDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-[#806F62]">
          Đang tải thông tin Consumable...
        </div>
      }
    >
      <ConsumableDetailContent />
    </Suspense>
  );
}