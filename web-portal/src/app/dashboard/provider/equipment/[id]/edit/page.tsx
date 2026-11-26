"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { providerInventoryLocalService } from "@/services/provider-inventory.local.service";
import { creativeSpaceService } from "@/services/creative-space.service";
import type {
  Equipment,
  EquipmentCondition,
  EquipmentFormData,
  EquipmentStatus,
  MaintenanceStatus,
} from "@/types/provider-inventory";
import type { CreativeSpace } from "@/types/creative-space";

const CONDITIONS: { value: EquipmentCondition; label: string }[] = [
  { value: "NEW", label: "Mới" },
  { value: "EXCELLENT", label: "Rất tốt" },
  { value: "GOOD", label: "Tốt" },
  { value: "FAIR", label: "Trung bình" },
  { value: "POOR", label: "Kém" },
  { value: "DAMAGED", label: "Hư hỏng" },
];

const STATUSES: { value: EquipmentStatus; label: string }[] = [
  { value: "AVAILABLE", label: "Sẵn sàng" },
  { value: "RENTED", label: "Đang được thuê" },
  { value: "MAINTENANCE", label: "Đang bảo trì" },
  { value: "INACTIVE", label: "Ngừng hoạt động" },
];

const MAINTENANCE_STATUSES: {
  value: MaintenanceStatus;
  label: string;
}[] = [
  { value: "NOT_REQUIRED", label: "Không cần bảo trì" },
  { value: "SCHEDULED", label: "Đã lên lịch" },
  { value: "IN_PROGRESS", label: "Đang thực hiện" },
  { value: "OVERDUE", label: "Quá hạn bảo trì" },
];

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

function toFormData(item: Equipment): EquipmentFormData {
  return {
    name: item.name ?? "",
    category: item.category ?? "",
    description: item.description ?? "",
    brand: item.brand ?? "",
    model: item.model ?? "",
    condition: item.condition,
    status: item.status,
    rentalPrice: item.rentalPrice,
    maintenanceStatus: item.maintenanceStatus,
    maintenanceNote: item.maintenanceNote ?? "",
    lastMaintenanceDate: item.lastMaintenanceDate ?? "",
    nextMaintenanceDate: item.nextMaintenanceDate ?? "",
    relatedCreativeSpaceId: item.relatedCreativeSpaceId ?? "",
    images: item.images ?? [],
    packageCompatibility: item.packageCompatibility ?? [],
  };
}

function parseList(value: string): string[] {
  return [...new Set(
    value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean),
  )];
}

function EquipmentEditContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [form, setForm] = useState<EquipmentFormData | null>(null);
  const [spaces, setSpaces] = useState<CreativeSpace[]>([]);

  const [imagesText, setImagesText] = useState("");
  const [packageText, setPackageText] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingSpaces, setLoadingSpaces] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setLoadingSpaces(true);
      setError("");

      let relatedCreativeSpaceId = "";

      try {
        const item = await providerInventoryLocalService.getEquipmentById(id);

        if (!active) return;

        if (!item) {
          setEquipment(null);
          setForm(null);
          setError("Không tìm thấy thiết bị này.");
        } else {
          relatedCreativeSpaceId = item.relatedCreativeSpaceId;

          setEquipment(item);
          setForm(toFormData(item));
          setImagesText((item.images ?? []).join("\n"));
          setPackageText((item.packageCompatibility ?? []).join("\n"));
        }
      } catch {
        if (active) {
          setError("Không thể tải thông tin thiết bị.");
        }
      } finally {
        if (active) setLoading(false);
      }

      try {
        const data = await creativeSpaceService.getAll();

        if (active) {
          setSpaces(
            data.filter(
              (space) =>
                space.status === "ACTIVE" ||
                space.id === relatedCreativeSpaceId,
            ),
          );
        }
      } catch {
        if (active) {
          setError("Không thể tải danh sách Creative Space.");
        }
      } finally {
        if (active) setLoadingSpaces(false);
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, [id]);
  function updateField<K extends keyof EquipmentFormData>(
    field: K,
    value: EquipmentFormData[K],
  ) {
    setForm((previous) =>
      previous ? { ...previous, [field]: value } : previous,
    );
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!equipment || !form || saving) return;

    const name = form.name.trim();
    const category = form.category.trim();
    const price = Number(form.rentalPrice);

    if (!name || !category) {
      setError("Vui lòng nhập tên thiết bị và danh mục.");
      return;
    }

    if (name.length > 150 || category.length > 100) {
      setError("Tên thiết bị tối đa 150 ký tự, danh mục tối đa 100 ký tự.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("Giá thuê phải là số hợp lệ và không được nhỏ hơn 0.");
      return;
    }

    if (
      form.lastMaintenanceDate &&
      form.nextMaintenanceDate &&
      form.nextMaintenanceDate < form.lastMaintenanceDate
    ) {
      setError("Ngày bảo trì tiếp theo không được trước ngày bảo trì gần nhất.");
      return;
    }

    const submission: EquipmentFormData = {
      ...form,
      name,
      category: category.toUpperCase(),
      description: form.description.trim(),
      brand: form.brand.trim(),
      model: form.model.trim(),
      rentalPrice: price,
      maintenanceNote: form.maintenanceNote.trim(),
      images: parseList(imagesText),
      packageCompatibility: parseList(packageText),
    };

    setSaving(true);
    setError("");

    try {
      await providerInventoryLocalService.updateEquipment(
        equipment.id,
        submission,
      );

      router.push(`/dashboard/provider/equipment/${equipment.id}`);
    } catch {
      setError("Không thể cập nhật thiết bị. Vui lòng thử lại.");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Chỉnh sửa thiết bị">
        <div className="flex min-h-[300px] items-center justify-center">
          <p className="text-sm text-gray-500">Đang tải thông tin thiết bị...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!equipment || !form) {
    return (
      <DashboardLayout title="Chỉnh sửa thiết bị">
        <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-8 text-center">
          <h1 className="text-xl font-semibold text-gray-900">
            Không tìm thấy thiết bị
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {error || "Thiết bị không tồn tại hoặc không thể truy cập."}
          </p>
          <Link
            href="/dashboard/provider/equipment"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white"
          >
            Quay lại danh sách
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Chỉnh sửa thiết bị">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <Link
            href={`/dashboard/provider/equipment/${equipment.id}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Quay lại chi tiết thiết bị
          </Link>

          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Chỉnh sửa thiết bị
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Cập nhật thông tin và trạng thái thiết bị.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <fieldset disabled={saving} className="space-y-6">
            <section className="space-y-4">
              <h2 className="border-b border-gray-100 pb-3 text-lg font-semibold text-gray-900">
                Thông tin cơ bản
              </h2>

              <div>
                <label htmlFor="name" className={labelClass}>
                  Tên thiết bị *
                </label>
                <input
                  id="name"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  required
                  maxLength={150}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="description" className={labelClass}>
                  Mô tả
                </label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  rows={3}
                  maxLength={1000}
                  className={inputClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="category" className={labelClass}>
                    Danh mục *
                  </label>
                  <input
                    id="category"
                    value={form.category}
                    onChange={(event) =>
                      updateField("category", event.target.value)
                    }
                    required
                    maxLength={100}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="rentalPrice" className={labelClass}>
                    Giá thuê (VNĐ)
                  </label>
                  <input
                    id="rentalPrice"
                    type="number"
                    min="0"
                    step="1"
                    value={form.rentalPrice}
                    onChange={(event) =>
                      updateField("rentalPrice", Number(event.target.value))
                    }
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="brand" className={labelClass}>
                    Thương hiệu
                  </label>
                  <input
                    id="brand"
                    value={form.brand}
                    onChange={(event) => updateField("brand", event.target.value)}
                    maxLength={100}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="model" className={labelClass}>
                    Model
                  </label>
                  <input
                    id="model"
                    value={form.model}
                    onChange={(event) => updateField("model", event.target.value)}
                    maxLength={100}
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="border-b border-gray-100 pb-3 text-lg font-semibold text-gray-900">
                Tình trạng và trạng thái
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="condition" className={labelClass}>
                    Tình trạng thiết bị
                  </label>
                  <select
                    id="condition"
                    value={form.condition}
                    onChange={(event) =>
                      updateField(
                        "condition",
                        event.target.value as EquipmentCondition,
                      )
                    }
                    className={inputClass}
                  >
                    {CONDITIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className={labelClass}>
                    Trạng thái hoạt động
                  </label>
                  <select
                    id="status"
                    value={form.status}
                    onChange={(event) =>
                      updateField(
                        "status",
                        event.target.value as EquipmentStatus,
                      )
                    }
                    className={inputClass}
                  >
                    {STATUSES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="border-b border-gray-100 pb-3 text-lg font-semibold text-gray-900">
                Thông tin bảo trì
              </h2>

              <div>
                <label htmlFor="maintenanceStatus" className={labelClass}>
                  Trạng thái bảo trì
                </label>
                <select
                  id="maintenanceStatus"
                  value={form.maintenanceStatus}
                  onChange={(event) =>
                    updateField(
                      "maintenanceStatus",
                      event.target.value as MaintenanceStatus,
                    )
                  }
                  className={inputClass}
                >
                  {MAINTENANCE_STATUSES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="maintenanceNote" className={labelClass}>
                  Ghi chú bảo trì
                </label>
                <textarea
                  id="maintenanceNote"
                  value={form.maintenanceNote}
                  onChange={(event) =>
                    updateField("maintenanceNote", event.target.value)
                  }
                  rows={2}
                  maxLength={1000}
                  className={inputClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="lastMaintenanceDate" className={labelClass}>
                    Ngày bảo trì gần nhất
                  </label>
                  <input
                    id="lastMaintenanceDate"
                    type="date"
                    value={form.lastMaintenanceDate}
                    onChange={(event) =>
                      updateField("lastMaintenanceDate", event.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="nextMaintenanceDate" className={labelClass}>
                    Ngày bảo trì tiếp theo
                  </label>
                  <input
                    id="nextMaintenanceDate"
                    type="date"
                    value={form.nextMaintenanceDate}
                    min={form.lastMaintenanceDate || undefined}
                    onChange={(event) =>
                      updateField("nextMaintenanceDate", event.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="border-b border-gray-100 pb-3 text-lg font-semibold text-gray-900">
                Liên kết và thông tin bổ sung
              </h2>

              <div>
                <label htmlFor="creativeSpace" className={labelClass}>
                  Creative Space liên quan
                </label>
                <select
                  id="creativeSpace"
                  value={form.relatedCreativeSpaceId}
                  onChange={(event) =>
                    updateField("relatedCreativeSpaceId", event.target.value)
                  }
                  disabled={loadingSpaces}
                  className={inputClass}
                >
                  <option value="">
                    {loadingSpaces
                      ? "Đang tải Creative Space..."
                      : "Không liên kết Creative Space"}
                  </option>
                  {spaces.map((space) => (
                    <option key={space.id} value={space.id}>
                      {space.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="images" className={labelClass}>
                  Hình ảnh thiết bị
                </label>
                <textarea
                  id="images"
                  value={imagesText}
                  onChange={(event) => setImagesText(event.target.value)}
                  rows={3}
                  className={inputClass}
                  placeholder="Mỗi URL trên một dòng hoặc cách nhau bằng dấu phẩy"
                />
              </div>

              <div>
                <label htmlFor="packages" className={labelClass}>
                  Package tương thích
                </label>
                <textarea
                  id="packages"
                  value={packageText}
                  onChange={(event) => setPackageText(event.target.value)}
                  rows={3}
                  className={inputClass}
                  placeholder="Mỗi package trên một dòng hoặc cách nhau bằng dấu phẩy"
                />
              </div>
            </section>
          </fieldset>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            <p className="font-semibold">Chế độ dữ liệu kiểm thử</p>
            <p className="mt-1">
              Thay đổi được lưu trên trình duyệt bằng localStorage, chưa gửi
              dữ liệu lên Resource API.
            </p>
          </div>

          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <Link
              href={`/dashboard/provider/equipment/${equipment.id}`}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default function EditEquipmentPage() {
  return (
    <ProtectedRoute allowedRoles={["SERVICE_PROVIDER"]}>
      <Suspense
        fallback={
          <DashboardLayout title="Chỉnh sửa thiết bị">
            <p className="p-6 text-sm text-gray-500">Đang tải trang...</p>
          </DashboardLayout>
        }
      >
        <EquipmentEditContent />
      </Suspense>
    </ProtectedRoute>
  );
}
