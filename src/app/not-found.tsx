import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
      <div className="rounded-full bg-brand-muted p-4 text-brand">
        <SearchX className="h-8 w-8" />
      </div>
      <div className="space-y-1">
        <p className="text-lg font-semibold text-text">Página não encontrada</p>
        <p className="text-sm text-text-muted">O endereço que você abriu não existe ou foi movido.</p>
      </div>
      <Link href="/">
        <Button>Voltar ao início</Button>
      </Link>
    </div>
  );
}
