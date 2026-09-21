import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg px-4 py-10">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-brand text-xl font-bold text-text-inverse">
          P
        </div>
        <p className="text-lg font-semibold">nfit</p>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
