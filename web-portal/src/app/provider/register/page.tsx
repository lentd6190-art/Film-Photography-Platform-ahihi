"use client";

// Hiển thị form đăng ký tài khoản Service Provider.

import { useState, type FormEvent } from "react";
import Link from "next/link";

import { authService } from "@/services/auth.service";
import type { ProviderRegisterRequest } from "@/types/auth";

export default function ProviderRegisterPage() {
  const [formData, setFormData] = useState<ProviderRegisterRequest>({
    email: "",
    password: "",
    fullName: "",
    businessName: "",
    phone: "",
    address: "",
    serviceType: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cập nhật dữ liệu khi người dùng nhập thông tin.
  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // Gửi thông tin đăng ký đến Identity API.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await authService.registerProvider(formData);

      setSuccessMessage(response.message);
      setFormData({
        email: "",
        password: "",
        fullName: "",
        businessName: "",
        phone: "",
        address: "",
        serviceType: "",
      });
    } catch {
      setError(
        "Đăng ký không thành công. Vui lòng kiểm tra thông tin và thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // Các thuộc tính dùng chung cho ô nhập liệu.
  const inputClassName =
    "w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Provider Registration
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Đăng ký tài khoản nhà cung cấp dịch vụ
          </p>
        </div>

        {successMessage ? (
          <div
            role="status"
            className="rounded-lg bg-green-50 p-5 text-center"
          >
            <h2 className="font-semibold text-green-700">
              Đăng ký thành công!
            </h2>

            <p className="mt-2 text-sm text-green-700">
              {successMessage}
            </p>

            <p className="mt-3 text-sm text-gray-600">
              Tài khoản của bạn đang chờ Admin phê duyệt.
            </p>

            <Link
              href="/login"
              className="mt-5 inline-block font-semibold text-blue-600 hover:text-blue-700"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-gray-700">
                Họ và tên
              </label>
              <input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                maxLength={150}
                required
                className={inputClassName}
                placeholder="Nhập họ và tên"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                maxLength={255}
                required
                autoComplete="email"
                className={inputClassName}
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                minLength={8}
                maxLength={72}
                required
                autoComplete="new-password"
                className={inputClassName}
                placeholder="Tối thiểu 8 ký tự"
              />
            </div>

            <div>
              <label htmlFor="businessName" className="mb-2 block text-sm font-medium text-gray-700">
                Tên doanh nghiệp
              </label>
              <input
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                maxLength={150}
                required
                className={inputClassName}
                placeholder="Nhập tên doanh nghiệp"
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700">
                Số điện thoại
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                maxLength={20}
                required
                className={inputClassName}
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div>
              <label htmlFor="address" className="mb-2 block text-sm font-medium text-gray-700">
                Địa chỉ
              </label>
              <input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                maxLength={255}
                required
                className={inputClassName}
                placeholder="Nhập địa chỉ doanh nghiệp"
              />
            </div>

            <div>
              <label htmlFor="serviceType" className="mb-2 block text-sm font-medium text-gray-700">
                Loại dịch vụ
              </label>
              <select
                id="serviceType"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                required
                className={inputClassName}
              >
                <option value="">-- Chọn loại dịch vụ --</option>
                <option value="PHOTOGRAPHY">Photography</option>
                <option value="FILM_DEVELOPING">Film Developing</option>
                <option value="EQUIPMENT_RENTAL">Equipment Rental</option>
              </select>
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Đang đăng ký..." : "Đăng ký Provider"}
            </button>

            <p className="text-center text-sm text-gray-600">
              Đã có tài khoản?{" "}
              <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                Đăng nhập
              </Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}