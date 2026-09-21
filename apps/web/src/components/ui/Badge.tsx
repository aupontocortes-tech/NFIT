import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import type { HTMLAttributes } from "react";

type Tone =
  | "draft"
  | "active"
  | "paused"
  | "paid"
  | "pending"
  | "overdue"
  | "ai"
  | "invite"
  | "default";

const tones: Record<Tone, string> = {
  draft: "bg-status-draft text-status-draft-text",
  active: "bg-status-active text-status-active-text",
  paused: "bg-status-paused text-status-paused-text",
  paid: "bg-status-active text-status-active-text",
  pending: "bg-amber-100 text-amber-800",
  overdue: "bg-red-100 text-red-700",
  ai: "bg-ai text-ai-text",
  invite: "bg-brand-muted text-brand-hover",
  default: "bg-gray-100 text-text-muted",
};

const labels: Partial<Record<Tone, string>> = {
  draft: "Rascunho",
  active: "Ativo",
  paused: "Pausado",
  paid: "Pago",
  pending: "Pendente",
  overdue: "Atrasado",
  ai: "Gerado por IA",
  invite: "Convite pendente",
};

export function Badge({
  tone = "default",
  children,
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    >
      {tone === "ai" ? <Sparkles className="h-3 w-3" /> : null}
      {children ?? labels[tone]}
    </span>
  );
}
