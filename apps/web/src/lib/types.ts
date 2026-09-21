export type Role = "PERSONAL" | "ALUNO";

export type SessionStatus = "scheduled" | "done" | "canceled" | "rescheduled";

export type PaymentStatus = "paid" | "pending" | "overdue";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: string;
  monthlyValue: number;
  dueDay: number;
  status: PaymentStatus;
  startedAt: string;
}

export interface Workout {
  id: string;
  title: string;
  focus: string;
  studentId: string;
  studentName: string;
  sessionsPerWeek: number;
  updatedAt: string;
}

export interface TrainingSession {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  startsAt: string;
  endsAt: string;
  status: SessionStatus;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  paidAt?: string;
}

export interface DashboardData {
  greeting: string;
  kpis: { label: string; value: string; hint?: string }[];
  upcoming: TrainingSession[];
  alerts: string[];
}
