"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      await login({ email, password });
      router.replace("/");
    } catch {
      setError("Email hoặc mật khẩu không chính xác. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
        <div className="fpp-card px-8 py-6 text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--primary)]" />
          <p className="text-sm text-[var(--text-secondary)]">
            Đang kiểm tra phiên đăng nhập...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-[var(--border)] bg-white shadow-[0_18px_60px_rgba(73,56,45,0.09)] md:grid-cols-2">
        <section className="relative flex min-h-[280px] flex-col justify-between overflow-hidden bg-[#49382D] p-8 text-white sm:p-10 md:min-h-[620px]">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border-[35px] border-white/5" />
          <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full border-[45px] border-[#FF8A24]/20" />

          <div className="relative z-10">
            <div className="mb-10 inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary)] text-xl font-bold">
                F
              </div>
              <span className="text-sm font-semibold tracking-[0.18em]">
                FILM. STUDIO
              </span>
            </div>

            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#FFB477]">
              Film Photography Platform
            </p>

            <h1 className="max-w-md text-3xl font-bold leading-tight sm:text-4xl">
              Lưu giữ khoảnh khắc, theo cách của riêng bạn.
            </h1>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/70">
              Không gian kết nối cộng đồng nhiếp ảnh film, nhà cung cấp dịch vụ
              và những người yêu thích nghệ thuật hình ảnh.
            </p>
          </div>

          <div className="relative z-10 mt-10">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-1.5 w-8 rounded-full bg-[var(--primary)]" />
              <span className="h-1.5 w-3 rounded-full bg-white/30" />
              <span className="h-1.5 w-3 rounded-full bg-white/30" />
            </div>
            <p className="text-xs text-white/50">
              Capture moments. Keep stories.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-12 md:px-14">
          <div className="w-full max-w-md">
            <div className="mb-9">
              <span className="mb-3 inline-block rounded-full bg-[#FFF0E5] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                WELCOME BACK
              </span>
              <h2 className="text-3xl font-bold text-[var(--text-primary)]">
                Đăng nhập
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Đăng nhập để tiếp tục khám phá Film Photography Platform.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[var(--text-primary)]"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Nhập email của bạn"
                  required
                  autoComplete="email"
                  className="fpp-input"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-[var(--text-primary)]"
                >
                  Mật khẩu
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Nhập mật khẩu"
                  required
                  autoComplete="current-password"
                  className="fpp-input"
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="fpp-button-primary w-full py-3 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>

            <p className="mt-8 text-center text-xs leading-6 text-[var(--text-muted)]">
              Film Photography Platform
              <span className="mx-2">·</span>
              Capture moments, keep stories.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
