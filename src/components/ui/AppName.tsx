import { cn } from "@/lib/utils";

/** Ícone do app ao lado do nome NFIT. */
export function AppName({
  size = "md",
  iconOnly = false,
  className,
}: {
  size?: "md" | "lg";
  iconOnly?: boolean;
  className?: string;
}) {
  const px = size === "lg" ? 56 : 36;
  return (
    <div className={cn("flex w-fit items-center gap-2", className)} aria-label="NFIT">
      <img
        src="/icons/icon-192.png"
        alt=""
        width={px}
        height={px}
        className="shrink-0 rounded-[22%] ring-1 ring-white/15"
      />
      {iconOnly ? null : (
        <span className={cn("font-medium tracking-[0.22em] text-text", size === "lg" ? "text-lg" : "text-sm")}>
          NFIT
        </span>
      )}
    </div>
  );
}
