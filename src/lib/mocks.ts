/** Mock data tipado alinhado ao OpenAPI / APIS.md */

export type Role = "personal" | "aluno";
export type StudentStatus = "active" | "paused" | "invite_pending";
export type WorkoutStatus = "draft" | "template" | "archived";
export type InvoiceStatus = "pending" | "paid" | "overdue";
export type EventType = "workout" | "assessment" | "call" | "other";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string | null;
  studioName?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  status: StudentStatus;
  avatarUrl?: string | null;
  nextAssessmentAt?: string | null;
  createdAt: string;
  activeWorkoutCount?: number;
  pendingInvoices?: number;
  unreadMessages?: number;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  load?: string;
  /** Intensidade prescrita: %1RM ou RPE (rascunhos IA). */
  intensity?: string;
  restSeconds?: number;
  notes?: string;
  /** Alternativas do mesmo grupo muscular (rascunhos IA). */
  alternatives?: string[];
  order: number;
}

export interface WorkoutBlock {
  name?: string;
  order: number;
  warmUp?: string;
  coolDown?: string;
  exercises: Exercise[];
}

export interface Workout {
  id: string;
  title: string;
  goal?: string;
  status: WorkoutStatus;
  generatedByAi: boolean;
  notes?: string;
  /** Avisos da IA (dados faltantes, dor/lesão, revisão humana). */
  warnings?: string[];
  blocks: WorkoutBlock[];
  updatedAt: string;
  exerciseCount: number;
}

export interface Assignment {
  id: string;
  workoutId: string;
  studentId: string;
  status: "active" | "completed" | "cancelled";
  startDate: string;
  notes?: string;
  workoutTitle?: string;
  workout?: Workout;
}

export interface EventItem {
  id: string;
  studentId: string;
  studentName?: string;
  type: EventType;
  title: string;
  startsAt: string;
  endsAt: string;
  location?: string;
  meetingUrl?: string;
  notes?: string;
  status?: "scheduled" | "rescheduled" | "cancelled";
}

export interface Conversation {
  id: string;
  peer: { id: string; name: string; avatarUrl?: string | null };
  lastMessage: string;
  unreadCount: number;
  updatedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  body: string;
  attachmentUrl?: string;
  createdAt: string;
  readAt?: string;
}

export interface Invoice {
  id: string;
  studentId: string;
  studentName: string;
  description: string;
  amount: { amount: number; currency: "BRL" };
  dueDate: string;
  status: InvoiceStatus;
  paidAt?: string;
}

export interface Assessment {
  id: string;
  date: string;
  weightKg?: number;
  bodyFatPercent?: number;
  heightCm?: number;
  age?: number;
  sex?: "f" | "m";
  bmi?: number;
  bmiLabel?: string;
  whr?: number;
  whrLabel?: string;
  girthSumCm?: number;
  leanMassKg?: number;
  measurements: {
    waist?: number;
    chest?: number;
    hip?: number;
    arm?: number;
    thigh?: number;
    biceps?: number;
    bicepsRight?: number;
    bicepsLeft?: number;
    forearm?: number;
    forearmRight?: number;
    forearmLeft?: number;
    thighRight?: number;
    thighLeft?: number;
    abdomen?: number;
  };
  notes?: string;
  photoUrls: string[];
  createdAt: string;
}

export const currentPersonal: User = {
  id: "p-001",
  name: "Tiago",
  email: "",
  role: "personal",
  studioName: "Studio nfit",
};

export const currentAluno: User = {
  id: "s-001",
  name: "",
  email: "",
  role: "aluno",
};

/** Lista real vem do banco. Isto fica vazio para não reaparecer aluno de exemplo. */
export const students: Student[] = [];

export const workouts: Workout[] = [
  {
    id: "w-001",
    title: "Hipertrofia A/B — Intermediário",
    goal: "Hipertrofia",
    status: "template",
    generatedByAi: false,
    updatedAt: "2026-03-01T12:00:00Z",
    exerciseCount: 8,
    notes: "Alternar A/B a cada sessão",
    blocks: [
      {
        name: "Dia A — Superior",
        order: 0,
        exercises: [
          { name: "Supino reto", sets: 4, reps: "8-10", load: "60kg", restSeconds: 90, order: 0 },
          { name: "Remada curvada", sets: 4, reps: "8-10", load: "50kg", restSeconds: 90, order: 1 },
          { name: "Desenvolvimento", sets: 3, reps: "10-12", restSeconds: 75, order: 2 },
          { name: "Rosca direta", sets: 3, reps: "12", restSeconds: 60, order: 3 },
        ],
      },
      {
        name: "Dia B — Inferior",
        order: 1,
        exercises: [
          { name: "Agachamento livre", sets: 4, reps: "8-10", load: "80kg", restSeconds: 120, order: 0 },
          { name: "Levantamento terra romeno", sets: 3, reps: "10", restSeconds: 90, order: 1 },
          { name: "Leg press", sets: 3, reps: "12", restSeconds: 90, order: 2 },
          { name: "Panturrilha em pé", sets: 4, reps: "15", restSeconds: 45, order: 3 },
        ],
      },
    ],
  },
  {
    id: "w-002",
    title: "Emagrecimento 3x — Rascunho IA",
    goal: "Emagrecimento",
    status: "draft",
    generatedByAi: true,
    updatedAt: "2026-03-18T09:00:00Z",
    exerciseCount: 6,
    notes: "Gerado por IA — revisar antes de atribuir",
    blocks: [
      {
        name: "Circuito full body",
        order: 0,
        exercises: [
          { name: "Agachamento goblet", sets: 3, reps: "12-15", restSeconds: 45, order: 0 },
          { name: "Flexão de braço", sets: 3, reps: "10-12", restSeconds: 45, order: 1 },
          { name: "Remada com elástico", sets: 3, reps: "12", restSeconds: 45, order: 2 },
          { name: "Prancha", sets: 3, reps: "30s", restSeconds: 30, order: 3 },
          { name: "Afundo alternado", sets: 3, reps: "10/lado", restSeconds: 45, order: 4 },
          { name: "Burpee modificado", sets: 2, reps: "8", restSeconds: 60, order: 5, notes: "Evitar se joelho dolorido" },
        ],
      },
    ],
  },
  {
    id: "w-003",
    title: "Força iniciante",
    goal: "Força",
    status: "template",
    generatedByAi: false,
    updatedAt: "2026-02-20T12:00:00Z",
    exerciseCount: 5,
    blocks: [
      {
        name: "Básico",
        order: 0,
        exercises: [
          { name: "Leg press", sets: 3, reps: "8", restSeconds: 120, order: 0 },
          { name: "Supino máquina", sets: 3, reps: "8", restSeconds: 120, order: 1 },
          { name: "Puxada frente", sets: 3, reps: "8", restSeconds: 90, order: 2 },
          { name: "Elevação lateral", sets: 3, reps: "12", restSeconds: 60, order: 3 },
          { name: "Abdominal crunch", sets: 3, reps: "15", restSeconds: 45, order: 4 },
        ],
      },
    ],
  },
];

export const assignments: Assignment[] = [];

export const events: EventItem[] = [];

export const conversations: Conversation[] = [];

export const messagesByConversation: Record<string, Message[]> = {};

export const invoices: Invoice[] = [];

export const assessmentsByStudent: Record<string, Assessment[]> = {};

export const dashboardData = {
  activeStudents: 0,
  workoutsThisWeek: 0,
  pendingInvoices: 0,
  unreadMessages: 0,
  upcomingEvents: [] as typeof events,
  recentActivity: [] as { id: string; text: string; at: string }[],
};

export const aiDraftFixture: Workout = {
  id: "w-ai-draft",
  title: "Plano hipertrofia 4x — gerado por IA",
  goal: "Hipertrofia",
  status: "draft",
  generatedByAi: true,
  updatedAt: new Date().toISOString(),
  exerciseCount: 8,
  notes: "Rascunho gerado por IA. Revise antes de salvar ou atribuir.",
  warnings: [
    "Frequência desejada (4x) acima do usual para iniciante — confirme o nível do aluno.",
  ],
  blocks: [
    {
      name: "Segunda — Peito/Tríceps",
      order: 0,
      warmUp: "5–8 min esteira leve + mobilidade de ombro e peitoral.",
      coolDown: "Alongamento de peitoral e tríceps, 2–3 min.",
      exercises: [
        {
          name: "Supino inclinado",
          sets: 4,
          reps: "8-10",
          intensity: "70% 1RM",
          restSeconds: 90,
          alternatives: ["Supino máquina", "Supino com halteres"],
          order: 0,
        },
        {
          name: "Crucifixo",
          sets: 3,
          reps: "12",
          intensity: "RPE 7",
          restSeconds: 60,
          alternatives: ["Peck deck", "Crossover"],
          order: 1,
        },
        {
          name: "Tríceps corda",
          sets: 3,
          reps: "12-15",
          intensity: "RPE 7",
          restSeconds: 60,
          alternatives: ["Tríceps pulley barra", "Tríceps testa"],
          order: 2,
        },
        {
          name: "Mergulho banco",
          sets: 3,
          reps: "10",
          intensity: "RPE 6",
          restSeconds: 60,
          alternatives: ["Tríceps banco máquina"],
          order: 3,
        },
      ],
    },
    {
      name: "Terça — Costas/Bíceps",
      order: 1,
      warmUp: "Remada com elástico + ativação escapular, 5 min.",
      coolDown: "Alongamento de dorsais e bíceps.",
      exercises: [
        {
          name: "Barra fixa assistida",
          sets: 4,
          reps: "6-8",
          intensity: "RPE 8",
          restSeconds: 90,
          alternatives: ["Puxada frontal", "Pulldown neutro"],
          order: 0,
        },
        {
          name: "Remada unilateral",
          sets: 3,
          reps: "10",
          intensity: "70% 1RM",
          restSeconds: 75,
          alternatives: ["Remada curvada", "Remada máquina"],
          order: 1,
        },
        {
          name: "Rosca martelo",
          sets: 3,
          reps: "12",
          intensity: "RPE 7",
          restSeconds: 60,
          alternatives: ["Rosca direta", "Rosca scott"],
          order: 2,
        },
        {
          name: "Face pull",
          sets: 3,
          reps: "15",
          intensity: "RPE 6",
          restSeconds: 45,
          alternatives: ["Crucifixo inverso", "Pull-apart elástico"],
          order: 3,
        },
      ],
    },
  ],
};
