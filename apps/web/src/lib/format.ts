const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
});

const dateTimeFmt = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const timeFmt = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

export function formatMoney(value: number) {
  return currency.format(value);
}

export function formatDate(iso: string) {
  return dateFmt.format(new Date(iso));
}

export function formatDateTime(iso: string) {
  return dateTimeFmt.format(new Date(iso));
}

export function formatTime(iso: string) {
  return timeFmt.format(new Date(iso));
}

export const paymentLabel: Record<string, string> = {
  paid: "Pago",
  pending: "Pendente",
  overdue: "Atrasado",
};

export const sessionLabel: Record<string, string> = {
  scheduled: "Agendada",
  done: "Concluída",
  canceled: "Cancelada",
  rescheduled: "Remarcada",
};
