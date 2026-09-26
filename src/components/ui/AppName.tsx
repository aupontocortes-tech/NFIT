import { cn } from "@/lib/utils";

/** Ícone do app ao lado do nome NFIT. */
export function AppName({
  size = "md",
  className,
}: {
  size?: "md" | "lg";
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
        className="shrink-0 rounded-[22%]"
      />
      <span className={cn("font-semibold tracking-wide text-text", size === "lg" ? "text-xl" : "text-base")}>
        NFIT
      </span>
    </div>
  );
}
