"use client";

import { Avatar, Button, Card, Input, PageHeader } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AlunoPerfilPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email] = useState("");

  async function logout() {
    await api.logout();
    toast("Sessão encerrada", "info");
    router.push("/login");
  }

  return (
    <div>
      <PageHeader title="Perfil" />
      <div className="mb-6 flex justify-center">
        <Avatar name={name} size="lg" />
      </div>
      <Card className="mb-4 space-y-4">
        <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="E-mail" value={email} disabled />
        <Button
          onClick={() => toast("Perfil atualizado")}
        >
          Salvar
        </Button>
      </Card>
      <Card className="space-y-3">
        <Link href="/aluno/pagamentos" className="block text-sm text-brand">
          Pagamentos
        </Link>
        <Button variant="danger" onClick={logout}>
          Sair
        </Button>
      </Card>
    </div>
  );
}
