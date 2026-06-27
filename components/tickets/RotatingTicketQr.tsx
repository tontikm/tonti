"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  ROTATING_QR_STEP_SECONDS,
  buildRotatingQrPayload,
  getSecondsUntilNextRotatingQr,
} from "@/lib/tickets/rotating-qr";

type RotatingTicketQrProps = {
  code: string;
  totpSecret: string;
  size?: number;
};

function useResponsiveQrSize(defaultSize: number): number {
  const [size, setSize] = useState(defaultSize);

  useEffect(() => {
    const update = () => {
      setSize(window.innerWidth < 640 ? 248 : defaultSize);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [defaultSize]);

  return size;
}

export function RotatingTicketQr({
  code,
  totpSecret,
  size: sizeProp = 220,
}: RotatingTicketQrProps) {
  const size = useResponsiveQrSize(sizeProp);
  const [secondsLeft, setSecondsLeft] = useState(getSecondsUntilNextRotatingQr);
  const [qrMarkup, setQrMarkup] = useState("");

  const payload = useMemo(
    () => buildRotatingQrPayload(code, totpSecret),
    [code, totpSecret, secondsLeft],
  );

  useEffect(() => {
    const tick = () => setSecondsLeft(getSecondsUntilNextRotatingQr());
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function renderQr() {
      const svg = await QRCode.toString(payload, {
        type: "svg",
        margin: 2,
        width: size,
        errorCorrectionLevel: "L",
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      if (!cancelled) setQrMarkup(svg);
    }

    void renderQr();
    return () => {
      cancelled = true;
    };
  }, [payload, size]);

  const progress =
    ((ROTATING_QR_STEP_SECONDS - secondsLeft) / ROTATING_QR_STEP_SECONDS) * 100;
  const ringSize = size + 24;
  const radius = ringSize / 2 - 6;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative inline-flex items-center justify-center"
        style={{ width: ringSize, height: ringSize }}
      >
        <svg
          className="absolute inset-0 -rotate-90"
          width={ringSize}
          height={ringSize}
          viewBox={`0 0 ${ringSize} ${ringSize}`}
          aria-hidden
        >
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-white/10"
          />
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="text-emerald-400 transition-all duration-1000"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress / 100)}
          />
        </svg>
        <div
          className="relative inline-flex rounded-xl bg-white p-3"
          dangerouslySetInnerHTML={{ __html: qrMarkup }}
          aria-label="Live entry QR code"
        />
      </div>
      <p className="text-center text-xs text-muted">
        Refreshes in {secondsLeft}s · screenshots won&apos;t work at the door
      </p>
    </div>
  );
}
