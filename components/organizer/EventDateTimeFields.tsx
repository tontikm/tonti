"use client";

import { EventCalendarPicker } from "@/components/organizer/EventCalendarPicker";
import { combineSastDateAndTime } from "@/lib/utils";

type EventDateTimeFieldsProps = {
  showDate: string;
  showTime: string;
  endDate: string;
  onShowDateChange: (value: string) => void;
  onShowTimeChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
};

const fieldClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-foreground/40 focus:outline-none";

export function EventDateTimeFields({
  showDate,
  showTime,
  endDate,
  onShowDateChange,
  onShowTimeChange,
  onEndDateChange,
}: EventDateTimeFieldsProps) {
  const showDateTime =
    showDate && showTime ? combineSastDateAndTime(showDate, showTime) : "";
  const endDateTime =
    endDate && showTime ? combineSastDateAndTime(endDate, showTime) : "";
  const minShowDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <EventCalendarPicker
          label="Show date *"
          inputId="showDate"
          value={showDate}
          onChange={onShowDateChange}
          required
          minDate={minShowDate}
          placeholder="Pick start date"
        />

        <EventCalendarPicker
          label="End date (optional)"
          inputId="endDate"
          value={endDate}
          onChange={onEndDateChange}
          minDate={showDate || minShowDate}
          placeholder="Pick end date"
        />

        <div>
          <label htmlFor="showTime" className="mb-1.5 block text-sm font-medium">
            Show time (SAST) *
          </label>
          <input
            id="showTime"
            type="time"
            required
            value={showTime}
            onChange={(event) => onShowTimeChange(event.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      <p className="text-xs text-muted">
        Tap a date field to open the calendar. Doors open time is set separately below.
      </p>

      <input
        type="hidden"
        name="showDateTime"
        value={showDateTime}
        required={Boolean(showDate && showTime)}
      />
      <input type="hidden" name="endDateTime" value={endDateTime} />
    </div>
  );
}
