import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div className={cn("glass rounded-2xl p-5", hover && "card-hover", className)}>{children}</div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-300/80">{eyebrow}</p>
        )}
        <h1 className="font-[var(--font-display)] text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {title}
        </h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-slate-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Badge({
  children,
  tone = "violet",
  className,
}: {
  children: ReactNode;
  tone?: "violet" | "cyan" | "emerald" | "amber" | "rose" | "slate";
  className?: string;
}) {
  const tones: Record<string, string> = {
    violet: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    cyan: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    rose: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    slate: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}

export function ProgressBar({ value, tone = "violet" }: { value: number; tone?: "violet" | "cyan" | "emerald" | "amber" | "rose" }) {
  const clamped = Math.max(0, Math.min(100, value));
  const tones: Record<string, string> = {
    violet: "from-violet-500 to-fuchsia-400",
    cyan: "from-cyan-400 to-sky-500",
    emerald: "from-emerald-400 to-teal-500",
    amber: "from-amber-400 to-orange-500",
    rose: "from-rose-400 to-pink-500",
  };
  return (
    <div className="progress-track h-2 w-full">
      <div
        className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", tones[tone])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export function Button({
  children,
  className,
  variant = "primary",
  type = "button",
  onClick,
  disabled,
}: {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "ghost" | "outline" | "danger";
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}) {
  const variants: Record<string, string> = {
    primary:
      "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-900/40 hover:opacity-90",
    ghost: "bg-white/5 text-slate-200 hover:bg-white/10",
    outline: "border border-white/15 text-slate-200 hover:bg-white/5",
    danger: "bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function StatCard({
  label,
  value,
  sub,
  tone = "violet",
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "violet" | "cyan" | "emerald" | "amber" | "rose";
  icon?: ReactNode;
}) {
  const tones: Record<string, string> = {
    violet: "text-violet-300",
    cyan: "text-cyan-300",
    emerald: "text-emerald-300",
    amber: "text-amber-300",
    rose: "text-rose-300",
  };
  return (
    <Card hover className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-2 font-[var(--font-display)] text-3xl font-bold text-white">{value}</p>
          {sub && <p className={cn("mt-1 text-xs font-medium", tones[tone])}>{sub}</p>}
        </div>
        {icon && <div className={cn("rounded-xl bg-white/5 p-2.5", tones[tone])}>{icon}</div>}
      </div>
    </Card>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
      <p className="text-sm font-semibold text-slate-300">{title}</p>
      {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
    </div>
  );
}
