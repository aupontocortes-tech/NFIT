import { PersonalShell } from "@/components/layout/PersonalShell";
import type { ReactNode } from "react";

export default function PersonalLayout({ children }: { children: ReactNode }) {
  return <PersonalShell>{children}</PersonalShell>;
}
