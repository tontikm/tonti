import { generateSync, verifySync } from "otplib";

export const ROTATING_QR_STEP_SECONDS = 30;
export const ROTATING_QR_DIGITS = 6;
export const ROTATING_QR_EPOCH_TOLERANCE = 30;

export type ScannedTicketPayload = {
  code: string;
  otp?: string;
};

function secretBytes(secret: string): Uint8Array {
  if (/^[0-9a-f]+$/i.test(secret) && secret.length % 2 === 0) {
    return Uint8Array.from(
      secret.match(/.{1,2}/g)!.map((byte) => Number.parseInt(byte, 16)),
    );
  }

  const binary =
    typeof Buffer !== "undefined"
      ? Buffer.from(secret, "base64").toString("binary")
      : atob(secret);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export function generateRotatingOtp(secret: string): string {
  return generateSync({
    secret: secretBytes(secret),
    period: ROTATING_QR_STEP_SECONDS,
    digits: ROTATING_QR_DIGITS,
  });
}

export function buildRotatingQrPayload(code: string, secret: string): string {
  const otp = generateRotatingOtp(secret);
  return `${code.toUpperCase()}:${otp}`;
}

export function verifyRotatingOtp(secret: string, otp: string): boolean {
  const normalized = otp.replace(/\D/g, "");
  if (normalized.length !== ROTATING_QR_DIGITS) return false;

  try {
    const result = verifySync({
      secret: secretBytes(secret),
      token: normalized,
      period: ROTATING_QR_STEP_SECONDS,
      digits: ROTATING_QR_DIGITS,
      epochTolerance: ROTATING_QR_EPOCH_TOLERANCE,
    });
    return result.valid;
  } catch {
    return false;
  }
}

export function parseScannedTicketPayload(text: string): ScannedTicketPayload {
  const trimmed = text.trim();
  if (!trimmed) return { code: "" };

  let candidate = trimmed;

  try {
    const url = new URL(trimmed);
    const otpParam = url.searchParams.get("otp");
    const segment = url.pathname.split("/").filter(Boolean).pop() ?? "";
    if (otpParam) {
      return {
        code: segment.toUpperCase(),
        otp: otpParam.replace(/\D/g, ""),
      };
    }
    candidate = segment || trimmed;
  } catch {
    // Not a URL — use raw scan text.
  }

  const colonIndex = candidate.lastIndexOf(":");
  if (colonIndex > 0) {
    const code = candidate.slice(0, colonIndex).trim().toUpperCase();
    const otp = candidate.slice(colonIndex + 1).replace(/\D/g, "");
    if (otp.length === ROTATING_QR_DIGITS) {
      return { code, otp };
    }
  }

  return { code: candidate.toUpperCase() };
}

export function validateRotatingOtpForCheckIn(
  totpSecret: string | null | undefined,
  otp: string | undefined,
): { ok: true } | { ok: false; error: string } {
  if (!totpSecret) return { ok: true };

  if (!otp) {
    return { ok: true };
  }

  if (!verifyRotatingOtp(totpSecret, otp)) {
    return {
      ok: false,
      error: "QR expired — ask guest to refresh their ticket screen.",
    };
  }

  return { ok: true };
}

export function getSecondsUntilNextRotatingQr(): number {
  const now = Math.floor(Date.now() / 1000);
  const elapsed = now % ROTATING_QR_STEP_SECONDS;
  return ROTATING_QR_STEP_SECONDS - elapsed;
}

export function maskTicketCode(code: string): string {
  if (code.length <= 8) return code;
  return `${code.slice(0, 5)}${"•".repeat(Math.min(8, code.length - 5))}`;
}

export function parseTicketCodeFromScan(text: string): string {
  const payload = parseScannedTicketPayload(text);
  const normalized = payload.code.trim().toUpperCase();
  if (normalized.length < 8 || normalized.length > 48) return "";
  return normalized;
}
