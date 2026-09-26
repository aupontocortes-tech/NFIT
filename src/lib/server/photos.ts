import { neon } from "@neondatabase/serverless";

const MAX_BYTES = 1_500_000;

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL ausente");
  return neon(url);
}

let ready: Promise<void> | null = null;

function ensureTable() {
  ready ??= db()`
    CREATE TABLE IF NOT EXISTS nfit_photos (
      id text PRIMARY KEY,
      bytes bytea NOT NULL,
      content_type text NOT NULL DEFAULT 'image/jpeg',
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `.then(() => undefined);
  return ready;
}

export async function savePhoto(bytes: Buffer, contentType = "image/jpeg") {
  if (bytes.length > MAX_BYTES) {
    throw new Error("Foto ainda grande demais. Use uma imagem menor.");
  }
  await ensureTable();
  const id = crypto.randomUUID();
  await db()`
    INSERT INTO nfit_photos (id, bytes, content_type)
    VALUES (${id}, decode(${bytes.toString("base64")}, 'base64'), ${contentType})
  `;
  return { id, url: `/api/fotos/${id}` };
}

export async function readPhoto(id: string) {
  await ensureTable();
  const rows = await db()`
    SELECT encode(bytes, 'base64') AS data, content_type
    FROM nfit_photos
    WHERE id = ${id}
    LIMIT 1
  `;
  const row = rows[0] as { data?: string; content_type?: string } | undefined;
  if (!row?.data) return null;
  return {
    bytes: Buffer.from(row.data, "base64"),
    contentType: row.content_type || "image/jpeg",
  };
}

export async function deletePhoto(id: string) {
  await ensureTable();
  await db()`DELETE FROM nfit_photos WHERE id = ${id}`;
}
