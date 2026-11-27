"use client";

// Mục đích: Hiển thị trang đăng ký tài khoản Service Provider.
// Trách nhiệm: Quản lý form đăng ký, kiểm tra dữ liệu đầu vào,
// gửi yêu cầu đăng ký và hiển thị trạng thái phản hồi từ hệ thống.

import { useState, type FormEvent } from "react";
import Link from "next/link";

import { authService } from "@/services/auth.service";
import type { ProviderRegisterRequest } from "@/types/auth";

export default function ProviderRegisterPage() {
  // Khởi tạo dữ liệu đăng ký theo cấu trúc ProviderRegisterRequest.
  const [formData, setFormData] = useState<ProviderRegisterRequest>({
    email: "",
    password: "",
    fullName: "",
    businessName: "",
    phone: "",
    address: "",
    serviceType: "",
  });

  // Quản lý thông báo lỗi, thành công và trạng thái gửi form.
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Các lớp CSS dùng chung cho nhãn và ô nhập liệu.
  const labelClassName = "mb-2 block text-sm font-semibold text-[#49382D]";
  const inputClassName =
    "fpp-input w-full rounded-xl border border-[#E9DED2] bg-[#FFF9F2] px-4 py-3 text-sm text-[#49382D] outline-none transition focus:border-[#FF5A00] focus:ring-2 focus:ring-[#FF5A00]/10";

  // Cập nhật state khi người dùng thay đổi giá trị input hoặc select.
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
  // Giữ nguyên cơ chế xử lý thành công, thất bại và loading hiện tại.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await authService.registerProvider(formData);

      // Hiển thị thông báo từ hệ thống và đặt lại form sau đăng ký.
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
      // Thông báo lỗi chung khi yêu cầu đăng ký không thành công.
      setError(
        "Đăng ký không thành công. Vui lòng kiểm tra thông tin và thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="fpp-page-shell flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[24px] border border-[#E9DED2] bg-white shadow-[0_20px_70px_rgba(73,56,45,0.10)] lg:grid-cols-[0.85fr_1.15fr]">

        {/* Khu vực giới thiệu thương hiệu và chương trình đối tác. */}
        <section className="relative flex flex-col justify-between overflow-hidden bg-[#49382D] p-8 text-white sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full border border-white/10" />

          <div className="relative z-10">
            {/* Nhận diện thương hiệu FPP. */}
            <Link href="/login" className="inline-flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF5A00] text-lg font-black">
                F.
              </span>
              <span className="text-lg font-extrabold tracking-[0.16em]">
                FILM. STUDIO
              </span>
            </Link>

            <div className="mt-16 max-w-md">
              <span className="inline-flex rounded-full border border-[#FF8A24]/40 bg-[#FF8A24]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#FFB16E]">
                Provider Partnership
              </span>

              <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl">
                Trở thành
                <span className="block text-[#FF8A24]">
                  đối tác của chúng tôi.
                </span>
              </h1>

              <p className="mt-6 text-sm leading-7 text-white/70 sm:text-base">
                Kết nối dịch vụ nhiếp ảnh, không gian sáng tạo và thiết bị
                của bạn với cộng đồng yêu nhiếp ảnh trên Film Photography
                Platform.
              </p>
            </div>
          </div>

          {/* Thông tin định hướng dành cho nhà cung cấp. */}
          <div className="relative z-10 mt-16 border-t border-white/15 pt-6">
            <p className="text-sm font-semibold text-white/90">
              Cùng xây dựng cộng đồng nhiếp ảnh.
            </p>
            <p className="mt-2 text-xs leading-6 text-white/50">
              Đăng ký thông tin đối tác để bắt đầu quy trình xét duyệt
              tài khoản nhà cung cấp dịch vụ.
            </p>
          </div>
        </section>

        {/* Khu vực form đăng ký tài khoản Provider. */}
        <section className="p-6 sm:p-10 lg:p-12">
          <div className="mx-auto max-w-xl">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FF5A00]">
                Create your account
              </p>

              <h2 className="mt-3 text-3xl font-extrabold text-[#49382D]">
                Đăng ký Provider
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#806F62]">
                Điền thông tin bên dưới để đăng ký trở thành nhà cung cấp
                dịch vụ trên nền tảng.
              </p>
            </div>

            {/* Hiển thị kết quả đăng ký thành công. */}
            {successMessage ? (
              <div
                role="status"
                className="rounded-2xl border border-[#B9DDC8] bg-[#F0FAF3] p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#27845B]/10 text-2xl text-[#27845B]">
                  ✓
                </div>

                <h3 className="mt-4 text-xl font-bold text-[#27845B]">
                  Đăng ký thành công!
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#49382D]">
                  {successMessage}
                </p>

                <p className="mt-3 text-sm leading-6 text-[#806F62]">
                  Tài khoản của bạn đang chờ Admin phê duyệt.
                </p>

                <Link
                  href="/login"
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#FF5A00] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#E94F00]"
                >
                  Quay lại đăng nhập
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Thông tin cá nhân của người đăng ký. */}
                <div>
                  <label htmlFor="fullName" className={labelClassName}>
                    Họ và tên
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    maxLength={150}
                    required
                    autoComplete="name"
                    className={inputClassName}
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div>
                  <label htmlFor="email" className={labelClassName}>
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
                  <label htmlFor="password" className={labelClassName}>
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
                  <p className="mt-2 text-xs text-[#A39487]">
                    Mật khẩu cần có ít nhất 8 ký tự.
                  </p>
                </div>

                {/* Thông tin doanh nghiệp hoặc đơn vị cung cấp dịch vụ. */}
                <div className="border-t border-[#E9DED2] pt-5">
                  <h3 className="mb-5 text-base font-bold text-[#49382D]">
                    Thông tin đơn vị
                  </h3>

                  <div className="space-y-5">
                    <div>
                      <label htmlFor="businessName" className={labelClassName}>
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
                      <label htmlFor="phone" className={labelClassName}>
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
                        autoComplete="tel"
                        className={inputClassName}
                        placeholder="Nhập số điện thoại"
                      />
                    </div>

                    <div>
                      <label htmlFor="address" className={labelClassName}>
                        Địa chỉ
                      </label>
                      <input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        maxLength={255}
                        required
                        autoComplete="street-address"
                        className={inputClassName}
                        placeholder="Nhập địa chỉ doanh nghiệp"
                      />
                    </div>

                    <div>
                      <label htmlFor="serviceType" className={labelClassName}>
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
                  </div>
                </div>

                {/* Hiển thị lỗi khi yêu cầu đăng ký thất bại. */}
                {error && (
                  <p
                    role="alert"
                    className="rounded-xl border border-[#F1C5C1] bg-[#FFF3F1] p-4 text-sm text-[#D94B43]"
                  >
                    {error}
                  </p>
                )}

                {/* Nút gửi form và phản hồi trạng thái loading. */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-[#FF5A00] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#E94F00] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Đang đăng ký..." : "Đăng ký Provider"}
                </button>

                {/* Điều hướng đến trang đăng nhập dành cho tài khoản hiện có. */}
                <p className="text-center text-sm text-[#806F62]">
                  Đã có tài khoản?{" "}
                  <Link
                    href="/login"
                    className="font-bold text-[#FF5A00] transition hover:text-[#E94F00]"
                  >
                    Đăng nhập
                  </Link>
                </p>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
