import { AppName } from "@/components/ui/AppName";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg px-4 py-10">
      <div className="mb-8 text-center">
        <AppName size="lg" className="mx-auto" />
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
