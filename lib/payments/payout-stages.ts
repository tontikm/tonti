export type PayoutStage = "stage1" | "stage2";

export type PayoutVerificationMethod = "cipc" | "id_bank_letter";

export const PAYOUT_SETTLE_DAYS_AFTER_EVENT = 3;
export const PARTIAL_WITHDRAWAL_DAYS_BEFORE_EVENT = 10;
export const PARTIAL_WITHDRAWAL_RATE = 0.5;

function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

function addCalendarDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  next.setHours(23, 59, 59, 999);
  return next;
}

function parseEventDate(dateStr: string): Date {
  const date = new Date(`${dateStr}T23:59:59`);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export function isOrganizerPayoutVerified(organizer: {
  payoutVerifiedAt?: string | null;
}): boolean {
  return Boolean(organizer.payoutVerifiedAt);
}

export function getOrganizerPayoutStage(
  completedPaidEventCount: number,
  verified: boolean,
): PayoutStage {
  if (completedPaidEventCount >= 2 && verified) return "stage2";
  return "stage1";
}

export function getPayoutStageLabel(stage: PayoutStage): string {
  return stage === "stage2" ? "Stage 2 — partial withdrawal" : "Stage 1 — full hold";
}

export type EventPayoutAvailability = {
  organizerNet: number;
  paidOut: number;
  remaining: number;
  held: number;
  withdrawable: number;
  settlesAt: Date;
  partialOpensAt: Date | null;
};

export function computeEventPayoutAvailability(input: {
  stage: PayoutStage;
  eventDate: string;
  eventEndDate?: string | null;
  organizerNet: number;
  paidOut: number;
  now?: Date;
}): EventPayoutAvailability {
  const now = input.now ?? new Date();
  const eventDate = parseEventDate(input.eventDate);
  const eventEnd = parseEventDate(input.eventEndDate ?? input.eventDate);
  const settlesAt = addCalendarDays(eventEnd, PAYOUT_SETTLE_DAYS_AFTER_EVENT);
  const partialOpensAt =
    input.stage === "stage2"
      ? addCalendarDays(eventDate, -PARTIAL_WITHDRAWAL_DAYS_BEFORE_EVENT)
      : null;

  const remaining = roundCurrency(Math.max(0, input.organizerNet - input.paidOut));

  if (remaining <= 0) {
    return {
      organizerNet: input.organizerNet,
      paidOut: input.paidOut,
      remaining: 0,
      held: 0,
      withdrawable: 0,
      settlesAt,
      partialOpensAt,
    };
  }

  if (input.stage === "stage1") {
    if (now < settlesAt) {
      return {
        organizerNet: input.organizerNet,
        paidOut: input.paidOut,
        remaining,
        held: remaining,
        withdrawable: 0,
        settlesAt,
        partialOpensAt,
      };
    }
    return {
      organizerNet: input.organizerNet,
      paidOut: input.paidOut,
      remaining,
      held: 0,
      withdrawable: remaining,
      settlesAt,
      partialOpensAt,
    };
  }

  if (!partialOpensAt || now < partialOpensAt) {
    return {
      organizerNet: input.organizerNet,
      paidOut: input.paidOut,
      remaining,
      held: remaining,
      withdrawable: 0,
      settlesAt,
      partialOpensAt,
    };
  }

  if (now >= settlesAt) {
    return {
      organizerNet: input.organizerNet,
      paidOut: input.paidOut,
      remaining,
      held: 0,
      withdrawable: remaining,
      settlesAt,
      partialOpensAt,
    };
  }

  const maxPartial = roundCurrency(input.organizerNet * PARTIAL_WITHDRAWAL_RATE);
  const partialCapRemaining = roundCurrency(Math.max(0, maxPartial - input.paidOut));
  const withdrawable = roundCurrency(Math.min(remaining, partialCapRemaining));
  const held = roundCurrency(remaining - withdrawable);

  return {
    organizerNet: input.organizerNet,
    paidOut: input.paidOut,
    remaining,
    held,
    withdrawable,
    settlesAt,
    partialOpensAt,
  };
}

export type OrganizerPayoutStageInfo = {
  stage: PayoutStage;
  completedPaidEventCount: number;
  verified: boolean;
  verificationMethod: PayoutVerificationMethod | null;
  verificationNotes: string | null;
  verifiedAt: string | null;
};

export function getVerificationRequirementsCopy(): string {
  return "CIPC registration or ID document plus bank confirmation letter.";
}
