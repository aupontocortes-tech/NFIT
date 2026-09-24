import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function Empty({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className,
      )}
    >
      {Icon ? (
        <div className="rounded-full bg-brand-muted p-4 text-brand">
          <Icon className="h-8 w-8" />
        </div>
      ) : null}
      <p className="text-subtitle text-text">{title}</p>
      {description ? <p className="max-w-sm text-body-sm text-text-muted">{description}</p> : null}
      {action}
    </div>
  );
}
