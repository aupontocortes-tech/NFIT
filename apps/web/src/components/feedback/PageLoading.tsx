import { Skeleton, SkeletonList } from "@/components/ui";

/** Esqueleto exibido enquanto uma página carrega. */
export function PageLoading({ compact = false }: { compact?: boolean }) {
  return (
    <div aria-busy="true" aria-label="Carregando" className="flex flex-col gap-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      {!compact && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      )}
      <SkeletonList rows={compact ? 3 : 4} />
    </div>
  );
}
