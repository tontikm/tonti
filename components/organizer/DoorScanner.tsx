"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Keyboard, ScanLine, XCircle } from "lucide-react";
import {
  checkInEventTicket,
  type CheckInResult,
} from "@/app/organizer/actions";
import { OrganizerTicketDetailCard } from "@/components/organizer/OrganizerTicketDetailCard";
import { parseTicketCodeFromScan } from "@/lib/tickets";

type DoorScannerProps = {
  eventSlug: string;
  eventTitle: string;
};

type ScanFeedback = CheckInResult & { scannedCode: string };

export function DoorScanner({ eventSlug, eventTitle }: DoorScannerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"camera" | "manual">("camera");
  const [manualCode, setManualCode] = useState("");
  const [feedback, setFeedback] = useState<ScanFeedback | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);
  const processingRef = useRef(false);
  const prefilled = searchParams.get("code");

  const runCheckIn = useCallback(
    (rawCode: string) => {
      const code = parseTicketCodeFromScan(rawCode);
      if (!code || processingRef.current) return;

      processingRef.current = true;
      startTransition(async () => {
        const result = await checkInEventTicket(code, eventSlug);
        setFeedback({ ...result, scannedCode: code });
        processingRef.current = false;
        router.refresh();
      });
    },
    [eventSlug, router],
  );

  useEffect(() => {
    if (prefilled) {
      setManualCode(prefilled);
      runCheckIn(prefilled);
    }
  }, [prefilled, runCheckIn]);

  useEffect(() => {
    if (mode !== "camera") {
      scannerRef.current?.stop().catch(() => undefined);
      scannerRef.current = null;
      return;
    }

    let cancelled = false;

    async function startScanner() {
      setCameraError(null);
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;

        const scanner = new Html5Qrcode("door-scanner-viewport");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decoded) => {
            if (processingRef.current) return;
            runCheckIn(decoded);
          },
          () => undefined,
        );
      } catch {
        if (!cancelled) {
          setCameraError("Camera access unavailable. Use manual entry instead.");
          setMode("manual");
        }
      }
    }

    startScanner();

    return () => {
      cancelled = true;
      scannerRef.current?.stop().catch(() => undefined);
      scannerRef.current = null;
    };
  }, [mode, runCheckIn]);

  function onManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    runCheckIn(manualCode);
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 rounded-full border border-border bg-surface p-1">
        <button
          type="button"
          onClick={() => {
            setFeedback(null);
            setMode("camera");
          }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            mode === "camera"
              ? "bg-violet-600 text-white shadow-md shadow-violet-900/30"
              : "text-muted hover:text-foreground"
          }`}
        >
          <ScanLine className="h-4 w-4" />
          Scan
        </button>
        <button
          type="button"
          onClick={() => {
            setFeedback(null);
            setMode("manual");
          }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            mode === "manual"
              ? "bg-violet-600 text-white shadow-md shadow-violet-900/30"
              : "text-muted hover:text-foreground"
          }`}
        >
          <Keyboard className="h-4 w-4" />
          Manual
        </button>
      </div>

      {mode === "camera" && (
        <div className="overflow-hidden rounded-2xl border border-border bg-black">
          <div id="door-scanner-viewport" className="min-h-[280px] w-full" />
          {cameraError && (
            <p className="px-4 py-3 text-sm text-amber-400">{cameraError}</p>
          )}
          <p className="px-4 pb-4 text-center text-xs text-muted">
            Point at a Tonti QR code for {eventTitle}
          </p>
        </div>
      )}

      {mode === "manual" && (
        <form onSubmit={onManualSubmit} className="space-y-4">
          <div>
            <label htmlFor="ticketCode" className="mb-1.5 block text-sm font-medium">
              Ticket code
            </label>
            <input
              id="ticketCode"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="TNTI-ABC123-DEF456"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 font-mono text-sm uppercase tracking-wide focus:border-foreground/40 focus:outline-none"
              autoComplete="off"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={pending || !manualCode.trim()}
            className="w-full rounded-full bg-white py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Checking…" : "Check in ticket"}
          </button>
        </form>
      )}

      {feedback && (
        <div
          className={`rounded-2xl border p-5 ${
            feedback.ok
              ? "border-emerald-500/30 bg-emerald-500/10"
              : "border-amber-500/30 bg-amber-500/10"
          }`}
        >
          <div className="flex items-start gap-3">
            {feedback.ok ? (
              <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" />
            ) : (
              <XCircle className="h-6 w-6 shrink-0 text-amber-400" />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {feedback.ok ? "Checked in" : feedback.error ?? "Check-in failed"}
              </p>
              {!feedback.ticket && (
                <p className="mt-1 font-mono text-sm text-muted">{feedback.scannedCode}</p>
              )}
              {feedback.ticket && (
                <OrganizerTicketDetailCard
                  ticket={feedback.ticket}
                  className="mt-4"
                />
              )}
            </div>
          </div>

          {feedback.ok && (
            <button
              type="button"
              onClick={() => {
                setFeedback(null);
                setManualCode("");
                processingRef.current = false;
              }}
              className="mt-4 w-full rounded-full border border-border py-2.5 text-sm text-muted transition-colors hover:text-foreground"
            >
              Scan next ticket
            </button>
          )}
        </div>
      )}
    </div>
  );
}
