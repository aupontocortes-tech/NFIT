import { API_BASE, USE_MOCK } from "./env";
import {
  mockDashboard,
  mockLogin,
  mockMe,
  mockPayments,
  mockSessions,
  mockStudent,
  mockStudents,
  mockWorkouts,
} from "./mock";
import { getStoredUser, getToken } from "./storage";
import type {
  AuthResponse,
  DashboardData,
  Payment,
  Student,
  TrainingSession,
  User,
  Workout,
} from "./types";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    let message = `Erro ${res.status}`;
    try {
      const body = (await res.json()) as { message?: string; error?: string };
      message = body.message || body.error || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function currentUser() {
  const user = getStoredUser();
  if (!user) throw new Error("Sessão expirada. Entre novamente.");
  return user;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  if (USE_MOCK) return mockLogin(email, password);
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function me(): Promise<User> {
  const token = getToken();
  if (!token) throw new Error("Sessão expirada. Entre novamente.");
  if (USE_MOCK) return mockMe(token);
  return request<User>("/auth/me");
}

export async function getDashboard(): Promise<DashboardData> {
  if (USE_MOCK) return mockDashboard(currentUser());
  return request<DashboardData>("/dashboard");
}

export async function getStudents(): Promise<Student[]> {
  if (USE_MOCK) return mockStudents(currentUser());
  return request<Student[]>("/students");
}

export async function getStudent(id: string): Promise<Student> {
  if (USE_MOCK) return mockStudent(id, currentUser());
  return request<Student>(`/students/${id}`);
}

export async function getSessions(): Promise<TrainingSession[]> {
  if (USE_MOCK) return mockSessions(currentUser());
  return request<TrainingSession[]>("/sessions");
}

export async function getWorkouts(): Promise<Workout[]> {
  if (USE_MOCK) return mockWorkouts(currentUser());
  return request<Workout[]>("/workouts");
}

export async function getPayments(): Promise<Payment[]> {
  if (USE_MOCK) return mockPayments(currentUser());
  return request<Payment[]>("/payments");
}
