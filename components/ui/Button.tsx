import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = {
  href?: string;
  variant?: "primary" | "secondary" | "ghost" | "emerald" | "brand";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  form?: string;
};

const variants = {
  primary:
    "bg-accent text-accent-foreground hover:bg-accent-hover shadow-lg shadow-white/10",
  secondary:
    "border border-border bg-surface text-foreground hover:border-foreground/40 hover:bg-surface-hover",
  ghost: "text-muted hover:text-foreground hover:bg-surface",
  emerald:
    "bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20",
  brand:
    "bg-brand text-brand-foreground hover:bg-brand-hover brand-glow",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  onClick,
  type = "button",
  disabled,
  form,
}: ButtonProps) {
  const classes = cn(
    "focus-ring inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all",
    variants[variant],
    sizes[size],
    disabled && "pointer-events-none opacity-50",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      form={form}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
