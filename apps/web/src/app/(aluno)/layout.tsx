import { AlunoShell } from "@/components/layout/AlunoShell";
import type { ReactNode } from "react";

export default function AlunoLayout({ children }: { children: ReactNode }) {
  return <AlunoShell>{children}</AlunoShell>;
}
