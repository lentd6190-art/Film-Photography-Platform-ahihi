// Giải mã payload JWT để lấy thông tin người dùng và vai trò.

import type { JwtPayload } from "@/types/auth";

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");

    if (parts.length !== 3 || !parts[1]) {
      return null;
    }

    // Chuyển Base64 URL sang Base64 thông thường.
    const base64 = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const paddedBase64 = base64.padEnd(
      Math.ceil(base64.length / 4) * 4,
      "=",
    );

    // Giải mã Base64 và chuyển thành chuỗi UTF-8.
    const binary = atob(paddedBase64);

    const bytes = Uint8Array.from(
      binary,
      (character) => character.charCodeAt(0),
    );

    const json = new TextDecoder().decode(bytes);
    const payload: unknown = JSON.parse(json);

    if (
      typeof payload !== "object" ||
      payload === null ||
      !("sub" in payload) ||
      !("email" in payload) ||
      !("roles" in payload)
    ) {
      return null;
    }

    const candidate = payload as Record<string, unknown>;

    if (
      typeof candidate.sub !== "string" ||
      typeof candidate.email !== "string" ||
      !Array.isArray(candidate.roles) ||
      !candidate.roles.every((role) => typeof role === "string")
    ) {
      return null;
    }

    if (
      candidate.exp !== undefined &&
      typeof candidate.exp !== "number"
    ) {
      return null;
    }

    if (
      candidate.iat !== undefined &&
      typeof candidate.iat !== "number"
    ) {
      return null;
    }

    return candidate as unknown as JwtPayload;
  } catch {
    return null;
  }
}