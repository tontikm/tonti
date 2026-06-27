"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Keyboard, ScanLine, XCircle } from "lucide-react";
import {
  checkInEventTicket,
  type CheckInResult,
} from "@/app/organizer/actions";
import { OrganizerTicketDetailCard } from "@/components/organizer/OrganizerTicketDetailCard";
import type { OrganizerTicketDetail } from "@/components/organizer/OrganizerTicketDetailCard";
import { ScannerGuestPanel } from "@/components/organizer/ScannerGuestPanel";
import { notifyCheckInResult } from "@/lib/scanner/feedback";
import {
  getRecentCheckInTickets,
  toOrganizerTicketDetail,
} from "@/lib/scanner/guest-search";
import { parseTicketCodeFromScan } from "@/lib/tickets/rotating-qr";
import type { EventTicketSummary, EventTicketWithBuyer } from "@/lib/types";

type DoorScannerProps = {
  eventSlug: string;
  eventTitle: string;
  summary: Pick<EventTicketSummary, "totalTickets" | "checkedIn" | "valid">;
  tickets?: EventTicketWithBuyer[];
  accessMode?: "full" | "scanOnly";
};

type ScanFeedback = CheckInResult & { scannedCode: string };

export function DoorScanner({
  eventSlug,
  eventTitle,
  summary,
  tickets = [],
  accessMode = "full",
}: DoorScannerProps) {
  const isScanOnly = accessMode === "scanOnly";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inputMode, setInputMode] = useState<"camera" | "manual">("camera");
  const [manualCode, setManualCode] = useState("");
  const [feedback, setFeedback] = useState<ScanFeedback | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [checkedInCount, setCheckedInCount] = useState(summary.checkedIn);
  const [recentCheckIns, setRecentCheckIns] = useState<OrganizerTicketDetail[]>(
    () =>
      getRecentCheckInTickets(tickets).map((ticket) =>
        toOrganizerTicketDetail(ticket),
      ),
  );
  const [pending, startTransition] = useTransition();
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);
  const processingRef = useRef(false);
  const lastScannedCodeRef = useRef<string | null>(null);
  const manualInputRef = useRef<HTMLInputElement>(null);
  const prefilled = searchParams.get("code");

  useEffect(() => {
    setCheckedInCount(summary.checkedIn);
  }, [summary.checkedIn]);

  useEffect(() => {
    if (isScanOnly) return;
    setRecentCheckIns(
      getRecentCheckInTickets(tickets).map((ticket) =>
        toOrganizerTicketDetail(ticket),
      ),
    );
  }, [isScanOnly, tickets]);

  const runCheckIn = useCallback(
    (rawCode: string) => {
      const code = parseTicketCodeFromScan(rawCode);
      if (!code || processingRef.current) return;

      if (feedback?.scannedCode === code) return;
      if (lastScannedCodeRef.current === code && feedback) return;

      processingRef.current = true;
      lastScannedCodeRef.current = code;

      startTransition(async () => {
        const result = await checkInEventTicket(rawCode, eventSlug);
        setFeedback({ ...result, scannedCode: code });
        processingRef.current = false;
        notifyCheckInResult(result.ok);

        if (result.ok) {
          setCheckedInCount((count) => count + 1);
          if (!isScanOnly && result.ticket) {
            setRecentCheckIns((current) => {
              const next = toOrganizerTicketDetail(result.ticket!);
              return [
                next,
                ...current.filter((item) => item.code !== next.code),
              ].slice(0, 5);
            });
          }
        }

        router.refresh();
      });
    },
    [eventSlug, feedback, isScanOnly, router],
  );

  useEffect(() => {
    if (prefilled) {
      setManualCode(prefilled);
      runCheckIn(prefilled);
    }
  }, [prefilled, runCheckIn]);

  useEffect(() => {
    if (inputMode !== "camera" || feedback !== null) {
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

        const qrSize =
          typeof window !== "undefined"
            ? Math.min(Math.round(window.innerWidth * 0.85), 320)
            : 280;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: qrSize, height: qrSize } },
          (decoded) => {
            if (processingRef.current) return;
            const code = parseTicketCodeFromScan(decoded);
            if (!code) return;
            if (lastScannedCodeRef.current === code) return;
            runCheckIn(decoded);
          },
          () => undefined,
        );
      } catch {
        if (!cancelled) {
          setCameraError("Camera access unavailable. Use manual entry instead.");
          setInputMode("manual");
        }
      }
    }

    startScanner();

    return () => {
      cancelled = true;
      scannerRef.current?.stop().catch(() => undefined);
      scannerRef.current = null;
    };
  }, [inputMode, feedback, runCheckIn]);

  function onManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    runCheckIn(manualCode);
  }

  function clearFeedback() {
    setFeedback(null);
    setManualCode("");
    processingRef.current = false;
    lastScannedCodeRef.current = null;

    if (inputMode === "manual") {
      window.setTimeout(() => manualInputRef.current?.focus(), 0);
    }
  }

  const progress =
    summary.totalTickets > 0
      ? Math.min(100, Math.round((checkedInCount / summary.totalTickets) * 100))
      : 0;

  const feedbackActionClassName =
    "mt-4 w-full rounded-full border border-border py-2.5 text-sm text-muted transition-colors hover:text-foreground";

  const isAlreadyUsed =
    !feedback?.ok && feedback?.error === "Already checked in.";

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="sticky top-0 z-10 -mx-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:rounded-2xl sm:border sm:px-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted">
              Check-ins
            </p>
            <p className="mt-0.5 text-2xl font-semibold tabular-nums">
              {checkedInCount}
              <span className="text-lg font-normal text-muted">
                {" "}
                / {summary.totalTickets}
              </span>
            </p>
          </div>
          <p className="text-right text-xs text-muted">
            {summary.valid} valid
            <br />
            {progress}% in
          </p>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex gap-2 rounded-full border border-border bg-surface p-1">
        <button
          type="button"
          onClick={() => {
            setFeedback(null);
            lastScannedCodeRef.current = null;
            setInputMode("camera");
          }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            inputMode === "camera"
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
            lastScannedCodeRef.current = null;
            setInputMode("manual");
          }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            inputMode === "manual"
              ? "bg-violet-600 text-white shadow-md shadow-violet-900/30"
              : "text-muted hover:text-foreground"
          }`}
        >
          <Keyboard className="h-4 w-4" />
          Manual
        </button>
      </div>

      {!feedback && inputMode === "camera" && (
        <div className="-mx-4 overflow-hidden border-y border-border bg-black sm:mx-0 sm:rounded-2xl sm:border">
          <div
            id="door-scanner-viewport"
            className="min-h-[55dvh] w-full sm:min-h-[420px]"
          />
          {cameraError && (
            <p className="px-4 py-3 text-sm text-amber-400">{cameraError}</p>
          )}
          <p className="px-4 pb-4 text-center text-xs text-muted">
            Point at the guest&apos;s live QR (refreshes every 30s) for {eventTitle}
          </p>
        </div>
      )}

      {!feedback && inputMode === "manual" && (
        <form onSubmit={onManualSubmit} className="space-y-4">
          <div>
            <label htmlFor="ticketCode" className="mb-1.5 block text-sm font-medium">
              Ticket code
            </label>
            <input
              ref={manualInputRef}
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
                {feedback.ok
                  ? "Checked in"
                  : (feedback.error ?? "Check-in failed")}
              </p>
              {!feedback.ticket && (
                <p className="mt-1 font-mono text-sm text-muted">
                  {feedback.scannedCode}
                </p>
              )}
              {feedback.ticket && (
                <OrganizerTicketDetailCard
                  ticket={feedback.ticket}
                  variant={isAlreadyUsed ? "alreadyUsed" : "checkedIn"}
                  className="mt-4"
                />
              )}
            </div>
          </div>

          {(feedback.ok || feedback.ticket) && (
            <button
              type="button"
              onClick={clearFeedback}
              className={feedbackActionClassName}
            >
              {feedback.ok ? "Scan next ticket" : "Dismiss"}
            </button>
          )}

          {!feedback.ok && !feedback.ticket && (
            <button
              type="button"
              onClick={clearFeedback}
              className={feedbackActionClassName}
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {!isScanOnly && (
        <>
          <div className="flex items-center justify-between gap-3 text-sm">
            <Link
              href={`/organizer/events/${eventSlug}/tickets`}
              className="text-muted transition-colors hover:text-foreground"
            >
              Full guest list
            </Link>
          </div>

          <ScannerGuestPanel
            eventSlug={eventSlug}
            tickets={tickets}
            recentCheckIns={recentCheckIns}
          />
        </>
      )}
    </div>
  );
}
