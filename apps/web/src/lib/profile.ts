"use client";

import { useEffect, useSyncExternalStore } from "react";
import { api, type PersonalProfile } from "@/lib/api";

/**
 * Perfil do personal compartilhado entre telas (menu lateral, cabeçalho, configurações).
 * Quando o perfil é salvo, todas as telas que usam useProfile() atualizam na hora.
 */
let current: PersonalProfile | null = null;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function setProfile(p: PersonalProfile | null) {
  current = p;
  emit();
}

function load() {
  if (!loading) {
    loading = api
      .getPersonalProfile()
      .then((p) => setProfile(p))
      .catch(() => {
        loading = null;
      });
  }
  return loading;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useProfile() {
  const profile = useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
  useEffect(() => {
    if (!current) load();
  }, []);
  return profile;
}

/** Limpa o cache (ex.: no logout). */
export function resetProfile() {
  loading = null;
  setProfile(null);
}
