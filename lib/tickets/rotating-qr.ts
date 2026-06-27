import { generateSync, verifySync } from "otplib";

export const ROTATING_QR_STEP_SECONDS = 30;
export const ROTATING_QR_DIGITS = 6;
export const ROTATING_QR_EPOCH_TOLERANCE = 30;

export const TICKET_CODE_PATTERN = /^TNTI-[A-F0-9]{16}$/i;
export const ROTATING_PAYLOAD_PATTERN = /^TNTI-[A-F0-9]{16}:(\d+)$/i;

export type ScannedTicketPayload = {
  code: string;
  otp?: string;
  parseError?: "unrecognized" | "unreadable_qr";
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

function extractTicketCode(candidate: string): string | null {
  const direct = candidate.trim().toUpperCase();
  if (TICKET_CODE_PATTERN.test(direct)) return direct;

  const embedded = direct.match(/TNTI-[A-F0-9]{16}/)?.[0];
  if (embedded && TICKET_CODE_PATTERN.test(embedded)) return embedded;

  return null;
}

export function parseScannedTicketPayload(text: string): ScannedTicketPayload {
  const trimmed = text.trim();
  if (!trimmed) {
    return { code: "", parseError: "unrecognized" };
  }

  let candidate = trimmed;

  // Only parse http(s) verify links — bare "TNTI-…:123456" is a valid URL-like
  // string that would otherwise be misread as a custom scheme with OTP as path.
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const otpParam = url.searchParams.get("otp");
      const segment = url.pathname.split("/").filter(Boolean).pop() ?? "";
      if (otpParam) {
        const code = extractTicketCode(segment);
        if (!code) return { code: "", parseError: "unrecognized" };
        const otp = otpParam.replace(/\D/g, "");
        if (otp.length === ROTATING_QR_DIGITS) {
          return { code, otp };
        }
        return { code, parseError: "unreadable_qr" };
      }
      candidate = segment || trimmed;
    } catch {
      // Fall through to raw payload parsing.
    }
  }

  const rotatingMatch = candidate.match(ROTATING_PAYLOAD_PATTERN);
  if (rotatingMatch) {
    const code = extractTicketCode(candidate.slice(0, candidate.lastIndexOf(":")));
    if (!code) return { code: "", parseError: "unrecognized" };
    const otp = rotatingMatch[1].replace(/\D/g, "");
    if (otp.length === ROTATING_QR_DIGITS) {
      return { code, otp };
    }
    return { code, parseError: "unreadable_qr" };
  }

  const code = extractTicketCode(candidate);
  if (!code) {
    return { code: "", parseError: "unrecognized" };
  }

  if (candidate.includes(":")) {
    const otp = candidate.slice(candidate.lastIndexOf(":") + 1).replace(/\D/g, "");
    if (otp.length === ROTATING_QR_DIGITS) {
      return { code, otp };
    }
    return { code, parseError: "unreadable_qr" };
  }

  return { code };
}

export function getScanParseErrorMessage(text: string): string | null {
  const payload = parseScannedTicketPayload(text);
  if (payload.parseError === "unreadable_qr") {
    return "QR unreadable — brighten screen and hold steady.";
  }
  if (payload.parseError === "unrecognized" || !payload.code) {
    return "Unrecognized QR — ask the guest to open their live ticket screen.";
  }
  return null;
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
  if (!payload.code || !TICKET_CODE_PATTERN.test(payload.code)) return "";
  return payload.code;
}
