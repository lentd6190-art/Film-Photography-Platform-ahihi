
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { creativeSpaceService } from "@/services/creative-space.service";
import type {
  CreativeSpace,
  CreativeSpaceStatus,
  CreativeSpaceType,
} from "@/types/creative-space";

type TypeFilter = "ALL" | CreativeSpaceType;
type StatusFilter = "ALL" | CreativeSpaceStatus;
type SortOption = "UPDATED_DESC" | "NAME_ASC" | "PRICE_ASC" | "PRICE_DESC";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "UPDATED_DESC", label: "Mới cập nhật" },
  { value: "NAME_ASC", label: "Tên A - Z" },
  { value: "PRICE_ASC", label: "Giá thấp đến cao" },
  { value: "PRICE_DESC", label: "Giá cao đến thấp" },
];

function getTypeLabel(type: CreativeSpaceType): string {
  return type === "DARKROOM" ? "Darkroom" : "Studio";
}

function getStatusLabel(status: CreativeSpaceStatus): string {
  return status === "ACTIVE" ? "Đang hoạt động" : "Ngừng hoạt động";
}

function formatPrice(space: CreativeSpace): string {
  const amount = Number(space.priceAmount);
  const formattedAmount = Number.isFinite(amount)
    ? amount.toLocaleString("vi-VN")
    : "Chưa xác định";

  return `${formattedAmount} ${space.currency ?? "VND"} / ${space.pricingUnit ?? ""}`;
}

// Hiển thị ảnh đầu tiên và ảnh dự phòng nếu URL không tải được.
function CreativeSpaceImage({ space }: { space: CreativeSpace }) {
  const [imageError, setImageError] = useState(false);

  const imageUrl = space.images?.find(
    (url) => typeof url === "string" && url.trim().length > 0,
  )?.trim();

  return (
    <div className="relative h-48 w-full overflow-hidden bg-gray-100">
      {imageUrl && !imageError ? (
        <Image
          src={imageUrl}
          alt={`Hình ảnh ${space.name}`}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition duration-300 hover:scale-105"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
          <span className="text-4xl" aria-hidden="true">
            📷
          </span>
          <span className="text-sm">Chưa có hình ảnh</span>
        </div>
      )}
    </div>
  );
}

export default function CreativeSpacesPage() {
  const [spaces, setSpaces] = useState<CreativeSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sortOption, setSortOption] =
    useState<SortOption>("UPDATED_DESC");

  // Tải lại danh sách Creative Spaces.
  const loadSpaces = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await creativeSpaceService.getAll();
      setSpaces(data);
    } catch {
      setError("Không thể tải danh sách Creative Spaces. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Tải dữ liệu khi mở trang.
  useEffect(() => {
    let cancelled = false;

    const fetchSpaces = async () => {
      try {
        const data = await creativeSpaceService.getAll();

        if (!cancelled) {
          setSpaces(data);
          setError("");
        }
      } catch {
        if (!cancelled) {
          setError("Không thể tải danh sách Creative Spaces.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchSpaces();

    return () => {
      cancelled = true;
    };
  }, []);

  // Thống kê Creative Space.
  const statistics = useMemo(
    () => ({
      total: spaces.length,
      active: spaces.filter((space) => space.status === "ACTIVE").length,
      inactive: spaces.filter((space) => space.status === "INACTIVE").length,
    }),
    [spaces],
  );

  // Tìm kiếm, lọc và sắp xếp.
  const filteredSpaces = useMemo(() => {
    const keyword = searchTerm.trim().toLocaleLowerCase("vi-VN");

    const result = spaces.filter((space) => {
      const name = String(space.name ?? "").toLocaleLowerCase("vi-VN");
      const location = String(space.location ?? "").toLocaleLowerCase("vi-VN");

      const matchesSearch =
        !keyword || name.includes(keyword) || location.includes(keyword);

      const matchesType =
        typeFilter === "ALL" || space.type === typeFilter;

      const matchesStatus =
        statusFilter === "ALL" || space.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });

    return [...result].sort((a, b) => {
      switch (sortOption) {
        case "NAME_ASC":
          return String(a.name ?? "").localeCompare(
            String(b.name ?? ""),
            "vi",
          );

        case "PRICE_ASC":
          return (
            (Number(a.priceAmount) || 0) -
            (Number(b.priceAmount) || 0)
          );

        case "PRICE_DESC":
          return (
            (Number(b.priceAmount) || 0) -
            (Number(a.priceAmount) || 0)
          );

        case "UPDATED_DESC":
        default: {
          const dateA = new Date(a.updatedAt).getTime();
          const dateB = new Date(b.updatedAt).getTime();

          const timeA = Number.isFinite(dateA) ? dateA : 0;
          const timeB = Number.isFinite(dateB) ? dateB : 0;

          return timeB - timeA;
        }
      }
    });
  }, [spaces, searchTerm, typeFilter, statusFilter, sortOption]);

  // Xóa các điều kiện tìm kiếm và lọc.
  const resetFilters = () => {
    setSearchTerm("");
    setTypeFilter("ALL");
    setStatusFilter("ALL");
    setSortOption("UPDATED_DESC");
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    typeFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    sortOption !== "UPDATED_DESC";

  return (
    <ProtectedRoute allowedRoles={["SERVICE_PROVIDER"]}>
      <DashboardLayout title="Quản lý Creative Spaces">
        <div className="space-y-6">
          {/* Tiêu đề */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Creative Spaces của tôi
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Quản lý Darkroom và Studio của bạn.
              </p>
            </div>

            <Link
              href="/dashboard/provider/creative-spaces/create"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              + Tạo Creative Space
            </Link>
          </div>

          {/* Thống kê */}
          {!loading && !error && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Tổng Creative Spaces
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {statistics.total}
                </p>
              </div>

              <div className="rounded-xl border border-green-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Đang hoạt động</p>
                <p className="mt-2 text-3xl font-bold text-green-600">
                  {statistics.active}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Ngừng hoạt động</p>
                <p className="mt-2 text-3xl font-bold text-gray-600">
                  {statistics.inactive}
                </p>
              </div>
            </div>
          )}

          {/* Tìm kiếm, lọc và sắp xếp */}
          {!loading && !error && spaces.length > 0 && (
            <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-gray-900">
                Tìm kiếm và lọc Creative Spaces
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div>
                  <label
                    htmlFor="space-search"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Tìm theo tên hoặc địa điểm
                  </label>
                  <input
                    id="space-search"
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Nhập từ khóa..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="type-filter"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Loại không gian
                  </label>
                  <select
                    id="type-filter"
                    value={typeFilter}
                    onChange={(event) =>
                      setTypeFilter(event.target.value as TypeFilter)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="ALL">Tất cả loại</option>
                    <option value="DARKROOM">Darkroom</option>
                    <option value="STUDIO">Studio</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="status-filter"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Trạng thái
                  </label>
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value as StatusFilter)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="ACTIVE">Đang hoạt động</option>
                    <option value="INACTIVE">Ngừng hoạt động</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="sort-filter"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Sắp xếp theo
                  </label>
                  <select
                    id="sort-filter"
                    value={sortOption}
                    onChange={(event) =>
                      setSortOption(event.target.value as SortOption)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-500">
                  Tìm thấy{" "}
                  <strong className="text-gray-900">
                    {filteredSpaces.length}
                  </strong>{" "}
                  / {spaces.length} không gian
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  disabled={!hasActiveFilters}
                  className="text-sm font-medium text-blue-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </section>
          )}

          {/* Loading */}
          {loading && (
            <div className="rounded-xl border border-gray-200 bg-white py-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="mt-4 text-sm text-gray-500">
                Đang tải danh sách Creative Spaces...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700"
            >
              <p className="font-medium">{error}</p>
              <button
                type="button"
                onClick={() => void loadSpaces()}
                className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Thử tải lại
              </button>
            </div>
          )}

          {/* Chưa có dữ liệu */}
          {!loading && !error && spaces.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <div className="text-5xl" aria-hidden="true">
                📷
              </div>
              <h2 className="mt-4 text-lg font-semibold text-gray-900">
                Bạn chưa có Creative Space nào
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Hãy tạo Darkroom hoặc Studio đầu tiên của bạn.
              </p>
              <Link
                href="/dashboard/provider/creative-spaces/create"
                className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                + Tạo Creative Space
              </Link>
            </div>
          )}

          {/* Không có kết quả */}
          {!loading &&
            !error &&
            spaces.length > 0 &&
            filteredSpaces.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  Không tìm thấy Creative Space phù hợp
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Hãy thử thay đổi từ khóa hoặc điều kiện lọc.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 font-medium text-blue-600 hover:underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}

          {/* Danh sách Creative Spaces */}
          {!loading && !error && filteredSpaces.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredSpaces.map((space) => (
                <article
                  key={space.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <CreativeSpaceImage space={space} />

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                        {getTypeLabel(space.type)}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          space.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {getStatusLabel(space.status)}
                      </span>
                    </div>

                    <h2 className="mt-4 text-lg font-bold text-gray-900">
                      {space.name}
                    </h2>

                    <p className="mt-2 line-clamp-2 min-h-10 text-sm text-gray-600">
                      {space.description}
                    </p>

                    <div className="mt-4 flex-1 space-y-2 text-sm text-gray-600">
                      <p>
                        <strong>Sức chứa:</strong> {space.capacity} người
                      </p>
                      <p>
                        <strong>Kích thước:</strong> {space.dimensions}
                      </p>
                      <p>
                        <strong>Giá:</strong> {formatPrice(space)}
                      </p>
                      <p>
                        <strong>Địa điểm:</strong> {space.location}
                      </p>
                    </div>

                    <Link
                      href={`/dashboard/provider/creative-spaces/${space.id}`}
                      className="mt-5 inline-flex items-center font-semibold text-blue-600 hover:underline"
                    >
                      Xem chi tiết →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
