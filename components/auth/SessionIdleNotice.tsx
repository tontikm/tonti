type SessionIdleNoticeProps = {
  message: string;
};

export function SessionIdleNotice({ message }: SessionIdleNoticeProps) {
  return (
    <p className="rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-sm text-amber-100">
      {message}
    </p>
  );
}
