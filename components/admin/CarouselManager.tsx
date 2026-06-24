"use client";

import { useActionState, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  ImageIcon,
  Trash2,
} from "lucide-react";
import {
  createCarouselCustomSlide,
  createCarouselEventSlide,
  deleteCarouselSlide,
  reorderCarouselSlide,
  toggleCarouselSlideActive,
  updateCarouselSlide,
  type AdminActionState,
} from "@/app/admin/actions";
import type {
  AdminCarouselSlideRow,
  CarouselImageSource,
} from "@/lib/carousel/slides";
import { resolveEventSlideImage } from "@/lib/carousel/slides";
import { getSafeEventImageUrl } from "@/lib/images";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type CarouselManagerProps = {
  slides: AdminCarouselSlideRow[];
  eventOptions: Array<{
    slug: string;
    title: string;
    hasHero: boolean;
    isPubliclyVisible: boolean;
  }>;
};

const initialState: AdminActionState = {};

function getSlidePreviewUrl(slide: AdminCarouselSlideRow): string {
  if (slide.slideType === "custom") {
    return getSafeEventImageUrl(slide.customImageUrl);
  }

  if (!slide.eventPosterUrl) {
    return getSafeEventImageUrl(null);
  }

  const { imageUrl } = resolveEventSlideImage(
    {
      image: slide.eventPosterUrl,
      heroImage: slide.eventHeroUrl ?? undefined,
    },
    slide.imageSource ?? "poster",
    slide.customImageUrl,
  );
  return imageUrl;
}

function SlideWarnings({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null;
  return (
    <ul className="mt-2 space-y-1">
      {warnings.map((warning) => (
        <li key={warning} className="text-xs text-amber-200">
          {warning}
        </li>
      ))}
    </ul>
  );
}

function EventSlideEditor({
  slide,
  pending,
  onSave,
}: {
  slide: AdminCarouselSlideRow;
  pending: boolean;
  onSave: (formData: FormData) => void;
}) {
  const [imageSource, setImageSource] = useState<CarouselImageSource>(
    slide.imageSource ?? "poster",
  );

  return (
    <form
      className="mt-4 space-y-3 border-t border-white/10 pt-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(new FormData(e.currentTarget));
      }}
    >
      <input type="hidden" name="slideId" value={slide.id} />
      <fieldset className="space-y-2">
        <legend className="text-xs font-medium uppercase tracking-wider text-muted">
          Image source
        </legend>
        {(
          [
            ["hero", "Organizer hero"],
            ["poster", "Organizer poster"],
            ["custom", "Custom upload"],
          ] as const
        ).map(([value, label]) => (
          <label key={value} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="imageSource"
              value={value}
              checked={imageSource === value}
              onChange={() => setImageSource(value)}
            />
            {label}
          </label>
        ))}
      </fieldset>

      {imageSource === "custom" && (
        <div>
          <label className="mb-1 block text-xs text-muted">
            Custom image
          </label>
          <input
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:text-foreground"
          />
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-muted">
            Title override (optional)
          </label>
          <input
            name="title"
            defaultValue={slide.title ?? ""}
            placeholder={slide.eventTitle ?? "Event title"}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">
            Subtitle override (optional)
          </label>
          <input
            name="subtitle"
            defaultValue={slide.subtitle ?? ""}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted">
          CTA label override (optional)
        </label>
        <input
          name="ctaLabel"
          defaultValue={slide.ctaLabel ?? ""}
          placeholder="Get tickets"
          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
        />
      </div>

      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        Save event slide
      </Button>
    </form>
  );
}

function CustomSlideEditor({
  slide,
  pending,
  onSave,
}: {
  slide: AdminCarouselSlideRow;
  pending: boolean;
  onSave: (formData: FormData) => void;
}) {
  return (
    <form
      className="mt-4 space-y-3 border-t border-white/10 pt-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(new FormData(e.currentTarget));
      }}
    >
      <input type="hidden" name="slideId" value={slide.id} />

      <div>
        <label className="mb-1 block text-xs text-muted">Replace image</label>
        <input
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:text-foreground"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-muted">Title</label>
          <input
            name="title"
            required
            defaultValue={slide.title ?? ""}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Subtitle</label>
          <input
            name="subtitle"
            defaultValue={slide.subtitle ?? ""}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-muted">Link URL</label>
          <input
            name="linkUrl"
            required
            defaultValue={slide.linkUrl ?? ""}
            placeholder="/for-organizers"
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">CTA label</label>
          <input
            name="ctaLabel"
            defaultValue={slide.ctaLabel ?? ""}
            placeholder="Learn more"
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        Save custom slide
      </Button>
    </form>
  );
}

export function CarouselManager({ slides, eventOptions }: CarouselManagerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedEventSlug, setSelectedEventSlug] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [customState, customAction, customPending] = useActionState(
    createCarouselCustomSlide,
    initialState,
  );

  const existingEventSlugs = new Set(
    slides
      .filter((slide) => slide.slideType === "event" && slide.eventSlug)
      .map((slide) => slide.eventSlug as string),
  );

  const availableEvents = eventOptions.filter(
    (event) => !existingEventSlugs.has(event.slug),
  );

  function refresh() {
    router.refresh();
  }

  function run(action: () => Promise<AdminActionState>) {
    startTransition(async () => {
      await action();
      refresh();
    });
  }

  function handleAddEvent() {
    if (!selectedEventSlug) return;
    run(() => createCarouselEventSlide(selectedEventSlug));
    setSelectedEventSlug("");
  }

  function handleUpdate(formData: FormData) {
    startTransition(async () => {
      await updateCarouselSlide(initialState, formData);
      refresh();
    });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-white/10 bg-surface/20 p-5">
        <h2 className="text-sm font-semibold">Add slides</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label className="mb-1 block text-xs text-muted">Event slide</label>
            <select
              value={selectedEventSlug}
              onChange={(e) => setSelectedEventSlug(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
            >
              <option value="">Select an event…</option>
              {availableEvents.map((event) => (
                <option key={event.slug} value={event.slug}>
                  {event.title}
                  {!event.isPubliclyVisible ? " (hidden)" : ""}
                  {event.hasHero ? " · has hero" : ""}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            size="sm"
            disabled={!selectedEventSlug || pending}
            onClick={handleAddEvent}
          >
            Add event
          </Button>
        </div>

        <form action={customAction} className="mt-6 space-y-3 border-t border-white/10 pt-6">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted">
            Custom promo slide
          </h3>
          <div>
            <label className="mb-1 block text-xs text-muted">Image</label>
            <input
              type="file"
              name="image"
              required
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:text-foreground"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-muted">Title</label>
              <input
                name="title"
                required
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Subtitle</label>
              <input
                name="subtitle"
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-muted">Link URL</label>
              <input
                name="linkUrl"
                required
                placeholder="/for-organizers"
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">CTA label</label>
              <input
                name="ctaLabel"
                placeholder="Learn more"
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
              />
            </div>
          </div>
          {customState.error && (
            <p className="text-sm text-red-300">{customState.error}</p>
          )}
          {customState.success && (
            <p className="text-sm text-emerald-300">{customState.success}</p>
          )}
          <Button type="submit" size="sm" disabled={customPending || pending}>
            Add custom slide
          </Button>
        </form>
      </section>

      {slides.length === 0 ? (
        <p className="text-sm text-muted">
          No carousel slides yet. Add an event or custom promo above.
        </p>
      ) : (
        <div className="space-y-4">
          {slides.map((slide, index) => {
            const previewUrl = getSlidePreviewUrl(slide);
            const isExpanded = expandedId === slide.id;

            return (
              <article
                key={slide.id}
                className="rounded-2xl border border-white/10 bg-surface/20 p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-black sm:w-48">
                    <Image
                      src={previewUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="192px"
                      unoptimized={previewUrl.includes("blob:")}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                              slide.slideType === "event"
                                ? "bg-sky-500/20 text-sky-200"
                                : "bg-violet-500/20 text-violet-200",
                            )}
                          >
                            {slide.slideType}
                          </span>
                          {!slide.active && (
                            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted">
                              Hidden
                            </span>
                          )}
                          <span className="text-xs text-muted">
                            Position {index + 1}
                          </span>
                        </div>
                        <h3 className="mt-2 font-medium">
                          {slide.slideType === "event"
                            ? slide.eventTitle ?? slide.eventSlug
                            : slide.title}
                        </h3>
                        {slide.slideType === "event" && slide.imageSource && (
                          <p className="mt-1 text-xs text-muted">
                            Image: {slide.imageSource}
                          </p>
                        )}
                        <SlideWarnings warnings={slide.warnings} />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={pending || index === 0}
                          onClick={() =>
                            run(() => reorderCarouselSlide(slide.id, "up"))
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-muted hover:text-foreground disabled:opacity-40"
                          aria-label="Move up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={pending || index === slides.length - 1}
                          onClick={() =>
                            run(() => reorderCarouselSlide(slide.id, "down"))
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-muted hover:text-foreground disabled:opacity-40"
                          aria-label="Move down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() =>
                            run(() =>
                              toggleCarouselSlideActive(slide.id, !slide.active),
                            )
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-muted hover:text-foreground"
                          aria-label={slide.active ? "Hide slide" : "Show slide"}
                        >
                          {slide.active ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => setExpandedId(isExpanded ? null : slide.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-muted hover:text-foreground"
                        >
                          <ImageIcon className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => {
                            if (
                              window.confirm(
                                "Remove this slide from the homepage carousel?",
                              )
                            ) {
                              run(() => deleteCarouselSlide(slide.id));
                            }
                          }}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/30 text-red-300 hover:bg-red-950/30"
                          aria-label="Delete slide"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {isExpanded &&
                      (slide.slideType === "event" ? (
                        <EventSlideEditor
                          slide={slide}
                          pending={pending}
                          onSave={handleUpdate}
                        />
                      ) : (
                        <CustomSlideEditor
                          slide={slide}
                          pending={pending}
                          onSave={handleUpdate}
                        />
                      ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
