import { useSyncExternalStore } from "react";

import type { UserRole } from "@/components/layout/navigation";

export interface DemoSession {
  username: string;
  name: string;
  email: string;
  role: string;
  navigationRole: UserRole;
}

export const DEMO_CREDENTIALS = {
  username: "admin",
  password: "12345",
} as const;

const AUTH_STORAGE_KEY = "anexra-ehr-session";

export const DEMO_ADMIN: DemoSession = {
  username: "admin",
  name: "System Administrator",
  email: "admin@anexra.com",
  role: "Administrator",
  navigationRole: "admin",
};

type Listener = () => void;

let currentSession: DemoSession | null = null;

const listeners = new Set<Listener>();

function isClient() {
  return typeof window !== "undefined";
}

function readStoredSession(): DemoSession | null {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (!raw) return null;

    const parsed = JSON.parse(raw) as DemoSession;

    return parsed &&
      typeof parsed === "object" &&
      typeof parsed.username === "string"
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function initSession() {
  if (!isClient() || currentSession !== null) return;

  currentSession = readStoredSession();

  emit();
}

export function login(username: string, password: string): DemoSession | null {
  const isValid =
    username.trim().toLowerCase() === DEMO_CREDENTIALS.username &&
    password === DEMO_CREDENTIALS.password;

  if (!isValid) return null;

  if (isClient()) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_ADMIN));
  }

  if (currentSession?.username !== DEMO_ADMIN.username) {
    currentSession = DEMO_ADMIN;

    emit();
  }

  return DEMO_ADMIN;
}

export function logout() {
  if (isClient()) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  if (currentSession !== null) {
    currentSession = null;

    emit();
  }
}

export function getSession(): DemoSession | null {
  return currentSession;
}

function subscribeSession(listener: Listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function useDemoSession(): DemoSession | null {
  return useSyncExternalStore(subscribeSession, getSession, () => null);
}
