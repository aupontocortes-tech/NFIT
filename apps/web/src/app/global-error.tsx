"use client";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fafafa",
          fontFamily: "system-ui, sans-serif",
          color: "#111827",
          textAlign: "center",
          padding: 24,
        }}
      >
        <title>nfit — erro</title>
        <div>
          <p style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px" }}>Algo deu errado</p>
          <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 20px" }}>
            O app encontrou um erro inesperado.{error.digest ? ` Código: ${error.digest}` : ""}
          </p>
          <button
            onClick={() => retry()}
            style={{
              background: "#0d9488",
              color: "#fff",
              border: 0,
              borderRadius: 10,
              padding: "10px 18px",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
