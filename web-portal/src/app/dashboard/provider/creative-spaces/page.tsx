
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
    <div className="relative h-48 w-full overflow-hidden bg-[var(--surface-soft)]">
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
        <div className="flex h-full flex-col items-center justify-center gap-2 text-[var(--text-muted)]">
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
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                Creative Spaces của tôi
              </h1>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Quản lý Darkroom và Studio của bạn.
              </p>
            </div>

            <Link
              href="/dashboard/provider/creative-spaces/create"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--primary-hover)]"
            >
              + Tạo Creative Space
            </Link>
          </div>

          {/* Thống kê */}
          {!loading && !error && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[18px] fpp-card p-5">
                <p className="text-sm text-[var(--text-muted)]">
                  Tổng Creative Spaces
                </p>
                <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
                  {statistics.total}
                </p>
              </div>

              <div className="rounded-[18px] border border-[#B9DEC9] bg-white p-5 shadow-sm">
                <p className="text-sm text-[var(--text-muted)]">Đang hoạt động</p>
                <p className="mt-2 text-3xl font-bold text-[var(--success)]">
                  {statistics.active}
                </p>
              </div>

              <div className="rounded-[18px] fpp-card p-5">
                <p className="text-sm text-[var(--text-muted)]">Ngừng hoạt động</p>
                <p className="mt-2 text-3xl font-bold text-[var(--text-secondary)]">
                  {statistics.inactive}
                </p>
              </div>
            </div>
          )}

          {/* Tìm kiếm, lọc và sắp xếp */}
          {!loading && !error && spaces.length > 0 && (
            <section className="space-y-4 rounded-[18px] fpp-card p-5">
              <h2 className="font-semibold text-[var(--text-primary)]">
                Tìm kiếm và lọc Creative Spaces
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div>
                  <label
                    htmlFor="space-search"
                    className="mb-2 block text-sm font-medium text-[var(--text-secondary)]"
                  >
                    Tìm theo tên hoặc địa điểm
                  </label>
                  <input
                    id="space-search"
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Nhập từ khóa..."
                    className="w-full rounded-xl border border-[var(--border-strong)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#FFF0E5]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="type-filter"
                    className="mb-2 block text-sm font-medium text-[var(--text-secondary)]"
                  >
                    Loại không gian
                  </label>
                  <select
                    id="type-filter"
                    value={typeFilter}
                    onChange={(event) =>
                      setTypeFilter(event.target.value as TypeFilter)
                    }
                    className="w-full rounded-xl border border-[var(--border-strong)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
                  >
                    <option value="ALL">Tất cả loại</option>
                    <option value="DARKROOM">Darkroom</option>
                    <option value="STUDIO">Studio</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="status-filter"
                    className="mb-2 block text-sm font-medium text-[var(--text-secondary)]"
                  >
                    Trạng thái
                  </label>
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value as StatusFilter)
                    }
                    className="w-full rounded-xl border border-[var(--border-strong)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
                  >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="ACTIVE">Đang hoạt động</option>
                    <option value="INACTIVE">Ngừng hoạt động</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="sort-filter"
                    className="mb-2 block text-sm font-medium text-[var(--text-secondary)]"
                  >
                    Sắp xếp theo
                  </label>
                  <select
                    id="sort-filter"
                    value={sortOption}
                    onChange={(event) =>
                      setSortOption(event.target.value as SortOption)
                    }
                    className="w-full rounded-xl border border-[var(--border-strong)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
                <p className="text-sm text-[var(--text-muted)]">
                  Tìm thấy{" "}
                  <strong className="text-[var(--text-primary)]">
                    {filteredSpaces.length}
                  </strong>{" "}
                  / {spaces.length} không gian
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  disabled={!hasActiveFilters}
                  className="text-sm font-medium text-[var(--primary)] hover:underline disabled:cursor-not-allowed disabled:text-[var(--text-muted)] disabled:no-underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </section>
          )}

          {/* Loading */}
          {loading && (
            <div className="rounded-[18px] border border-[var(--border)] bg-white py-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[var(--border)] border-t-blue-600" />
              <p className="mt-4 text-sm text-[var(--text-muted)]">
                Đang tải danh sách Creative Spaces...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div
              role="alert"
              className="rounded-[18px] border border-[#F0C5C1] bg-[#FFF0EE] p-5 text-[var(--danger)]"
            >
              <p className="font-medium">{error}</p>
              <button
                type="button"
                onClick={() => void loadSpaces()}
                className="mt-3 rounded-xl bg-[var(--danger)] px-4 py-2 text-sm font-medium text-white hover:bg-[#BD3933]"
              >
                Thử tải lại
              </button>
            </div>
          )}

          {/* Chưa có dữ liệu */}
          {!loading && !error && spaces.length === 0 && (
            <div className="rounded-[18px] border border-dashed border-[var(--border-strong)] bg-white p-10 text-center">
              <div className="text-5xl" aria-hidden="true">
                📷
              </div>
              <h2 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">
                Bạn chưa có Creative Space nào
              </h2>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Hãy tạo Darkroom hoặc Studio đầu tiên của bạn.
              </p>
              <Link
                href="/dashboard/provider/creative-spaces/create"
                className="mt-5 inline-flex rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
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
              <div className="rounded-[18px] border border-dashed border-[var(--border-strong)] bg-white p-10 text-center">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Không tìm thấy Creative Space phù hợp
                </h2>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Hãy thử thay đổi từ khóa hoặc điều kiện lọc.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 font-medium text-[var(--primary)] hover:underline"
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
                  className="flex flex-col overflow-hidden rounded-[18px] fpp-card transition hover:shadow-md"
                >
                  <CreativeSpaceImage space={space} />

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-md bg-[#FFF0E5] px-3 py-1 text-sm font-medium text-[var(--primary)]">
                        {getTypeLabel(space.type)}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          space.status === "ACTIVE"
                            ? "bg-[#E8F4EC] text-[var(--success)]"
                            : "bg-[var(--surface-soft)] text-[var(--text-secondary)]"
                        }`}
                      >
                        {getStatusLabel(space.status)}
                      </span>
                    </div>

                    <h2 className="mt-4 text-lg font-bold text-[var(--text-primary)]">
                      {space.name}
                    </h2>

                    <p className="mt-2 line-clamp-2 min-h-10 text-sm text-[var(--text-secondary)]">
                      {space.description}
                    </p>

                    <div className="mt-4 flex-1 space-y-2 text-sm text-[var(--text-secondary)]">
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
                      className="mt-5 inline-flex items-center font-semibold text-[var(--primary)] hover:underline"
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
