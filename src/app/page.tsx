import { redirect } from "next/navigation";

/** Por enquanto: abre direto na área do personal (sem login). */
export default function HomePage() {
  redirect("/dashboard");
}
