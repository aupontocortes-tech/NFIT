import type {
  AuthResponse,
  DashboardData,
  Payment,
  Student,
  TrainingSession,
  User,
  Workout,
} from "./types";

const PERSONAL: User = {
  id: "usr_personal",
  name: "Thiago Personal",
  email: "personal@nfit.local",
  role: "PERSONAL",
};

const ALUNO: User = {
  id: "usr_aluno",
  name: "Ana Aluna",
  email: "aluno@nfit.local",
  role: "ALUNO",
};

const SEED_PASSWORD = "senha12345";

export const students: Student[] = [
  {
    id: "stu_ana",
    name: "Ana Aluna",
    email: "aluno@nfit.local",
    phone: "(11) 98888-1001",
    plan: "3x semana",
    monthlyValue: 420,
    dueDay: 10,
    status: "paid",
    startedAt: "2026-03-02",
  },
  {
    id: "stu_bruno",
    name: "Bruno Costa",
    email: "bruno@nfit.local",
    phone: "(11) 97777-2002",
    plan: "2x semana",
    monthlyValue: 320,
    dueDay: 5,
    status: "pending",
    startedAt: "2026-05-14",
  },
  {
    id: "stu_carla",
    name: "Carla Mendes",
    email: "carla@nfit.local",
    phone: "(21) 96666-3003",
    plan: "Personal online",
    monthlyValue: 280,
    dueDay: 15,
    status: "overdue",
    startedAt: "2025-11-20",
  },
  {
    id: "stu_diego",
    name: "Diego Ramos",
    email: "diego@nfit.local",
    phone: "(31) 95555-4004",
    plan: "Emagrecimento",
    monthlyValue: 450,
    dueDay: 8,
    status: "paid",
    startedAt: "2026-01-08",
  },
];

const now = new Date();
function atHour(dayOffset: number, hour: number, minutes = 0) {
  const d = new Date(now);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minutes, 0, 0);
  return d.toISOString();
}

export const sessions: TrainingSession[] = [
  {
    id: "ses_1",
    studentId: "stu_ana",
    studentName: "Ana Aluna",
    title: "Força — membros inferiores",
    startsAt: atHour(0, 7, 0),
    endsAt: atHour(0, 8, 0),
    status: "scheduled",
  },
  {
    id: "ses_2",
    studentId: "stu_bruno",
    studentName: "Bruno Costa",
    title: "Hipertrofia — push",
    startsAt: atHour(0, 18, 0),
    endsAt: atHour(0, 19, 0),
    status: "scheduled",
  },
  {
    id: "ses_3",
    studentId: "stu_carla",
    studentName: "Carla Mendes",
    title: "Cardio + core",
    startsAt: atHour(1, 9, 30),
    endsAt: atHour(1, 10, 30),
    status: "rescheduled",
  },
  {
    id: "ses_4",
    studentId: "stu_diego",
    studentName: "Diego Ramos",
    title: "Full body",
    startsAt: atHour(2, 6, 30),
    endsAt: atHour(2, 7, 30),
    status: "scheduled",
  },
  {
    id: "ses_5",
    studentId: "stu_ana",
    studentName: "Ana Aluna",
    title: "Mobilidade",
    startsAt: atHour(-1, 7, 0),
    endsAt: atHour(-1, 8, 0),
    status: "done",
  },
];

export const workouts: Workout[] = [
  {
    id: "wo_1",
    title: "Bloco força A",
    focus: "Agachamento, hip thrust, posterior",
    studentId: "stu_ana",
    studentName: "Ana Aluna",
    sessionsPerWeek: 3,
    updatedAt: atHour(-2, 12),
  },
  {
    id: "wo_2",
    title: "Push / pull iniciante",
    focus: "Peito, costas e ombro com máquina",
    studentId: "stu_bruno",
    studentName: "Bruno Costa",
    sessionsPerWeek: 2,
    updatedAt: atHour(-5, 16),
  },
  {
    id: "wo_3",
    title: "Déficit calórico + steps",
    focus: "Circuito metabólico 35 min",
    studentId: "stu_carla",
    studentName: "Carla Mendes",
    sessionsPerWeek: 4,
    updatedAt: atHour(-1, 9),
  },
];

export const payments: Payment[] = [
  {
    id: "pay_1",
    studentId: "stu_ana",
    studentName: "Ana Aluna",
    amount: 420,
    dueDate: "2026-09-10",
    status: "paid",
    paidAt: "2026-09-08",
  },
  {
    id: "pay_2",
    studentId: "stu_bruno",
    studentName: "Bruno Costa",
    amount: 320,
    dueDate: "2026-09-05",
    status: "pending",
  },
  {
    id: "pay_3",
    studentId: "stu_carla",
    studentName: "Carla Mendes",
    amount: 280,
    dueDate: "2026-08-15",
    status: "overdue",
  },
  {
    id: "pay_4",
    studentId: "stu_diego",
    studentName: "Diego Ramos",
    amount: 450,
    dueDate: "2026-09-08",
    status: "paid",
    paidAt: "2026-09-07",
  },
];

function wait(ms = 280) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function scoped<T extends { studentId: string }>(items: T[], user: User) {
  if (user.role === "PERSONAL") return items;
  const mine = students.find((s) => s.email === user.email);
  return items.filter((item) => item.studentId === mine?.id);
}

export async function mockLogin(email: string, password: string): Promise<AuthResponse> {
  await wait();
  const user = [PERSONAL, ALUNO].find((u) => u.email === email.toLowerCase());
  if (!user || password !== SEED_PASSWORD) {
    throw new Error("E-mail ou senha inválidos.");
  }
  return {
    accessToken: `mock.${user.role.toLowerCase()}.${user.id}`,
    user,
  };
}

export async function mockMe(token: string): Promise<User> {
  await wait(80);
  if (token.includes("personal")) return PERSONAL;
  if (token.includes("aluno")) return ALUNO;
  throw new Error("Sessão inválida.");
}

export async function mockDashboard(user: User): Promise<DashboardData> {
  await wait();
  const upcoming = scoped(sessions, user)
    .filter((s) => s.status === "scheduled" || s.status === "rescheduled")
    .slice(0, 4);

  if (user.role === "ALUNO") {
    const mine = payments.filter((p) => p.studentId === "stu_ana");
    return {
      greeting: `Olá, ${user.name.split(" ")[0]}`,
      kpis: [
        { label: "Próximo treino", value: upcoming[0] ? "Hoje 07:00" : "—" },
        { label: "Frequência", value: "3x / semana" },
        { label: "Mensalidade", value: mine[0]?.status === "paid" ? "Em dia" : "Pendente" },
      ],
      upcoming,
      alerts: ["Seu treino de pernas está no app. Chegue 5 min antes."],
    };
  }

  const pending = payments.filter((p) => p.status !== "paid").length;
  const revenue = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  return {
    greeting: `Studio de ${user.name.split(" ")[0]}`,
    kpis: [
      { label: "Alunos ativos", value: String(students.length), hint: "Fase 1" },
      { label: "Recebido no mês", value: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(revenue) },
      { label: "Pendências", value: String(pending) },
      { label: "Aulas hoje", value: String(sessions.filter((s) => s.startsAt.slice(0, 10) === now.toISOString().slice(0, 10)).length) },
    ],
    upcoming,
    alerts:
      pending > 0
        ? [`${pending} cobrança(s) em aberto. Veja Pagamentos.`]
        : ["Nenhuma pendência financeira."],
  };
}

export async function mockStudents(user: User) {
  await wait();
  if (user.role === "ALUNO") {
    return students.filter((s) => s.email === user.email);
  }
  return students;
}

export async function mockStudent(id: string, user: User) {
  await wait();
  const student = students.find((s) => s.id === id);
  if (!student) throw new Error("Aluno não encontrado.");
  if (user.role === "ALUNO" && student.email !== user.email) {
    throw new Error("Sem permissão.");
  }
  return student;
}

export async function mockSessions(user: User) {
  await wait();
  return scoped(sessions, user);
}

export async function mockWorkouts(user: User) {
  await wait();
  return scoped(workouts, user);
}

export async function mockPayments(user: User) {
  await wait();
  return scoped(payments, user);
}
