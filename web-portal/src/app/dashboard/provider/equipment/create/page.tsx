"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { providerInventoryLocalService } from "@/services/provider-inventory.local.service";
import { creativeSpaceService } from "@/services/creative-space.service";
import type {
  EquipmentCondition,
  EquipmentStatus,
  MaintenanceStatus,
  EquipmentFormData,
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
  "w-full rounded-lg border border-[#E9DED2] px-3 py-2.5 text-sm outline-none focus:border-[#FF5A00] focus:ring-2 focus:ring-[#FF5A00]/15";

const labelClass = "mb-1.5 block text-sm font-medium text-[#49382D]";

export default function CreateEquipmentPage() {
  const router = useRouter();

  const [spaces, setSpaces] = useState<CreativeSpace[]>([]);
  const [loadingSpaces, setLoadingSpaces] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [condition, setCondition] = useState<EquipmentCondition>("NEW");
  const [status, setStatus] = useState<EquipmentStatus>("AVAILABLE");
  const [rentalPrice, setRentalPrice] = useState("0");

  const [maintenanceStatus, setMaintenanceStatus] =
    useState<MaintenanceStatus>("NOT_REQUIRED");
  const [maintenanceNote, setMaintenanceNote] = useState("");
  const [lastMaintenanceDate, setLastMaintenanceDate] = useState("");
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState("");

  const [relatedCreativeSpaceId, setRelatedCreativeSpaceId] = useState("");
  const [imagesText, setImagesText] = useState("");
  const [packageText, setPackageText] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSpaces() {
      try {
        const data = await creativeSpaceService.getAll();

        if (active) {
          setSpaces(data.filter((space) => space.status === "ACTIVE"));
        }
      } catch {
        if (active) {
          setError("Không thể tải danh sách Creative Space.");
        }
      } finally {
        if (active) setLoadingSpaces(false);
      }
    }

    loadSpaces();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name.trim() || !category.trim()) {
      setError("Vui lòng nhập tên thiết bị và danh mục.");
      return;
    }

    const price = Number(rentalPrice);

    if (!Number.isFinite(price) || price < 0) {
      setError("Giá thuê phải là số hợp lệ và không được nhỏ hơn 0.");
      return;
    }

    if (
      lastMaintenanceDate &&
      nextMaintenanceDate &&
      nextMaintenanceDate < lastMaintenanceDate
    ) {
      setError("Ngày bảo trì tiếp theo không được trước ngày bảo trì gần nhất.");
      return;
    }

    const data: EquipmentFormData = {
      name: name.trim(),
      description: description.trim(),
      category: category.trim().toUpperCase(),
      brand: brand.trim(),
      model: model.trim(),
      condition,
      status,
      rentalPrice: price,
      maintenanceStatus,
      maintenanceNote: maintenanceNote.trim(),
      lastMaintenanceDate,
      nextMaintenanceDate,
      relatedCreativeSpaceId,
      images: imagesText
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean),
      packageCompatibility: packageText
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean),
    };

    try {
      setSaving(true);
      await providerInventoryLocalService.createEquipment(data);
      router.push("/dashboard/provider/equipment");
    } catch {
      setError("Không thể lưu thiết bị. Vui lòng thử lại.");
      setSaving(false);
    }
  }

  return (
    <ProtectedRoute allowedRoles={["SERVICE_PROVIDER"]}>
      <DashboardLayout title="Thêm thiết bị">
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <Link
              href="/dashboard/provider/equipment"
              className="text-sm font-medium text-[#FF5A00] hover:text-[#E94F00]"
            >
              ← Quay lại danh sách thiết bị
            </Link>

            <h1 className="mt-4 text-2xl font-bold text-[#49382D]">
              Thêm thiết bị mới
            </h1>
            <p className="mt-1 text-sm text-[#806F62]">
              Nhập thông tin và thiết lập quản lý thiết bị của nhà cung cấp.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-xl border border-[#E9DED2] bg-white p-6 shadow-sm"
          >
            <section className="space-y-4">
              <h2 className="border-b border-[#E9DED2] pb-3 text-lg font-semibold text-[#49382D]">
                Thông tin cơ bản
              </h2>

              <div>
                <label htmlFor="name" className={labelClass}>
                  Tên thiết bị *
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  maxLength={150}
                  placeholder="Ví dụ: Máy ảnh Canon AE-1"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="description" className={labelClass}>
                  Mô tả
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="Mô tả đặc điểm và thông tin thiết bị..."
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
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    required
                    maxLength={100}
                    placeholder="Ví dụ: FILM_CAMERA, LENS, LIGHTING"
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
                    value={rentalPrice}
                    onChange={(event) => setRentalPrice(event.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="border-b border-[#E9DED2] pb-3 text-lg font-semibold text-[#49382D]">
                Thông tin kỹ thuật và trạng thái
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="brand" className={labelClass}>
                    Thương hiệu
                  </label>
                  <input
                    id="brand"
                    value={brand}
                    onChange={(event) => setBrand(event.target.value)}
                    maxLength={100}
                    placeholder="Canon, Sony, Nikon..."
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="model" className={labelClass}>
                    Model
                  </label>
                  <input
                    id="model"
                    value={model}
                    onChange={(event) => setModel(event.target.value)}
                    maxLength={100}
                    placeholder="AE-1, EOS R6..."
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="condition" className={labelClass}>
                    Tình trạng thiết bị
                  </label>
                  <select
                    id="condition"
                    value={condition}
                    onChange={(event) =>
                      setCondition(event.target.value as EquipmentCondition)
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
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as EquipmentStatus)
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
              <h2 className="border-b border-[#E9DED2] pb-3 text-lg font-semibold text-[#49382D]">
                Thông tin bảo trì
              </h2>

              <div>
                <label htmlFor="maintenanceStatus" className={labelClass}>
                  Trạng thái bảo trì
                </label>
                <select
                  id="maintenanceStatus"
                  value={maintenanceStatus}
                  onChange={(event) =>
                    setMaintenanceStatus(
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
                  value={maintenanceNote}
                  onChange={(event) => setMaintenanceNote(event.target.value)}
                  rows={2}
                  maxLength={1000}
                  placeholder="Thông tin hoặc ghi chú liên quan đến bảo trì..."
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
                    value={lastMaintenanceDate}
                    onChange={(event) =>
                      setLastMaintenanceDate(event.target.value)
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
                    value={nextMaintenanceDate}
                    onChange={(event) =>
                      setNextMaintenanceDate(event.target.value)
                    }
                    min={lastMaintenanceDate || undefined}
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="border-b border-[#E9DED2] pb-3 text-lg font-semibold text-[#49382D]">
                Liên kết và thông tin bổ sung
              </h2>

              <div>
                <label htmlFor="creativeSpace" className={labelClass}>
                  Creative Space liên quan
                </label>
                <select
                  id="creativeSpace"
                  value={relatedCreativeSpaceId}
                  onChange={(event) =>
                    setRelatedCreativeSpaceId(event.target.value)
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
                <p className="mt-1 text-xs text-[#806F62]">
                  Chỉ hiển thị Creative Space đang hoạt động.
                </p>
              </div>

              <div>
                <label htmlFor="images" className={labelClass}>
                  Hình ảnh thiết bị
                </label>
                <textarea
                  id="images"
                  value={imagesText}
                  onChange={(event) => setImagesText(event.target.value)}
                  rows={2}
                  placeholder="Nhập URL hình ảnh, mỗi URL trên một dòng hoặc cách nhau bằng dấu phẩy"
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-[#806F62]">
                  Hiện lưu danh sách URL để phục vụ cấu trúc dữ liệu frontend.
                </p>
              </div>

              <div>
                <label htmlFor="packages" className={labelClass}>
                  Package tương thích
                </label>
                <textarea
                  id="packages"
                  value={packageText}
                  onChange={(event) => setPackageText(event.target.value)}
                  rows={2}
                  placeholder="Nhập tên hoặc mã package, phân cách bằng dấu phẩy"
                  className={inputClass}
                />
              </div>
            </section>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <div className="rounded-lg border border-[#E9DED2] bg-[#FFF9F2] p-4 text-sm text-[#806F62]">
              <p className="font-semibold">Chế độ dữ liệu kiểm thử</p>
              <p className="mt-1">
                Thông tin được lưu trên trình duyệt bằng localStorage. Chức
                năng này chưa gửi dữ liệu lên Resource API.
              </p>
            </div>

            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
              <Link
                href="/dashboard/provider/equipment"
                className="rounded-lg border border-[#E9DED2] px-5 py-2.5 text-center text-sm font-medium text-[#49382D] hover:bg-[#FFF9F2]"
              >
                Hủy
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#FF5A00] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#E94F00] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Đang lưu..." : "Lưu thiết bị"}
              </button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
