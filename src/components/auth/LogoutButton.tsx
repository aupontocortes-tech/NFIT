"use client";

import { Button } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { resetProfile } from "@/lib/profile";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton({
  className,
  compact,
}: {
  className?: string;
  /** Só ícone + “Sair”, para header/sidebar. */
  compact?: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await api.logout();
      resetProfile();
      toast("Sessão encerrada", "info");
      // Navegação completa: limpa estado do cliente e libera login com outro perfil.
      window.location.assign("/login");
    } catch {
      setLoading(false);
      router.push("/login");
    }
  }

  return (
    <Button
      type="button"
      variant={compact ? "ghost" : "danger"}
      size="sm"
      loading={loading}
      onClick={logout}
      className={cn(compact && "text-text-muted hover:text-text", className)}
      aria-label="Sair"
    >
      <LogOut className="h-4 w-4" />
      {compact ? "Sair" : loading ? "Saindo…" : "Sair"}
    </Button>
  );
}
