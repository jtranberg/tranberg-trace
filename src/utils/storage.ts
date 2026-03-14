import type { TraceInvestigation } from "../types/trace";

const STORAGE_KEY = "tranberg-trace-investigations";

export function loadInvestigations(): TraceInvestigation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TraceInvestigation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to load investigations from storage:", error);
    return [];
  }
}

export function saveInvestigations(items: TraceInvestigation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save investigations to storage:", error);
  }
}

export function getInvestigationById(
  id: string
): TraceInvestigation | undefined {
  return loadInvestigations().find((item) => item.id === id);
}

export function createInvestigation(item: TraceInvestigation): void {
  const existing = loadInvestigations();
  saveInvestigations([item, ...existing]);
}

export function updateInvestigation(updated: TraceInvestigation): void {
  const existing = loadInvestigations();
  const next = existing.map((item) =>
    item.id === updated.id ? updated : item
  );
  saveInvestigations(next);
}

export function deleteInvestigation(id: string): void {
  const existing = loadInvestigations();
  const next = existing.filter((item) => item.id !== id);
  saveInvestigations(next);
}

export function createEmptyInvestigation(): TraceInvestigation {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    status: "open",
    severity: "medium",
    layer: "unknown",
    environment: "local",
    tags: [],
    trigger: {
      stepsToReproduce: "",
      expectedBehavior: "",
      actualBehavior: "",
    },
    reduce: {
      suspectedLayer: "",
      scopeNotes: "",
    },
    analyze: {
      logs: "",
      telemetry: "",
      errors: "",
    },
    challenge: {
      hypotheses: "",
      experiments: "",
      findings: "",
    },
    eliminate: {
      rootCause: "",
      fixApplied: "",
      safeguards: "",
      followUp: "",
    },
    createdAt: now,
    updatedAt: now,
  };
}

export function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unknown time";

  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getDurationMinutes(
  createdAt: string,
  updatedAt: string
): number | null {
  const start = new Date(createdAt).getTime();
  const end = new Date(updatedAt).getTime();

  if (Number.isNaN(start) || Number.isNaN(end)) return null;

  return Math.max(0, Math.round((end - start) / 1000 / 60));
}

export function getDurationLabel(
  createdAt: string,
  updatedAt: string
): string {
  const start = new Date(createdAt).getTime();
  const end = new Date(updatedAt).getTime();

  if (Number.isNaN(start) || Number.isNaN(end)) return "Unknown";

  const totalMinutes = Math.max(0, Math.round((end - start) / 1000 / 60));

  if (totalMinutes < 60) return `${totalMinutes} min`;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) return `${hours} hr`;

  return `${hours} hr ${minutes} min`;
}