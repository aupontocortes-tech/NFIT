"use client";

import { Button } from "@/components/ui";
import { buildPixPayload, type PixConfig } from "@/lib/pix";
import { formatMoney } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";

/** QR Code + "PIX copia e cola" de uma cobrança. */
export function PixPayment({
  config,
  amount,
  txid,
  description,
}: {
  config: PixConfig;
  amount: number;
  txid: string;
  description?: string;
}) {
  const payload = useMemo(
    () => buildPixPayload({ config, amount, txid, description }),
    [config, amount, txid, description],
  );
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(payload, { width: 240, margin: 1, errorCorrectionLevel: "M" })
      .then((url) => alive && setQr(url))
      .catch(() => alive && setQr(null));
    return () => {
      alive = false;
    };
  }, [payload]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(payload);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = payload;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="text-2xl font-bold tabular-nums">{formatMoney(amount)}</p>
      <div className="flex h-60 w-60 items-center justify-center rounded-[var(--radius-md)] border border-border bg-white">
        {qr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qr} alt="QR Code PIX" className="h-full w-full" />
        ) : (
          <div className="h-52 w-52 animate-pulse rounded bg-fill" />
        )}
      </div>
      <p className="text-caption">
        Para: <span className="font-medium text-text">{config.name}</span>
      </p>
      <Button onClick={copy} className="w-full" variant={copied ? "secondary" : "primary"}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Código copiado!" : "Copiar PIX copia e cola"}
      </Button>
      <p className="break-all rounded-[var(--radius-sm)] bg-fill p-2 text-left font-mono text-sm text-text-muted">
        {payload}
      </p>
      <p className="text-caption">
        Abra o app do seu banco → PIX → Ler QR Code ou Copia e cola. Depois avise seu personal.
      </p>
    </div>
  );
}
