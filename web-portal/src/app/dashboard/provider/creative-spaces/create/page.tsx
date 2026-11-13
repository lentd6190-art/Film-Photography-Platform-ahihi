
"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";

import { creativeSpaceService } from "@/services/creative-space.service";
import type {
  CreativeSpaceFormData,
  CreativeSpaceType,
} from "@/types/creative-space";

const initialForm: CreativeSpaceFormData = {
  name: "",
  type: "DARKROOM",
  description: "",
  dimensions: "",
  capacity: 1,
  artisticStyle: "",
  lighting: "",
  ventilation: "",
  acoustics: "",
  facilities: [],
  amenities: [],
  operatingHours: "",
  policies: "",
  priceAmount: 0,
  currency: "VND",
  pricingUnit: "HOUR",
  images: [],
  location: "",
};

function parseList(value: string): string[] {
  return [...new Set(
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  )];
}

function isValidImageUrl(imageUrl: string): boolean {
  try {
    const url = new URL(imageUrl);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      Boolean(url.hostname)
    );
  } catch {
    return false;
  }
}

function PreviewImage({ imageUrl }: { imageUrl: string }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100">
      {!imageError ? (
        <Image
          src={imageUrl}
          alt="Ảnh xem trước Creative Space"
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, 33vw"
          className="object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
          <span className="text-3xl" aria-hidden="true">
            📷
          </span>
          <span className="text-xs">Không thể tải hình ảnh</span>
        </div>
      )}
    </div>
  );
}

function CreateCreativeSpaceForm() {
  const router = useRouter();

  const [form, setForm] = useState<CreativeSpaceFormData>(initialForm);
  const [facilitiesText, setFacilitiesText] = useState("");
  const [amenitiesText, setAmenitiesText] = useState("");
  const [imagesText, setImagesText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const imageUrls = useMemo(
    () => parseList(imagesText),
    [imagesText],
  );

  const invalidImageUrls = useMemo(
    () => imageUrls.filter((url) => !isValidImageUrl(url)),
    [imageUrls],
  );

  const validImageUrls = useMemo(
    () => imageUrls.filter(isValidImageUrl),
    [imageUrls],
  );

  function updateField<K extends keyof CreativeSpaceFormData>(
    field: K,
    value: CreativeSpaceFormData[K],
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    setError("");

    const name = form.name.trim();
    const description = form.description.trim();
    const dimensions = form.dimensions.trim();
    const location = form.location.trim();
    const capacity = Number(form.capacity);
    const priceAmount = Number(form.priceAmount);

    // Kiểm tra thông tin cơ bản.
    if (name.length < 3 || name.length > 150) {
      setError("Tên Creative Space phải có từ 3 đến 150 ký tự.");
      return;
    }

    if (description.length < 10 || description.length > 2000) {
      setError("Mô tả phải có từ 10 đến 2000 ký tự.");
      return;
    }

    if (!dimensions || dimensions.length > 100) {
      setError("Vui lòng nhập kích thước hợp lệ (tối đa 100 ký tự).");
      return;
    }

    if (!location || location.length > 255) {
      setError("Vui lòng nhập địa điểm hợp lệ (tối đa 255 ký tự).");
      return;
    }

    // Kiểm tra sức chứa.
    if (!Number.isInteger(capacity) || capacity < 1) {
      setError("Sức chứa phải là số nguyên lớn hơn 0.");
      return;
    }

    // Kiểm tra giá thuê.
    if (!Number.isFinite(priceAmount) || priceAmount <= 0) {
      setError("Giá thuê phải là số lớn hơn 0.");
      return;
    }

    // Kiểm tra URL hình ảnh.
    if (invalidImageUrls.length > 0) {
      setError(
        `Có ${invalidImageUrls.length} URL hình ảnh không hợp lệ. Vui lòng kiểm tra lại.`,
      );
      return;
    }

    const submission: CreativeSpaceFormData = {
      ...form,
      name,
      description,
      dimensions,
      location,
      capacity,
      priceAmount,
      artisticStyle: form.artisticStyle.trim(),
      lighting: form.lighting.trim(),
      ventilation: form.ventilation.trim(),
      acoustics: form.acoustics.trim(),
      operatingHours: form.operatingHours.trim(),
      policies: form.policies.trim(),
      facilities: parseList(facilitiesText),
      amenities: parseList(amenitiesText),
      images: validImageUrls,
    };

    try {
      setIsSubmitting(true);

      await creativeSpaceService.create(submission);

      router.push("/dashboard/provider/creative-spaces");
    } catch {
      setError("Không thể tạo Creative Space. Vui lòng thử lại.");
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelClass = "block text-sm font-medium text-gray-700";

  return (
    <DashboardLayout title="Tạo Creative Space">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Tiêu đề */}
        <div>
          <Link
            href="/dashboard/provider/creative-spaces"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            ← Quay lại danh sách
          </Link>

          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Tạo Creative Space mới
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Điền thông tin để đăng ký Darkroom hoặc Studio của bạn.
          </p>
        </div>

        {/* Thông báo lỗi */}
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-xl bg-white p-6 shadow-sm"
        >
          {/* Thông tin cơ bản */}
          <section className="space-y-4">
            <h3 className="border-b pb-3 text-lg font-semibold text-gray-900">
              Thông tin cơ bản
            </h3>

            <div>
              <label htmlFor="name" className={labelClass}>
                Tên Creative Space *
              </label>
              <input
                id="name"
                className={inputClass}
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Ví dụ: Analog Darkroom Studio"
                minLength={3}
                maxLength={150}
                required
              />
            </div>

            <div>
              <label htmlFor="type" className={labelClass}>
                Loại không gian *
              </label>
              <select
                id="type"
                className={inputClass}
                value={form.type}
                onChange={(event) =>
                  updateField("type", event.target.value as CreativeSpaceType)
                }
              >
                <option value="DARKROOM">Darkroom</option>
                <option value="STUDIO">Studio</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className={labelClass}>
                Mô tả *
              </label>
              <textarea
                id="description"
                className={inputClass}
                rows={4}
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="Mô tả về không gian của bạn..."
                minLength={10}
                maxLength={2000}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="dimensions" className={labelClass}>
                  Kích thước *
                </label>
                <input
                  id="dimensions"
                  className={inputClass}
                  value={form.dimensions}
                  onChange={(event) =>
                    updateField("dimensions", event.target.value)
                  }
                  placeholder="Ví dụ: 30m2"
                  maxLength={100}
                  required
                />
              </div>

              <div>
                <label htmlFor="capacity" className={labelClass}>
                  Sức chứa (người) *
                </label>
                <input
                  id="capacity"
                  type="number"
                  min={1}
                  step={1}
                  className={inputClass}
                  value={form.capacity}
                  onChange={(event) =>
                    updateField("capacity", Number(event.target.value))
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="location" className={labelClass}>
                Địa điểm *
              </label>
              <input
                id="location"
                className={inputClass}
                value={form.location}
                onChange={(event) =>
                  updateField("location", event.target.value)
                }
                placeholder="Địa chỉ Creative Space"
                maxLength={255}
                required
              />
            </div>
          </section>

          {/* Đặc điểm không gian */}
          <section className="space-y-4">
            <h3 className="border-b pb-3 text-lg font-semibold text-gray-900">
              Đặc điểm không gian
            </h3>

            <div>
              <label htmlFor="artisticStyle" className={labelClass}>
                Phong cách nghệ thuật
              </label>
              <input
                id="artisticStyle"
                className={inputClass}
                value={form.artisticStyle}
                onChange={(event) =>
                  updateField("artisticStyle", event.target.value)
                }
                placeholder="Ví dụ: Minimalist, Vintage, Analog..."
                maxLength={255}
              />
            </div>

            <div>
              <label htmlFor="lighting" className={labelClass}>
                Hệ thống ánh sáng
              </label>
              <input
                id="lighting"
                className={inputClass}
                value={form.lighting}
                onChange={(event) =>
                  updateField("lighting", event.target.value)
                }
                placeholder="Mô tả hệ thống ánh sáng"
                maxLength={500}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="ventilation" className={labelClass}>
                  Hệ thống thông gió
                </label>
                <input
                  id="ventilation"
                  className={inputClass}
                  value={form.ventilation}
                  onChange={(event) =>
                    updateField("ventilation", event.target.value)
                  }
                  maxLength={500}
                />
              </div>

              <div>
                <label htmlFor="acoustics" className={labelClass}>
                  Âm học
                </label>
                <input
                  id="acoustics"
                  className={inputClass}
                  value={form.acoustics}
                  onChange={(event) =>
                    updateField("acoustics", event.target.value)
                  }
                  maxLength={500}
                />
              </div>
            </div>

            <div>
              <label htmlFor="facilities" className={labelClass}>
                Cơ sở vật chất
              </label>
              <input
                id="facilities"
                className={inputClass}
                value={facilitiesText}
                onChange={(event) => setFacilitiesText(event.target.value)}
                placeholder="Ví dụ: Backdrop, Darkroom equipment"
                maxLength={1000}
              />
              <p className="mt-1 text-xs text-gray-500">
                Phân cách các mục bằng dấu phẩy.
              </p>
            </div>

            <div>
              <label htmlFor="amenities" className={labelClass}>
                Tiện ích
              </label>
              <input
                id="amenities"
                className={inputClass}
                value={amenitiesText}
                onChange={(event) => setAmenitiesText(event.target.value)}
                placeholder="Ví dụ: Wi-Fi, Parking, Air conditioning"
                maxLength={1000}
              />
              <p className="mt-1 text-xs text-gray-500">
                Phân cách các tiện ích bằng dấu phẩy.
              </p>
            </div>
          </section>

          {/* Giá thuê và quy định */}
          <section className="space-y-4">
            <h3 className="border-b pb-3 text-lg font-semibold text-gray-900">
              Giá thuê và quy định
            </h3>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label htmlFor="priceAmount" className={labelClass}>
                  Giá thuê (VND) *
                </label>
                <input
                  id="priceAmount"
                  type="number"
                  min={1}
                  step="any"
                  className={inputClass}
                  value={form.priceAmount || ""}
                  onChange={(event) =>
                    updateField("priceAmount", Number(event.target.value))
                  }
                  required
                />
              </div>

              <div>
                <label htmlFor="pricingUnit" className={labelClass}>
                  Đơn vị tính
                </label>
                <select
                  id="pricingUnit"
                  className={inputClass}
                  value={form.pricingUnit}
                  onChange={(event) =>
                    updateField("pricingUnit", event.target.value)
                  }
                >
                  <option value="HOUR">Theo giờ</option>
                  <option value="DAY">Theo ngày</option>
                  <option value="SESSION">Theo buổi</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="operatingHours" className={labelClass}>
                Giờ hoạt động
              </label>
              <input
                id="operatingHours"
                className={inputClass}
                value={form.operatingHours}
                onChange={(event) =>
                  updateField("operatingHours", event.target.value)
                }
                placeholder="Ví dụ: 08:00 - 18:00"
                maxLength={100}
              />
            </div>

            <div>
              <label htmlFor="policies" className={labelClass}>
                Quy định sử dụng
              </label>
              <textarea
                id="policies"
                className={inputClass}
                rows={3}
                value={form.policies}
                onChange={(event) =>
                  updateField("policies", event.target.value)
                }
                placeholder="Các quy định khi sử dụng không gian..."
                maxLength={2000}
              />
            </div>
          </section>

          {/* Hình ảnh và xem trước */}
          <section className="space-y-4">
            <h3 className="border-b pb-3 text-lg font-semibold text-gray-900">
              Hình ảnh Creative Space
            </h3>

            <div>
              <label htmlFor="images" className={labelClass}>
                URL hình ảnh
              </label>
              <textarea
                id="images"
                className={inputClass}
                rows={3}
                value={imagesText}
                onChange={(event) => setImagesText(event.target.value)}
                placeholder={
                  "https://example.com/image1.jpg, https://example.com/image2.jpg"
                }
                maxLength={3000}
              />

              <p className="mt-2 text-xs text-gray-500">
                Nhập URL ảnh và phân cách bằng dấu phẩy. Chỉ chấp nhận URL
                bắt đầu bằng http:// hoặc https://. Hiện tại chưa hỗ trợ tải
                ảnh trực tiếp từ máy tính.
              </p>
            </div>

            {invalidImageUrls.length > 0 && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                <p className="font-medium">
                  Có {invalidImageUrls.length} URL không hợp lệ:
                </p>
                <ul className="mt-2 list-inside list-disc break-all">
                  {invalidImageUrls.map((url, index) => (
                    <li key={`${url}-${index}`}>{url}</li>
                  ))}
                </ul>
              </div>
            )}

            {validImageUrls.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-800">
                    Xem trước hình ảnh
                  </h4>
                  <span className="text-xs text-gray-500">
                    {validImageUrls.length} ảnh hợp lệ
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {validImageUrls.map((url, index) => (
                    <div key={`${url}-${index}`} className="space-y-2">
                      <PreviewImage imageUrl={url} />
                      <p className="truncate text-xs text-gray-500">
                        Hình ảnh {index + 1}: {url}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Nút thao tác */}
          <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard/provider/creative-spaces"
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </Link>

            <button
              type="submit"
              disabled={isSubmitting || invalidImageUrls.length > 0}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Đang tạo..." : "Tạo Creative Space"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default function CreateCreativeSpacePage() {
  return (
    <ProtectedRoute allowedRoles={["SERVICE_PROVIDER"]}>
      <CreateCreativeSpaceForm />
    </ProtectedRoute>
  );
}
