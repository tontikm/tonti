"use client";

import { useEffect, useMemo, useRef, useState, useLayoutEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const POPOVER_WIDTH = 280;
const POPOVER_HEIGHT = 320;

type EventCalendarPickerProps = {
  label: string;
  value: string;
  onChange: (date: string) => void;
  required?: boolean;
  minDate?: string;
  placeholder?: string;
  inputId?: string;
};

function parseDate(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string): string {
  const date = parseDate(value);
  if (!date) return "";
  return date.toLocaleDateString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

export function EventCalendarPicker({
  label,
  value,
  onChange,
  required = false,
  minDate,
  placeholder = "Select date",
  inputId,
}: EventCalendarPickerProps) {
  const selected = parseDate(value);
  const [open, setOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const [visibleMonth, setVisibleMonth] = useState(
    () => startOfMonth(selected ?? new Date()),
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerId = inputId ?? label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const days = useMemo(() => {
    const first = startOfMonth(visibleMonth);
    const startOffset = (first.getDay() + 6) % 7;
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - startOffset);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      return date;
    });
  }, [visibleMonth]);

  useLayoutEffect(() => {
    if (!open || !containerRef.current) return;

    function updatePosition() {
      const rect = containerRef.current!.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openAbove = spaceBelow < POPOVER_HEIGHT + 16;
      const left = Math.max(
        8,
        Math.min(rect.left, window.innerWidth - POPOVER_WIDTH - 8),
      );
      const top = openAbove
        ? Math.max(8, rect.top - POPOVER_HEIGHT - 8)
        : rect.bottom + 8;

      setPopoverStyle({
        position: "fixed",
        left,
        top,
        width: POPOVER_WIDTH,
        zIndex: 50,
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (open && value) {
      const date = parseDate(value);
      if (date) setVisibleMonth(startOfMonth(date));
    }
  }, [open, value]);

  const monthLabel = visibleMonth.toLocaleDateString("en-ZA", {
    month: "long",
    year: "numeric",
  });

  function selectDate(dateValue: string) {
    onChange(dateValue);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor={triggerId} className="text-sm font-medium text-foreground">
          {label}
        </label>
        {value && !required && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-muted hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>

      <button
        id={triggerId}
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-2.5 text-left text-sm transition-colors",
          "hover:border-foreground/30 focus:border-foreground/40 focus:outline-none",
          open && "border-foreground/40",
        )}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={value ? "text-foreground" : "text-muted"}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <Calendar className="h-4 w-4 shrink-0 text-muted" />
      </button>

      {required && (
        <input
          tabIndex={-1}
          aria-hidden
          value={value}
          required
          readOnly
          className="pointer-events-none absolute h-0 w-0 opacity-0"
          onChange={() => undefined}
        />
      )}

      {open && (
        <div
          role="dialog"
          aria-label={label}
          style={popoverStyle}
          className="rounded-2xl border border-border bg-black p-3 shadow-2xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setVisibleMonth((month) => addMonths(month, -1))}
              className="rounded-full border border-border p-1.5 text-muted hover:text-foreground"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <p className="text-sm font-medium">{monthLabel}</p>
            <button
              type="button"
              onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
              className="rounded-full border border-border p-1.5 text-muted hover:text-foreground"
              aria-label="Next month"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center text-[11px] text-muted">
            {WEEKDAYS.map((day) => (
              <div key={day} className="py-1 font-medium">
                {day}
              </div>
            ))}
          </div>

          <div className="mt-0.5 grid grid-cols-7 gap-0.5">
            {days.map((date) => {
              const dateValue = formatDateValue(date);
              const inMonth = date.getMonth() === visibleMonth.getMonth();
              const isSelected = value === dateValue;
              const isDisabled = Boolean(minDate && dateValue < minDate);
              const isToday = dateValue === formatDateValue(new Date());

              return (
                <button
                  key={dateValue}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => selectDate(dateValue)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg text-xs transition-colors",
                    inMonth ? "text-foreground" : "text-muted/35",
                    isSelected && "bg-accent text-accent-foreground",
                    !isSelected &&
                      !isDisabled &&
                      "hover:bg-white/10 hover:text-foreground",
                    isDisabled && "cursor-not-allowed opacity-30",
                    isToday && !isSelected && "ring-1 ring-inset ring-white/20",
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
