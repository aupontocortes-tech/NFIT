import { neon } from "@neondatabase/serverless";
import { listStudents } from "@/lib/server/students";
import type { Conversation, Message } from "@/lib/mocks";

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL ausente");
  return neon(url);
}

let ready: Promise<void> | null = null;

function ensureTable() {
  ready ??= db()`
    CREATE TABLE IF NOT EXISTS nfit_messages (
      id text PRIMARY KEY,
      student_id text NOT NULL,
      sender_id text NOT NULL,
      body text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `.then(() => undefined);
  return ready;
}

function iso(v: unknown) {
  return v instanceof Date ? v.toISOString() : new Date(String(v)).toISOString();
}

export async function listConversations(): Promise<Conversation[]> {
  await ensureTable();
  const students = await listStudents({ status: "active" });
  const last = await db()`
    SELECT DISTINCT ON (student_id) student_id, body, created_at
    FROM nfit_messages
    ORDER BY student_id, created_at DESC
  `;
  const byStudent = new Map(
    (last as Record<string, unknown>[]).map((row) => [String(row.student_id), row]),
  );
  return students
    .map((s) => {
      const row = byStudent.get(s.id);
      return {
        id: s.id,
        peer: { id: s.id, name: s.name, avatarUrl: s.avatarUrl },
        lastMessage: row ? String(row.body) : "Nenhuma mensagem ainda",
        unreadCount: 0,
        updatedAt: row ? iso(row.created_at) : s.createdAt,
      };
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function listMessages(studentId: string): Promise<Message[]> {
  await ensureTable();
  const rows = await db()`
    SELECT id, sender_id, body, created_at
    FROM nfit_messages
    WHERE student_id = ${studentId}
    ORDER BY created_at ASC
  `;
  return (rows as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    senderId: String(row.sender_id),
    body: String(row.body),
    createdAt: iso(row.created_at),
  }));
}

export async function addMessage(studentId: string, senderId: string, body: string): Promise<Message> {
  await ensureTable();
  const id = crypto.randomUUID();
  const rows = await db()`
    INSERT INTO nfit_messages (id, student_id, sender_id, body)
    VALUES (${id}, ${studentId}, ${senderId}, ${body})
    RETURNING id, sender_id, body, created_at
  `;
  const row = rows[0] as Record<string, unknown>;
  return {
    id: String(row.id),
    senderId: String(row.sender_id),
    body: String(row.body),
    createdAt: iso(row.created_at),
  };
}
