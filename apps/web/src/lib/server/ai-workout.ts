/**
 * Geração de treino com IA. Provedores suportados:
 *  - OpenAI (pago por uso)                                                → OPENAI_API_KEY
 *  - xAI Grok (pago por uso)                                              → XAI_API_KEY
 *  - Google Gemini (chave grátis em https://aistudio.google.com/apikey)  → GEMINI_API_KEY
 *  - Groq (chave grátis em https://console.groq.com/keys)               → GROQ_API_KEY
 *  - Ollama rodando no seu PC (100% local, sem chave)                    → OLLAMA_URL
 * Use AI_PROVIDER para escolher; senão vale o primeiro configurado nessa ordem.
 * Sem nenhum, a rota responde 501 e o app usa o exemplo.
 */

export type WorkoutInput = {
  goal: string;
  daysPerWeek: number;
  sessionMinutes: number;
  level: string;
  constraints?: string;
  equipment?: string;
  prompt?: string;
  studentName?: string;
};

export type AiExercise = {
  name: string;
  sets: number;
  reps: string;
  restSeconds?: number;
  notes?: string;
  order: number;
};
export type AiWorkout = {
  title: string;
  goal: string;
  notes: string;
  blocks: { name: string; order: number; exercises: AiExercise[] }[];
};

export class AiNotConfiguredError extends Error {}

type Provider = "openai" | "xai" | "gemini" | "groq" | "ollama";

export function aiProvider(): Provider | null {
  const forced = process.env.AI_PROVIDER as Provider | undefined;
  if (forced && ["openai", "xai", "gemini", "groq", "ollama"].includes(forced)) return forced;
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.XAI_API_KEY) return "xai";
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.GROQ_API_KEY) return "groq";
  if (process.env.OLLAMA_URL) return "ollama";
  return null;
}

const SYSTEM = `Você é um personal trainer brasileiro experiente (CREF). Monte treinos seguros, 
objetivos e realistas, em português do Brasil. Respeite limitações e lesões informadas; 
na dúvida, prefira exercícios mais seguros. Responda SOMENTE com JSON válido, sem texto extra.`;

function userPrompt(i: WorkoutInput) {
  return `Crie um plano de treino com estes dados:
- Objetivo: ${i.goal}
- Nível: ${i.level}
- Dias por semana: ${i.daysPerWeek} (crie exatamente ${i.daysPerWeek} blocos, um por dia)
- Duração por sessão: ${i.sessionMinutes} minutos
- Equipamentos: ${i.equipment || "academia completa"}
- Limitações/lesões: ${i.constraints || "nenhuma informada"}
${i.studentName ? `- Aluno: ${i.studentName}` : ""}
${i.prompt ? `- Pedido extra do personal: ${i.prompt}` : ""}

Formato JSON exato:
{"title": string, "goal": string, "notes": string (dicas de progressão e segurança, até 300 caracteres),
 "blocks": [{"name": "Dia 1 — Grupo muscular", "exercises": [
   {"name": string, "sets": number, "reps": string (ex.: "8-12"), "restSeconds": number, "notes": string opcional}
 ]}]}
Use de 4 a 8 exercícios por dia, compatíveis com a duração.`;
}

async function fetchJson(url: string, init: RequestInit, timeoutMs = 45000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal, cache: "no-store" });
    const text = await res.text();
    if (!res.ok) throw new Error(`IA respondeu ${res.status}: ${text.slice(0, 200)}`);
    return JSON.parse(text);
  } finally {
    clearTimeout(t);
  }
}

async function callGemini(input: WorkoutInput): Promise<string> {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const data = await fetchJson(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY!,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: "user", parts: [{ text: userPrompt(input) }] }],
        generationConfig: { temperature: 0.7, responseMimeType: "application/json" },
      }),
    },
  );
  return data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
}

async function callOpenAiCompatible(
  base: string,
  model: string,
  input: WorkoutInput,
  apiKey?: string,
  temperature: number | null = 0.7,
  jsonMode = true,
): Promise<string> {
  const data = await fetchJson(`${base.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model,
      ...(temperature === null ? {} : { temperature }),
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userPrompt(input) },
      ],
    }),
  });
  return data?.choices?.[0]?.message?.content ?? "";
}

/** Tira cercas de código e pega só o objeto JSON. */
function extractJson(text: string): unknown {
  const cleaned = text.replace(/```(?:json)?/gi, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("IA não retornou JSON");
  return JSON.parse(cleaned.slice(start, end + 1));
}

const str = (v: unknown, max: number, fallback = "") =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : fallback;
const int = (v: unknown, min: number, max: number, fallback: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

/** Valida e normaliza a resposta — nunca confia cegamente na IA. */
export function normalizeWorkout(raw: unknown, input: WorkoutInput): AiWorkout {
  const r = (raw ?? {}) as Record<string, unknown>;
  const blocksRaw = Array.isArray(r.blocks) ? r.blocks.slice(0, 7) : [];
  const blocks = blocksRaw
    .map((b, bi) => {
      const bb = (b ?? {}) as Record<string, unknown>;
      const ex = (Array.isArray(bb.exercises) ? bb.exercises.slice(0, 12) : [])
        .map((e, ei) => {
          const ee = (e ?? {}) as Record<string, unknown>;
          const name = str(ee.name, 80);
          if (!name) return null;
          return {
            name,
            sets: int(ee.sets, 1, 10, 3),
            reps: str(typeof ee.reps === "number" ? String(ee.reps) : ee.reps, 20, "10-12"),
            restSeconds: int(ee.restSeconds, 15, 300, 60),
            notes: str(ee.notes, 160) || undefined,
            order: ei,
          };
        })
        .filter(Boolean) as AiExercise[];
      return { name: str(bb.name, 60, `Dia ${bi + 1}`), order: bi, exercises: ex };
    })
    .filter((b) => b.exercises.length > 0);
  if (blocks.length === 0) throw new Error("IA não retornou exercícios");
  return {
    title: str(r.title, 80, `Plano ${input.goal} ${input.daysPerWeek}x`),
    goal: str(r.goal, 60, input.goal),
    notes: str(r.notes, 400, "Rascunho gerado por IA. Revise antes de salvar ou atribuir."),
    blocks,
  };
}

export async function generateWorkout(input: WorkoutInput) {
  const provider = aiProvider();
  if (!provider) throw new AiNotConfiguredError("Nenhuma IA configurada");
  let text = "";
  if (provider === "openai")
    text = await callOpenAiCompatible(
      process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      process.env.OPENAI_MODEL || "gpt-5.4-mini",
      input,
      process.env.OPENAI_API_KEY,
      null, // alguns modelos novos só aceitam a temperatura padrão
    );
  else if (provider === "xai")
    text = await callOpenAiCompatible(
      process.env.XAI_BASE_URL || "https://api.x.ai/v1",
      process.env.XAI_MODEL || "grok-4.7",
      input,
      process.env.XAI_API_KEY,
      null,
      false, // o prompt já pede JSON; a resposta é validada abaixo
    );
  else if (provider === "gemini") text = await callGemini(input);
  else if (provider === "groq")
    text = await callOpenAiCompatible(
      process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
      process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      input,
      process.env.GROQ_API_KEY,
    );
  else
    text = await callOpenAiCompatible(
      `${process.env.OLLAMA_URL!.replace(/\/$/, "")}/v1`,
      process.env.OLLAMA_MODEL || "llama3.1",
      input,
    );
  return { provider, workout: normalizeWorkout(extractJson(text), input) };
}
