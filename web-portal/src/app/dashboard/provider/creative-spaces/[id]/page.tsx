
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";

import { creativeSpaceService } from "@/services/creative-space.service";
import type {
  CreativeSpace,
  CreativeSpaceFormData,
  CreativeSpaceType,
} from "@/types/creative-space";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100";

const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

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

function toFormData(space: CreativeSpace): CreativeSpaceFormData {
  return {
    name: space.name ?? "",
    type: space.type,
    description: space.description ?? "",
    dimensions: space.dimensions ?? "",
    capacity: space.capacity,
    artisticStyle: space.artisticStyle ?? "",
    lighting: space.lighting ?? "",
    ventilation: space.ventilation ?? "",
    acoustics: space.acoustics ?? "",
    facilities: space.facilities ?? [],
    amenities: space.amenities ?? [],
    operatingHours: space.operatingHours ?? "",
    policies: space.policies ?? "",
    priceAmount: space.priceAmount,
    currency: space.currency ?? "VND",
    pricingUnit: space.pricingUnit ?? "HOUR",
    images: space.images ?? [],
    location: space.location ?? "",
  };
}

function validateForm(
  form: CreativeSpaceFormData,
  imageUrls: string[],
): string | null {
  const name = form.name.trim();
  const description = form.description.trim();
  const dimensions = form.dimensions.trim();
  const location = form.location.trim();
  const capacity = Number(form.capacity);
  const priceAmount = Number(form.priceAmount);

  if (name.length < 3 || name.length > 150) {
    return "Tên Creative Space phải có từ 3 đến 150 ký tự.";
  }

  if (description.length < 10 || description.length > 2000) {
    return "Mô tả phải có từ 10 đến 2000 ký tự.";
  }

  if (!dimensions || dimensions.length > 100) {
    return "Kích thước không được để trống và tối đa 100 ký tự.";
  }

  if (!location || location.length > 255) {
    return "Địa điểm không được để trống và tối đa 255 ký tự.";
  }

  if (!Number.isInteger(capacity) || capacity < 1) {
    return "Sức chứa phải là số nguyên lớn hơn 0.";
  }

  if (!Number.isFinite(priceAmount) || priceAmount <= 0) {
    return "Giá thuê phải là số lớn hơn 0.";
  }

  if (form.artisticStyle.length > 255) {
    return "Phong cách nghệ thuật tối đa 255 ký tự.";
  }

  if (form.lighting.length > 500 || form.ventilation.length > 500) {
    return "Thông tin ánh sáng và thông gió tối đa 500 ký tự.";
  }

  if (form.acoustics.length > 500) {
    return "Thông tin âm học tối đa 500 ký tự.";
  }

  if (form.operatingHours.length > 100) {
    return "Giờ hoạt động tối đa 100 ký tự.";
  }

  if (form.policies.length > 2000) {
    return "Quy định sử dụng tối đa 2000 ký tự.";
  }

  if (parseList(form.facilities.join(", ")).join(", ").length > 1000) {
    return "Danh sách cơ sở vật chất tối đa 1000 ký tự.";
  }

  if (parseList(form.amenities.join(", ")).join(", ").length > 1000) {
    return "Danh sách tiện ích tối đa 1000 ký tự.";
  }

  if (imageUrls.some((url) => !isValidImageUrl(url))) {
    return "Có URL hình ảnh không hợp lệ. Chỉ chấp nhận URL http:// hoặc https://.";
  }

  if (imageUrls.join(", ").length > 3000) {
    return "Danh sách URL hình ảnh tối đa 3000 ký tự.";
  }

  return null;
}

function PreviewImage({ imageUrl }: { imageUrl: string }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100">
      {!imageError ? (
        <Image
          src={imageUrl}
          alt="Ảnh Creative Space"
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

function formatDate(value: string): string {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Chưa xác định"
    : date.toLocaleString("vi-VN");
}

function CreativeSpaceDetailContent() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [space, setSpace] = useState<CreativeSpace | null>(null);
  const [form, setForm] = useState<CreativeSpaceFormData | null>(null);

  const [facilitiesText, setFacilitiesText] = useState("");
  const [amenitiesText, setAmenitiesText] = useState("");
  const [imagesText, setImagesText] = useState("");

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  // Tải lại thông tin khi ID thay đổi.
  useEffect(() => {
    let cancelled = false;

    const fetchSpace = async () => {
      setLoading(true);
      setError("");
      setSuccess("");
      setSpace(null);
      setForm(null);

      try {
        const data = await creativeSpaceService.getById(id);

        if (cancelled) return;

        if (!data) {
          setError("Không tìm thấy Creative Space này.");
          return;
        }

        setSpace(data);
        setForm(toFormData(data));

        setFacilitiesText((data.facilities ?? []).join(", "));
        setAmenitiesText((data.amenities ?? []).join(", "));
        setImagesText((data.images ?? []).join(", "));
      } catch {
        if (!cancelled) {
          setError("Không thể tải thông tin Creative Space.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchSpace();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Cập nhật một trường trong form.
  const updateField = <K extends keyof CreativeSpaceFormData>(
    field: K,
    value: CreativeSpaceFormData[K],
  ) => {
    setForm((previous) =>
      previous
        ? {
            ...previous,
            [field]: value,
          }
        : previous,
    );

    setError("");
    setSuccess("");
  };

  // Cập nhật các trường dạng danh sách.
  const updateListField = (
    field: "facilities" | "amenities" | "images",
    value: string,
  ) => {
    if (field === "facilities") {
      setFacilitiesText(value);
    } else if (field === "amenities") {
      setAmenitiesText(value);
    } else {
      setImagesText(value);
    }

    updateField(field, parseList(value));
  };

  // Lưu thay đổi Creative Space.
  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!space || !form || space.status === "INACTIVE") return;
    if (isSaving || isDeactivating) return;

    const validationError = validateForm(form, imageUrls);

    if (validationError) {
      setError(validationError);
      setSuccess("");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    const submission: CreativeSpaceFormData = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      dimensions: form.dimensions.trim(),
      location: form.location.trim(),
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
      const updated = await creativeSpaceService.update(id, submission);

      setSpace(updated);
      setForm(toFormData(updated));

      setFacilitiesText((updated.facilities ?? []).join(", "));
      setAmenitiesText((updated.amenities ?? []).join(", "));
      setImagesText((updated.images ?? []).join(", "));

      setSuccess("Cập nhật Creative Space thành công!");
    } catch {
      setError("Không thể cập nhật Creative Space. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  // Ngừng hoạt động, không xóa dữ liệu.
  const handleDeactivate = async () => {
    if (!space || space.status === "INACTIVE") return;
    if (isSaving || isDeactivating) return;

    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn ngừng hoạt động "${space.name}" không?\n\nCreative Space sẽ không bị xóa và dữ liệu hiện tại vẫn được giữ lại.`,
    );

    if (!confirmed) return;

    setIsDeactivating(true);
    setError("");
    setSuccess("");

    try {
      await creativeSpaceService.deactivate(id);

      setSpace((previous) =>
        previous
          ? {
              ...previous,
              status: "INACTIVE",
              updatedAt: new Date().toISOString(),
            }
          : previous,
      );

      setSuccess(
        "Creative Space đã được ngừng hoạt động. Dữ liệu vẫn được giữ lại.",
      );
    } catch {
      setError("Không thể ngừng hoạt động Creative Space. Vui lòng thử lại.");
    } finally {
      setIsDeactivating(false);
    }
  };

  // Trạng thái đang tải.
  if (loading) {
    return (
      <DashboardLayout title="Chi tiết Creative Space">
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="mt-4 text-sm text-gray-500">
              Đang tải thông tin Creative Space...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Không tìm thấy Creative Space.
  if (!space || !form) {
    return (
      <DashboardLayout title="Chi tiết Creative Space">
        <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">
            Không tìm thấy Creative Space
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {error || "Creative Space không tồn tại hoặc không thể truy cập."}
          </p>

          <Link
            href="/dashboard/provider/creative-spaces"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Quay lại danh sách
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const isInactive = space.status === "INACTIVE";
  const isBusy = isSaving || isDeactivating;

  return (
    <DashboardLayout title="Chi tiết Creative Space">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Tiêu đề */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/dashboard/provider/creative-spaces"
              className="text-sm text-blue-600 hover:underline"
            >
              ← Quay lại danh sách
            </Link>

            <h1 className="mt-3 text-2xl font-bold text-gray-900">
              Chi tiết Creative Space
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Xem và quản lý thông tin không gian của bạn.
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${
              isInactive
                ? "bg-gray-100 text-gray-600"
                : "bg-green-100 text-green-700"
            }`}
          >
            {isInactive ? "Ngừng hoạt động" : "Đang hoạt động"}
          </span>
        </div>

        {/* Thông báo */}
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {success}
          </div>
        )}

        {isInactive && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Creative Space này đã ngừng hoạt động. Bạn chỉ có thể xem thông
            tin, không thể chỉnh sửa hoặc ngừng hoạt động thêm lần nữa.
          </div>
        )}

        <form
          onSubmit={handleSave}
          className="space-y-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <fieldset disabled={isInactive || isBusy} className="space-y-6">
            {/* Thông tin cơ bản */}
            <section className="space-y-4">
              <h2 className="border-b pb-2 text-lg font-semibold text-gray-900">
                Thông tin cơ bản
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className={labelClass}>
                    Tên Creative Space *
                  </label>
                  <input
                    id="name"
                    className={inputClass}
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
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
                      updateField(
                        "type",
                        event.target.value as CreativeSpaceType,
                      )
                    }
                  >
                    <option value="DARKROOM">Darkroom</option>
                    <option value="STUDIO">Studio</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
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
                    minLength={10}
                    maxLength={2000}
                    required
                  />
                </div>

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
                    maxLength={100}
                    placeholder="Ví dụ: 50m²"
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

                <div className="sm:col-span-2">
                  <label htmlFor="location" className={labelClass}>
                    Địa chỉ *
                  </label>
                  <input
                    id="location"
                    className={inputClass}
                    value={form.location}
                    onChange={(event) =>
                      updateField("location", event.target.value)
                    }
                    maxLength={255}
                    required
                  />
                </div>
              </div>
            </section>

            {/* Đặc điểm không gian */}
            <section className="space-y-4">
              <h2 className="border-b pb-2 text-lg font-semibold text-gray-900">
                Đặc điểm không gian
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
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
                    maxLength={500}
                  />
                </div>

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
                    Hệ thống âm học
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

                <div>
                  <label htmlFor="facilities" className={labelClass}>
                    Cơ sở vật chất
                  </label>
                  <textarea
                    id="facilities"
                    className={inputClass}
                    rows={3}
                    value={facilitiesText}
                    onChange={(event) =>
                      updateListField("facilities", event.target.value)
                    }
                    maxLength={1000}
                    placeholder="Phân cách bằng dấu phẩy"
                  />
                </div>

                <div>
                  <label htmlFor="amenities" className={labelClass}>
                    Tiện ích
                  </label>
                  <textarea
                    id="amenities"
                    className={inputClass}
                    rows={3}
                    value={amenitiesText}
                    onChange={(event) =>
                      updateListField("amenities", event.target.value)
                    }
                    maxLength={1000}
                    placeholder="Phân cách bằng dấu phẩy"
                  />
                </div>
              </div>
            </section>

            {/* Giá thuê và quy định */}
            <section className="space-y-4">
              <h2 className="border-b pb-2 text-lg font-semibold text-gray-900">
                Giá thuê và quy định
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="priceAmount" className={labelClass}>
                    Giá thuê *
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

                <div>
                  <label htmlFor="currency" className={labelClass}>
                    Tiền tệ
                  </label>
                  <select
                    id="currency"
                    className={inputClass}
                    value={form.currency}
                    onChange={(event) =>
                      updateField("currency", event.target.value)
                    }
                  >
                    <option value="VND">VND</option>
                    <option value="USD">USD</option>
                  </select>
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
                    maxLength={100}
                    placeholder="Ví dụ: 08:00 - 22:00"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="policies" className={labelClass}>
                    Chính sách sử dụng
                  </label>
                  <textarea
                    id="policies"
                    className={inputClass}
                    rows={4}
                    value={form.policies}
                    onChange={(event) =>
                      updateField("policies", event.target.value)
                    }
                    maxLength={2000}
                  />
                </div>
              </div>
            </section>

            {/* Hình ảnh */}
            <section className="space-y-4">
              <h2 className="border-b pb-2 text-lg font-semibold text-gray-900">
                Hình ảnh Creative Space
              </h2>

              <div>
                <label htmlFor="images" className={labelClass}>
                  Danh sách URL hình ảnh
                </label>
                <textarea
                  id="images"
                  className={inputClass}
                  rows={3}
                  value={imagesText}
                  onChange={(event) =>
                    updateListField("images", event.target.value)
                  }
                  maxLength={3000}
                  placeholder="Nhập các URL, phân cách bằng dấu phẩy"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Chỉ chấp nhận URL bắt đầu bằng http:// hoặc https://.
                  Hiện tại chưa hỗ trợ tải ảnh trực tiếp từ máy tính.
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
                    <h3 className="text-sm font-semibold text-gray-800">
                      Xem trước hình ảnh
                    </h3>
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
          </fieldset>

          {/* Nút thao tác */}
          <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={handleDeactivate}
              disabled={isInactive || isBusy}
              className="rounded-lg border border-red-300 px-5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeactivating
                ? "Đang xử lý..."
                : isInactive
                  ? "Đã ngừng hoạt động"
                  : "Ngừng hoạt động"}
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard/provider/creative-spaces"
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Quay lại
              </Link>

              <button
                type="submit"
                disabled={isInactive || isBusy || invalidImageUrls.length > 0}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </form>

        <div className="text-xs text-gray-400">
          Ngày tạo: {formatDate(space.createdAt)}
          {" · "}
          Cập nhật lần cuối: {formatDate(space.updatedAt)}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ProviderCreativeSpaceDetailPage() {
  return (
    <ProtectedRoute allowedRoles={["SERVICE_PROVIDER"]}>
      <CreativeSpaceDetailContent />
    </ProtectedRoute>
  );
}
