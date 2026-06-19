type OrganizerAuthCardProps = {
  backLink?: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function OrganizerAuthCard({
  backLink,
  title,
  description,
  children,
  footer,
}: OrganizerAuthCardProps) {
  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-12 sm:py-16">
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-48 w-48 rounded-full bg-violet-600/15 blur-3xl" />
      <div className="pointer-events-none absolute right-1/4 top-1/3 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />

      {backLink}

      <div className="relative rounded-[28px] border border-violet-500/20 bg-white/[0.03] p-6 shadow-2xl shadow-violet-900/30 backdrop-blur-sm sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-300">
          Organizer
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
        <div className="mt-8">{children}</div>
        {footer ? <div className="mt-6 border-t border-white/10 pt-6">{footer}</div> : null}
      </div>
    </div>
  );
}
