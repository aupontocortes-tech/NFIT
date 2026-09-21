import type { HTMLAttributes, ReactNode } from "react";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "ok" | "warn" | "danger" | "accent";
  children: ReactNode;
}) {
  const tones = {
    neutral: "bg-white/8 text-zinc-200",
    ok: "bg-emerald-400/15 text-emerald-300",
    warn: "bg-amber-400/15 text-amber-200",
    danger: "bg-rose-400/15 text-rose-300",
    accent: "bg-lime-300/15 text-lime-200",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone])}>
      {children}
    </span>
  );
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-white/8 bg-white/[0.035] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]", className)}
      {...props}
    />
  );
}

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm text-zinc-400">{label}</span>
      {children}
      {error ? <span className="block text-xs text-rose-300">{error}</span> : null}
    </label>
  );
}

export function inputClassName() {
  return "w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-lime-300/60 focus:ring-2 focus:ring-lime-300/20";
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center">
      <p className="font-medium text-zinc-200">{title}</p>
      {hint ? <p className="mt-1 text-sm text-zinc-500">{hint}</p> : null}
    </div>
  );
}
