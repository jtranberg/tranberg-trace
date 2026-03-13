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