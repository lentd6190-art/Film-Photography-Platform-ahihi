"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { providerInventoryLocalService } from "@/services/provider-inventory.local.service";
import { creativeSpaceService } from "@/services/creative-space.service";
import type { Equipment } from "@/types/provider-inventory";
import type { CreativeSpace } from "@/types/creative-space";

const statusLabels: Record<Equipment["status"], string> = {
  AVAILABLE: "Sẵn sàng",
  RENTED: "Đang được thuê",
  MAINTENANCE: "Đang bảo trì",
  INACTIVE: "Ngừng hoạt động",
};

const conditionLabels: Record<Equipment["condition"], string> = {
  NEW: "Mới",
  EXCELLENT: "Rất tốt",
  GOOD: "Tốt",
  FAIR: "Trung bình",
  POOR: "Kém",
  DAMAGED: "Hư hỏng",
};

const maintenanceLabels: Record<Equipment["maintenanceStatus"], string> = {
  NOT_REQUIRED: "Không cần bảo trì",
  SCHEDULED: "Đã lên lịch",
  IN_PROGRESS: "Đang thực hiện",
  OVERDUE: "Quá hạn bảo trì",
};

const statusStyles: Record<Equipment["status"], string> = {
  AVAILABLE: "border border-green-200 bg-green-50 text-green-700",
  RENTED: "border border-[#FFD6B8] bg-[#FFF1E5] text-[#B94B00]",
  MAINTENANCE: "border border-amber-200 bg-amber-50 text-amber-700",
  INACTIVE: "border border-gray-200 bg-gray-100 text-gray-600",
};

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 whitespace-pre-wrap font-medium text-[#49382D]">
        {value || "Chưa cập nhật"}
      </p>
    </div>
  );
}

function formatDate(value: string) {
  if (!value) return "Chưa cập nhật";
  return new Date(value + "T00:00:00").toLocaleDateString("vi-VN");
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + " đ";
}

function EquipmentDetailContent() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [spaces, setSpaces] = useState<CreativeSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [item, spaceList] = await Promise.all([
          providerInventoryLocalService.getEquipmentById(id),
          creativeSpaceService.getAll(),
        ]);

        if (!active) return;

        setEquipment(item);
        setSpaces(spaceList);
      } catch {
        if (active) setError("Không thể tải thông tin thiết bị.");
      } finally {
        if (active) setLoading(false);
      }
    }

    if (id) loadData();

    return () => {
      active = false;
    };
  }, [id]);

  const relatedSpace = spaces.find(
    (space) => space.id === equipment?.relatedCreativeSpaceId,
  );

  return (
    <ProtectedRoute allowedRoles={["SERVICE_PROVIDER"]}>
      <DashboardLayout title="Chi tiết Equipment">
        <div className="mx-auto max-w-5xl space-y-6">
          <Link
            href="/dashboard/provider/equipment"
            className="text-sm font-medium text-[#806F62] hover:text-[#49382D]"
          >
            ← Quay lại danh sách thiết bị
          </Link>

          {loading ? (
            <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
              Đang tải thông tin thiết bị...
            </div>
          ) : error ? (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
              {error}
            </div>
          ) : !equipment ? (
            <div className="rounded-xl border bg-white p-10 text-center">
              <h2 className="font-semibold text-[#49382D]">
                Không tìm thấy thiết bị
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Thiết bị không tồn tại trong dữ liệu kiểm thử.
              </p>
            </div>
          ) : (
            <>
              <section className="flex flex-col justify-between gap-4 rounded-2xl border border-[#E9DED2] bg-white p-6 shadow-sm sm:flex-row sm:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold text-[#49382D]">
                      {equipment.name}
                    </h1>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[equipment.status]}`}>
                      {statusLabels[equipment.status]}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    {equipment.category}
                    {equipment.brand ? ` · ${equipment.brand}` : ""}
                    {equipment.model ? ` · ${equipment.model}` : ""}
                  </p>
                </div>

                <Link
                  href={`/dashboard/provider/equipment/${equipment.id}/edit`}
                  className="rounded-xl bg-[#FF5A00] px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[#E94F00]"
                >
                  Chỉnh sửa thiết bị
                </Link>
              </section>

              <section className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#E9DED2] bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Giá thuê</p>
                  <p className="mt-2 text-2xl font-bold text-[#FF5A00]">
                    {formatPrice(equipment.rentalPrice)}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#E9DED2] bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Tình trạng thiết bị</p>
                  <p className="mt-2 text-2xl font-bold text-[#49382D]">
                    {conditionLabels[equipment.condition]}
                  </p>
                </div>
              </section>

              <section className="space-y-5 rounded-2xl border border-[#E9DED2] bg-white p-6 shadow-sm">
                <h2 className="border-b border-[#E9DED2] pb-3 text-lg font-semibold text-[#49382D]">
                  Thông tin cơ bản
                </h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <InfoItem label="Tên thiết bị" value={equipment.name} />
                  <InfoItem label="Danh mục" value={equipment.category} />
                  <InfoItem label="Thương hiệu" value={equipment.brand} />
                  <InfoItem label="Model" value={equipment.model} />
                  <InfoItem label="Mô tả" value={equipment.description} />
                  <InfoItem
                    label="Creative Space liên quan"
                    value={relatedSpace?.name || "Không liên kết"}
                  />
                </div>
              </section>

              <section className="space-y-5 rounded-2xl border border-[#E9DED2] bg-white p-6 shadow-sm">
                <h2 className="border-b border-[#E9DED2] pb-3 text-lg font-semibold text-[#49382D]">
                  Thông tin bảo trì
                </h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <InfoItem
                    label="Trạng thái bảo trì"
                    value={maintenanceLabels[equipment.maintenanceStatus]}
                  />
                  <InfoItem
                    label="Ngày bảo trì gần nhất"
                    value={formatDate(equipment.lastMaintenanceDate)}
                  />
                  <InfoItem
                    label="Ngày bảo trì tiếp theo"
                    value={formatDate(equipment.nextMaintenanceDate)}
                  />
                  <InfoItem
                    label="Ghi chú bảo trì"
                    value={equipment.maintenanceNote}
                  />
                </div>
              </section>

              <section className="space-y-5 rounded-2xl border border-[#E9DED2] bg-white p-6 shadow-sm">
                <h2 className="border-b border-[#E9DED2] pb-3 text-lg font-semibold text-[#49382D]">
                  Thông tin bổ sung
                </h2>

                <div>
                  <p className="text-sm text-gray-500">Package tương thích</p>
                  {equipment.packageCompatibility.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {equipment.packageCompatibility.map((item, index) => (
                        <span
                          key={`${item}-${index}`}
                          className="rounded-full border border-[#FFD6B8] bg-[#FFF1E5] px-3 py-1 text-sm text-[#B94B00]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-[#806F62]">Chưa có thông tin</p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500">Hình ảnh</p>
                  {equipment.images.length > 0 ? (
                    <ul className="mt-2 space-y-2">
                      {equipment.images.map((image, index) => (
                        <li key={`${image}-${index}`}>
                          <a
                            href={image}
                            target="_blank"
                            rel="noreferrer"
                            className="break-all text-sm text-[#B94B00] hover:underline"
                          >
                            {image}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-sm text-[#806F62]">
                      Chưa có hình ảnh
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-[#E9DED2] bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-[#49382D]">
                  Lịch sử dữ liệu
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoItem
                    label="Ngày tạo"
                    value={new Date(equipment.createdAt).toLocaleString("vi-VN")}
                  />
                  <InfoItem
                    label="Cập nhật gần nhất"
                    value={new Date(equipment.updatedAt).toLocaleString("vi-VN")}
                  />
                </div>
              </section>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
    );
}

export default function EquipmentDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-gray-500">
          Đang tải thông tin thiết bị...
        </div>
      }
    >
      <EquipmentDetailContent />
    </Suspense>
  );
}