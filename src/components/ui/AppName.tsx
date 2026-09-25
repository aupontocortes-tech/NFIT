import { cn } from "@/lib/utils";

/** N bem maior; FIT menor, na mesma base, com relevo. */
export function AppName({
  size = "md",
  className,
}: {
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <p className={cn("app-word", size === "lg" && "app-word-lg", className)} aria-label="NFIT">
      <span className="app-letter-n">N</span>
      <span className="app-letter-fit">FIT</span>
    </p>
  );
}
