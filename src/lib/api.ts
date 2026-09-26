/**
 * Cliente API nfit — base NEXT_PUBLIC_API_BASE.
 * USE_MOCK=false: fetch real + Bearer JWT (localStorage).
 * Domínios secundários: tenta real e cai no mock em 404/falha de rede.
 */
import {
  assessmentsByStudent,
  aiDraftFixture,
  assignments,
  conversations,
  currentAluno,
  currentPersonal,
  dashboardData,
  events,
  invoices,
  messagesByConversation,
  students,
  workouts,
  type Assignment,
  type Invoice,
  type Message,
  type Student,
  type User,
  type Workout,
} from "./mocks";
import { compressImage } from "./images";
import type { PixConfig } from "./pix";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api/v1";
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

const TOKEN_KEY = "nfit_token";
/** Cookie lido pelo proxy (src/proxy.ts) para proteger as rotas. Guarda só o perfil. */
export const SESSION_COOKIE = "nfit_session";

function setSessionCookie(role: string | null) {
  if (typeof document === "undefined") return;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = role
    ? `${SESSION_COOKIE}=${role}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax${secure}`
    : `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  fields?: Record<string, string>;

  constructor(
    message: string,
    status: number,
    code?: string,
    fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else {
      localStorage.removeItem(TOKEN_KEY);
      setSessionCookie(null);
    }
  } catch {
    /* ignore */
  }
}

async function delay(ms = 280) {
  await new Promise((r) => setTimeout(r, ms));
}

type FetchOpts = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined | null>;
};

function buildUrl(path: string, query?: FetchOpts["query"]) {
  const url = new URL(
    path.startsWith("http") ? path : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`,
  );
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

async function request<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  const isForm = typeof FormData !== "undefined" && opts.body instanceof FormData;
  if (opts.body !== undefined && !isForm) headers["Content-Type"] = "application/json";
  if (opts.auth !== false) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(buildUrl(path, opts.query), {
    method: opts.method ?? (opts.body !== undefined ? "POST" : "GET"),
    headers,
    body: isForm
      ? (opts.body as FormData)
      : opts.body !== undefined
        ? JSON.stringify(opts.body)
        : undefined,
  });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (!res.ok) {
    const err = data as {
      error?: { code?: string; message?: string; fields?: Record<string, string> };
    } | null;
    throw new ApiError(
      err?.error?.message ?? `HTTP ${res.status}`,
      res.status,
      err?.error?.code,
      err?.error?.fields,
    );
  }

  return data as T;
}

/** Soft domains: real first; on 404 (or network) fall back to mock. */
async function realOrMock<T>(
  real: () => Promise<T>,
  mock: () => Promise<T>,
): Promise<T> {
  if (USE_MOCK) return mock();
  try {
    return await real();
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 501)) {
      return mock();
    }
    // Network / CORS — still fall back so UI keeps working in partial setups
    if (!(e instanceof ApiError)) return mock();
    throw e;
  }
}

// ── Perfil do personal ─────────────────────────────────────────────────────
export type PersonalProfile = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  bio?: string;
  studioName?: string;
  timezone?: string;
  notificationPrefs?: { email: boolean; push: boolean };
  /** Dados para receber por PIX (QR Code estático, grátis). */
  pix?: PixConfig | null;
};

export type PersonalProfileUpdate = Partial<
  Pick<PersonalProfile, "name" | "bio" | "studioName" | "timezone" | "notificationPrefs" | "pix">
>;

const MOCK_PROFILE_KEY = "nfit_mock_profile";
export const MOCK_MESSAGES_PREFIX = "nfit_mock_msgs_";
const MOCK_EVOLUTION_KEY = "nfit_mock_evolution";
const MOCK_PHOTO_LIMIT = 12;

type MockEvolution = {
  photos: { url: string; date: string }[];
  weights: { date: string; weightKg: number }[];
};

function readMockEvolution(): MockEvolution {
  if (typeof window === "undefined") return { photos: [], weights: [] };
  try {
    const v = JSON.parse(localStorage.getItem(MOCK_EVOLUTION_KEY) ?? "{}");
    return { photos: v.photos ?? [], weights: v.weights ?? [] };
  } catch {
    return { photos: [], weights: [] };
  }
}

function writeMockEvolution(v: MockEvolution) {
  try {
    localStorage.setItem(MOCK_EVOLUTION_KEY, JSON.stringify(v));
  } catch {
    throw new ApiError("Armazenamento do navegador cheio. Apague algumas fotos.", 413);
  }
}

/** No modo mock, mensagens novas ficam no navegador (e aparecem nas outras abas). */
function readMockMessages(conversationId: string): Message[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(MOCK_MESSAGES_PREFIX + conversationId) ?? "[]");
  } catch {
    return [];
  }
}

function writeMockMessage(conversationId: string, m: Message) {
  try {
    const all = [...readMockMessages(conversationId), m].slice(-200);
    localStorage.setItem(MOCK_MESSAGES_PREFIX + conversationId, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

function defaultPersonalProfile(): PersonalProfile {
  return {
    id: currentPersonal.id,
    name: currentPersonal.name,
    email: currentPersonal.email,
    avatarUrl: currentPersonal.avatarUrl,
    bio: "Personal trainer CREF ativo",
    studioName: currentPersonal.studioName,
    timezone: "America/Sao_Paulo",
    notificationPrefs: { email: true, push: true },
  };
}

/** No modo mock, as alterações do perfil ficam salvas no navegador. */
function readMockProfile(): Partial<PersonalProfile> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(MOCK_PROFILE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeMockProfile(profile: PersonalProfile) {
  try {
    localStorage.setItem(MOCK_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    /* ignore */
  }
}

// ── IA (grátis) ─────────────────────────────────────────────────────────────
type AiDraftResponse = {
  draftId: string;
  generatedByAi: true;
  status: "draft";
  workout: Workout;
  modelMeta: { requestId: string; provider?: string };
};

const AI_LAST_INPUT_KEY = "nfit_ai_last_input";

/**
 * Sem backend: chama a rota do próprio Next (/api/ia/treino), que usa
 * Gemini, Groq ou Ollama grátis. Se nenhuma IA estiver configurada, usa o exemplo.
 */
async function generateWithLocalAi(input: {
  studentId?: string;
  goal: string;
  daysPerWeek: number;
  sessionMinutes: number;
  level: string;
  constraints?: string;
  equipment?: string;
  prompt?: string;
}): Promise<AiDraftResponse> {
  const studentName = input.studentId
    ? students.find((s) => s.id === input.studentId)?.name
    : undefined;
  const res = await fetch("/api/ia/treino", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, studentName }),
  });
  const requestId = `req-${Date.now()}`;
  if (res.status === 501) {
    await delay(600);
    return {
      draftId: "draft-mock-001",
      generatedByAi: true,
      status: "draft",
      workout: { ...aiDraftFixture, id: "w-ai-draft", updatedAt: new Date().toISOString() },
      modelMeta: { requestId, provider: "exemplo" },
    };
  }
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.workout) {
    throw new ApiError(data?.error?.message ?? "Falha na IA", res.status, data?.error?.code);
  }
  const w = data.workout as Omit<Workout, "id" | "status" | "generatedByAi" | "updatedAt" | "exerciseCount">;
  return {
    draftId: `draft-${Date.now()}`,
    generatedByAi: true,
    status: "draft",
    workout: {
      ...w,
      id: "w-ai-draft",
      status: "draft",
      generatedByAi: true,
      updatedAt: new Date().toISOString(),
      exerciseCount: w.blocks.reduce((n, b) => n + b.exercises.length, 0),
    },
    modelMeta: { requestId, provider: data.provider },
  };
}

function storeAuth(res: { user: User; token: string }) {
  setToken(res.token);
  setSessionCookie(res.user.role);
  return res;
}

export const api = {
  // ── Auth (live when !USE_MOCK) ──────────────────────────────────────────
  async login(email: string, password: string) {
    if (USE_MOCK) {
      await delay();
      const isAluno =
        email.toLowerCase().includes("aluno") || email.includes("carlos");
      const user = isAluno ? currentAluno : currentPersonal;
      return storeAuth({ user, token: "mock-jwt-token" });
    }
    const res = await request<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
    return storeAuth(res);
  },

  async register(data: { name: string; email: string; password: string }) {
    if (USE_MOCK) {
      await delay();
      return storeAuth({
        user: { ...currentPersonal, name: data.name, email: data.email },
        token: "mock-jwt-token",
      });
    }
    const res = await request<{ user: User; token: string }>("/auth/register", {
      method: "POST",
      body: { ...data, role: "personal" },
      auth: false,
    });
    return storeAuth(res);
  },

  async me() {
    if (USE_MOCK) {
      await delay(100);
      return currentPersonal;
    }
    return request<User>("/auth/me");
  },

  async forgotPassword(email: string) {
    if (USE_MOCK) {
      await delay();
      return { ok: true as const };
    }
    return request<{ ok: true }>("/auth/forgot-password", {
      method: "POST",
      body: { email },
      auth: false,
    });
  },

  async resetPassword(token: string, password: string) {
    if (USE_MOCK) {
      await delay();
      return { ok: true as const };
    }
    return request<{ ok: true }>("/auth/reset-password", {
      method: "POST",
      body: { token, password },
      auth: false,
    });
  },

  async acceptInvite(token: string, password: string, name?: string) {
    if (USE_MOCK) {
      await delay();
      return storeAuth({
        user: { ...currentAluno, name: name ?? currentAluno.name },
        token: "mock-jwt-token",
      });
    }
    const res = await request<{ user: User; token: string }>(
      "/auth/accept-invite",
      {
        method: "POST",
        body: { token, password, ...(name ? { name } : {}) },
        auth: false,
      },
    );
    return storeAuth(res);
  },

  async logout() {
    if (USE_MOCK) {
      await delay(100);
      setToken(null);
      return;
    }
    try {
      await request<void>("/auth/logout", { method: "POST" });
    } finally {
      setToken(null);
    }
  },

  // ── Personal / dashboard (soft) ─────────────────────────────────────────
  async getDashboard() {
    return realOrMock(
      () => request<typeof dashboardData>("/personal/dashboard"),
      async () => {
        await delay();
        return dashboardData;
      },
    );
  },

  async getPersonalProfile() {
    return realOrMock(
      () =>
        request<PersonalProfile>("/personal/profile"),
      async () => {
        await delay();
        return { ...defaultPersonalProfile(), ...readMockProfile() };
      },
    );
  },

  async updatePersonalProfile(data: PersonalProfileUpdate) {
    return realOrMock(
      () =>
        request<PersonalProfile>("/personal/profile", {
          method: "PATCH",
          body: data,
        }),
      async () => {
        await delay();
        const next = { ...defaultPersonalProfile(), ...readMockProfile(), ...data };
        writeMockProfile(next);
        return next;
      },
    );
  },

  // ── Students (banco Neon via /api/alunos) ──────────────────────────────
  async listStudents(params?: { q?: string; status?: string }) {
    const qs = new URLSearchParams();
    if (params?.q) qs.set("q", params.q);
    if (params?.status) qs.set("status", params.status);
    const res = await fetch(`/api/alunos${qs.size ? `?${qs}` : ""}`);
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new ApiError(data?.error?.message ?? "Não foi possível listar alunos", res.status);
    }
    const items = (data?.items ?? []) as Student[];
    return { items, page: 1, pageSize: 20, total: items.length };
  },

  async getStudent(id: string) {
    const res = await fetch(`/api/alunos/${id}`);
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new ApiError(data?.error?.message ?? "Aluno não encontrado", res.status);
    }
    return data as Student;
  },

  async createStudent(data: Partial<Student>) {
    const res = await fetch("/api/alunos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        notes: data.notes,
      }),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      throw new ApiError(body?.error?.message ?? "Não foi possível salvar o aluno", res.status);
    }
    return body as Student;
  },

  async patchStudent(id: string, data: Partial<Student>) {
    const res = await fetch(`/api/alunos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        phone: data.phone,
        notes: data.notes,
        status: data.status,
      }),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      throw new ApiError(body?.error?.message ?? "Não foi possível atualizar o aluno", res.status);
    }
    return body as Student;
  },

  // ── Workouts (live) ─────────────────────────────────────────────────────
  async listWorkouts(params?: { status?: string; generatedByAi?: boolean }) {
    if (USE_MOCK) {
      await delay();
      let items = [...workouts];
      if (params?.status) items = items.filter((w) => w.status === params.status);
      if (params?.generatedByAi != null)
        items = items.filter((w) => w.generatedByAi === params.generatedByAi);
      return { items, page: 1, pageSize: 20, total: items.length };
    }
    return request<{
      items: Workout[];
      page: number;
      pageSize: number;
      total: number;
    }>("/workouts", {
      query: {
        status: params?.status,
        generatedByAi:
          params?.generatedByAi == null ? undefined : params.generatedByAi,
      },
    });
  },

  async getWorkout(id: string) {
    if (USE_MOCK) {
      await delay();
      const w =
        workouts.find((x) => x.id === id) ??
        (id === aiDraftFixture.id ? aiDraftFixture : null);
      if (!w) throw new Error("Treino não encontrado");
      return w;
    }
    return request<Workout>(`/workouts/${id}`);
  },

  async createWorkout(data: Partial<Workout>) {
    if (USE_MOCK) {
      await delay();
      return {
        id: `w-${Date.now()}`,
        title: data.title ?? "Novo treino",
        goal: data.goal,
        status: (data.status as Workout["status"]) ?? "draft",
        generatedByAi: data.generatedByAi ?? false,
        notes: data.notes,
        warnings: data.warnings,
        blocks: data.blocks ?? [],
        updatedAt: new Date().toISOString(),
        exerciseCount:
          data.blocks?.reduce((n, b) => n + b.exercises.length, 0) ?? 0,
      } satisfies Workout;
    }
    return request<Workout>("/workouts", {
      method: "POST",
      body: {
        title: data.title,
        goal: data.goal,
        status: data.status ?? "draft",
        notes: data.notes,
        blocks: data.blocks ?? [],
        generatedByAi: data.generatedByAi ?? false,
      },
    });
  },

  async updateWorkout(id: string, data: Partial<Workout>) {
    if (USE_MOCK) {
      await delay();
      const existing = await this.getWorkout(id);
      return { ...existing, ...data, updatedAt: new Date().toISOString() };
    }
    return request<Workout>(`/workouts/${id}`, {
      method: "PATCH",
      body: {
        title: data.title,
        goal: data.goal,
        status: data.status,
        notes: data.notes,
        blocks: data.blocks,
      },
    });
  },

  // ── AI (live sync generate; never auto-publish) ─────────────────────────
  async generateWorkoutAi(input: {
    studentId?: string;
    goal: string;
    daysPerWeek: number;
    sessionMinutes: number;
    level: string;
    constraints?: string;
    equipment?: string;
    prompt?: string;
  }) {
    try {
      sessionStorage.setItem(AI_LAST_INPUT_KEY, JSON.stringify(input));
    } catch {
      /* ignore */
    }
    return generateWithLocalAi(input);
  },

  async regenerateWorkoutAi(draftId: string) {
    if (USE_MOCK) {
      let last: Parameters<typeof generateWithLocalAi>[0] | null = null;
      try {
        last = JSON.parse(sessionStorage.getItem(AI_LAST_INPUT_KEY) ?? "null");
      } catch {
        /* ignore */
      }
      return generateWithLocalAi(
        last ?? { goal: "Hipertrofia", daysPerWeek: 4, sessionMinutes: 60, level: "Intermediário" },
      );
    }
    return request<AiDraftResponse>("/ai/workouts/regenerate", {
      method: "POST",
      body: { draftId },
    });
  },

  /** Optional: fetch draft workout by id after generate (materialized). */
  async getAiDraft(draftOrWorkoutId: string) {
    if (USE_MOCK) {
      await delay();
      return { ...aiDraftFixture, id: draftOrWorkoutId };
    }
    return this.getWorkout(draftOrWorkoutId);
  },

  // ── Assignments (live) ──────────────────────────────────────────────────
  async createAssignments(data: {
    workoutId: string;
    studentIds: string[];
    startDate: string;
    notes?: string;
    ackPainRisk?: boolean;
  }) {
    if (USE_MOCK) {
      await delay();
      return {
        assignments: data.studentIds.map((studentId, i) => ({
          id: `a-new-${i}`,
          workoutId: data.workoutId,
          studentId,
          status: "active" as const,
          startDate: data.startDate,
        })),
      };
    }
    return request<{ assignments: Assignment[] }>("/workout-assignments", {
      method: "POST",
      body: data,
    });
  },

  async listAssignments(params?: { studentId?: string }) {
    if (USE_MOCK) {
      await delay();
      let items = [...assignments];
      if (params?.studentId)
        items = items.filter((a) => a.studentId === params.studentId);
      return items;
    }
    const res = await request<{ items: Assignment[] } | Assignment[]>(
      "/workout-assignments",
      { query: { studentId: params?.studentId } },
    );
    return Array.isArray(res) ? res : (res.items ?? []);
  },

  async getAssignment(id: string) {
    if (USE_MOCK) {
      await delay();
      const a = assignments.find((x) => x.id === id);
      if (!a) throw new Error("Atribuição não encontrada");
      return a;
    }
    return request<Assignment>(`/workout-assignments/${id}`);
  },

  // ── Student app (soft where needed) ─────────────────────────────────────
  async getStudentHome() {
    return realOrMock(
      () =>
        request<{
          todayAssignment: {
            id: string;
            workoutTitle: string;
            startDate: string;
            status: string;
          } | null;
          nextEvents: typeof events;
          unreadMessages: number;
        }>("/student/home"),
      async () => {
        await delay();
        const today =
          assignments.find(
            (a) => a.studentId === "s-001" && a.status === "active",
          ) ?? null;
        return {
          todayAssignment: today
            ? {
                id: today.id,
                workoutTitle: today.workoutTitle ?? "",
                startDate: today.startDate,
                status: today.status,
              }
            : null,
          nextEvents: events.filter((e) => e.studentId === "s-001"),
          unreadMessages: 2,
        };
      },
    );
  },

  async getStudentAssignment(id: string): Promise<Assignment> {
    if (USE_MOCK) return this.getAssignment(id);
    return request<Assignment>(`/student/assignments/${id}`);
  },

  async completeSession(assignmentId: string, payload: unknown) {
    if (USE_MOCK) {
      await delay();
      return { sessionId: `sess-${Date.now()}`, status: "completed" as const };
    }
    return request<{ sessionId: string; status: "completed" }>(
      `/student/assignments/${assignmentId}/sessions`,
      { method: "POST", body: payload },
    );
  },

  /** Dados de PIX do personal, para o aluno pagar. */
  async getPaymentInfo(): Promise<{ pix: PixConfig | null }> {
    return realOrMock(
      () => request<{ pix: PixConfig | null }>("/student/payment-info"),
      async () => {
        await delay(100);
        return { pix: readMockProfile().pix ?? null };
      },
    );
  },

  async getStudentInvoices() {
    return realOrMock(
      async () => {
        const res = await request<{ items: Invoice[] } | Invoice[]>(
          "/student/invoices",
        );
        return Array.isArray(res) ? res : (res.items ?? []);
      },
      async () => {
        await delay();
        return invoices.filter((i) => i.studentId === "s-001");
      },
    );
  },

  async getStudentEvolution() {
    return realOrMock(
      () =>
        request<{
          weights: { date: string; weightKg: number }[];
          measurements: Record<string, unknown>[];
          photos: { url: string; date: string }[];
        }>("/student/evolution"),
      async () => {
        await delay();
        const list = assessmentsByStudent["s-001"] ?? [];
        const extra = readMockEvolution();
        return {
          weights: [
            ...list.map((a) => ({ date: a.date, weightKg: a.weightKg ?? 0 })),
            ...extra.weights,
          ].sort((a, b) => a.date.localeCompare(b.date)),
          measurements: list.map((a) => ({ date: a.date, ...a.measurements })),
          photos: extra.photos,
        };
      },
    );
  },

  /** Comprime a foto e guarda no Neon. O app fica só com o link curto. */
  async uploadPhoto(file: File): Promise<{ url: string }> {
    const blob = await compressImage(file, { maxSide: 1280, quality: 0.72 });
    const form = new FormData();
    form.append("file", blob, "foto.jpg");
    const res = await fetch("/api/fotos", { method: "POST", body: form });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.url) {
      throw new ApiError(data?.error?.message ?? "Não foi possível guardar a foto.", res.status);
    }
    return { url: data.url as string };
  },

  async addEvolutionPhoto(url: string) {
    return realOrMock(
      () =>
        request<{ url: string; date: string }>("/student/evolution/photos", {
          method: "POST",
          body: { url },
        }),
      async () => {
        const v = readMockEvolution();
        const photo = { url, date: new Date().toISOString() };
        if (v.photos.length >= MOCK_PHOTO_LIMIT) {
          throw new ApiError(`Limite de ${MOCK_PHOTO_LIMIT} fotos no modo demonstração.`, 413);
        }
        writeMockEvolution({ ...v, photos: [...v.photos, photo] });
        return photo;
      },
    );
  },

  async removeEvolutionPhoto(url: string) {
    const id = url.startsWith("/api/fotos/") ? url.slice("/api/fotos/".length) : "";
    if (id) {
      await fetch(`/api/fotos/${id}`, { method: "DELETE" }).catch(() => undefined);
    }
    return realOrMock(
      () =>
        request<void>("/student/evolution/photos", {
          method: "DELETE",
          query: { url },
        }),
      async () => {
        const v = readMockEvolution();
        writeMockEvolution({ ...v, photos: v.photos.filter((p) => p.url !== url) });
      },
    );
  },

  async addWeight(weightKg: number) {
    return realOrMock(
      () =>
        request<{ date: string; weightKg: number }>("/student/evolution/weights", {
          method: "POST",
          body: { weightKg },
        }),
      async () => {
        await delay(150);
        const v = readMockEvolution();
        const entry = { date: new Date().toISOString().slice(0, 10), weightKg };
        writeMockEvolution({
          ...v,
          weights: [...v.weights.filter((w) => w.date !== entry.date), entry],
        });
        return entry;
      },
    );
  },

  async getStudentAssessments() {
    return realOrMock(
      async () => {
        const res = await request<{ items: unknown[] } | unknown[]>(
          "/student/assessments",
        );
        return Array.isArray(res) ? res : (res.items ?? []);
      },
      async () => {
        await delay();
        return assessmentsByStudent["s-001"] ?? [];
      },
    );
  },

  // ── Events (soft) ───────────────────────────────────────────────────────
  async listEvents() {
    return realOrMock(
      () => request<{ items: typeof events }>("/events"),
      async () => {
        await delay();
        return { items: events };
      },
    );
  },

  async createEvent(data: Partial<(typeof events)[0]>) {
    return realOrMock(
      () =>
        request<(typeof events)[0]>("/events", {
          method: "POST",
          body: data,
        }),
      async () => {
        await delay();
        return { ...events[0], ...data, id: `e-${Date.now()}` };
      },
    );
  },

  // ── Chat (soft) ─────────────────────────────────────────────────────────
  async listConversations() {
    return realOrMock(
      () => request<{ items: typeof conversations }>("/conversations"),
      async () => {
        await delay();
        return { items: conversations };
      },
    );
  },

  async getMessages(conversationId: string) {
    return realOrMock(
      () =>
        request<{ items: (typeof messagesByConversation)[string] }>(
          `/conversations/${conversationId}/messages`,
        ),
      async () => {
        await delay(120);
        return {
          items: [
            ...(messagesByConversation[conversationId] ?? []),
            ...readMockMessages(conversationId),
          ],
        };
      },
    );
  },

  /** senderId só é usado no modo mock (no real, a API sabe quem enviou pelo JWT). */
  async sendMessage(conversationId: string, body: string, senderId?: string) {
    return realOrMock(
      () =>
        request<{
          id: string;
          senderId: string;
          body: string;
          createdAt: string;
        }>(`/conversations/${conversationId}/messages`, {
          method: "POST",
          body: { body },
        }),
      async () => {
        await delay(150);
        const m = {
          id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          senderId: senderId ?? currentPersonal.id,
          body,
          createdAt: new Date().toISOString(),
        };
        writeMockMessage(conversationId, m);
        return m;
      },
    );
  },

  // ── Invoices (soft) ─────────────────────────────────────────────────────
  async listInvoices(params?: { status?: string }) {
    return realOrMock(
      () =>
        request<{
          items: Invoice[];
          page: number;
          pageSize: number;
          total: number;
        }>("/invoices", { query: { status: params?.status } }),
      async () => {
        await delay();
        let items = [...invoices];
        if (params?.status)
          items = items.filter((i) => i.status === params.status);
        return { items, page: 1, pageSize: 20, total: items.length };
      },
    );
  },

  async getInvoice(id: string): Promise<Invoice> {
    return realOrMock(
      () => request<Invoice>(`/invoices/${id}`),
      async () => {
        await delay();
        const inv = invoices.find((i) => i.id === id);
        if (!inv) throw new Error("Cobrança não encontrada");
        return inv;
      },
    );
  },

  async createInvoice(data: {
    studentId: string;
    description: string;
    amount: number;
    dueDate: string;
  }) {
    return realOrMock(
      () =>
        request<Invoice>("/invoices", {
          method: "POST",
          body: {
            studentId: data.studentId,
            description: data.description,
            amount: data.amount,
            currency: "BRL",
            dueDate: data.dueDate,
          },
        }),
      async () => {
        await delay();
        const st = students.find((s) => s.id === data.studentId);
        return {
          id: `i-${Date.now()}`,
          studentId: data.studentId,
          studentName: st?.name ?? "",
          description: data.description,
          amount: { amount: data.amount, currency: "BRL" as const },
          dueDate: data.dueDate,
          status: "pending" as const,
        };
      },
    );
  },

  async markInvoicePaid(id: string) {
    return realOrMock(
      () => request<Invoice>(`/invoices/${id}/mark-paid`, { method: "POST" }),
      async () => {
        await delay();
        const inv = await this.getInvoice(id);
        return {
          ...inv,
          status: "paid" as const,
          paidAt: new Date().toISOString(),
        };
      },
    );
  },

  // ── Assessments (soft) ──────────────────────────────────────────────────
  async listAssessments(studentId: string) {
    const res = await fetch(`/api/alunos/${studentId}/avaliacoes`);
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new ApiError(data?.error?.message ?? "Não foi possível ler as avaliações", res.status);
    }
    return { items: (data?.items ?? []) as (typeof assessmentsByStudent)[string] };
  },

  async createAssessment(studentId: string, data: Record<string, unknown>) {
    return realOrMock(
      () =>
        request<Record<string, unknown>>(
          `/students/${studentId}/assessments`,
          { method: "POST", body: data },
        ),
      async () => {
        await delay();
        return {
          id: `as-${Date.now()}`,
          date:
            (data.date as string) ?? new Date().toISOString().slice(0, 10),
          weightKg: data.weightKg as number | undefined,
          bodyFatPercent: data.bodyFatPercent as number | undefined,
          measurements: (data.measurements as object) ?? {},
          notes: data.notes as string | undefined,
          photoUrls: (data.photoUrls as string[] | undefined) ?? [],
          createdAt: new Date().toISOString(),
        };
      },
    );
  },
};
