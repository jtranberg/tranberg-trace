import type { TraceInvestigation } from "../types/trace";

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ||
  "http://localhost:5000";

function emptyTech() {
  return {
    techId: "",
    techName: "",
  };
}

function normalizeInvestigation(
  raw: Partial<TraceInvestigation> & { _id?: string },
): TraceInvestigation {
  const now = new Date().toISOString();

  return {
    id: raw.id ?? raw._id ?? crypto.randomUUID(),

    tenantId: raw.tenantId ?? "",
    tenantName: raw.tenantName ?? "",
    projectId: raw.projectId ?? "",
    projectName: raw.projectName ?? "",

    title: raw.title ?? "",
    description: raw.description ?? "",
    status: raw.status ?? "open",
    severity: raw.severity ?? "medium",
    layer: raw.layer ?? "unknown",
    environment: raw.environment ?? "local",
    tags: Array.isArray(raw.tags) ? raw.tags : [],

    reportedBy: raw.reportedBy ?? emptyTech(),
    openedBy: raw.openedBy ?? emptyTech(),

    trigger: {
      owner: raw.trigger?.owner ?? emptyTech(),
      stepsToReproduce: raw.trigger?.stepsToReproduce ?? "",
      expectedBehavior: raw.trigger?.expectedBehavior ?? "",
      actualBehavior: raw.trigger?.actualBehavior ?? "",
    },
    reduce: {
      owner: raw.reduce?.owner ?? emptyTech(),
      suspectedLayer: raw.reduce?.suspectedLayer ?? "",
      scopeNotes: raw.reduce?.scopeNotes ?? "",
    },
    analyze: {
      owner: raw.analyze?.owner ?? emptyTech(),
      logs: raw.analyze?.logs ?? "",
      telemetry: raw.analyze?.telemetry ?? "",
      observedErrors: raw.analyze?.observedErrors ?? "",
    },
    challenge: {
      owner: raw.challenge?.owner ?? emptyTech(),
      hypotheses: raw.challenge?.hypotheses ?? "",
      experiments: raw.challenge?.experiments ?? "",
      findings: raw.challenge?.findings ?? "",
    },
    eliminate: {
      owner: raw.eliminate?.owner ?? emptyTech(),
      rootCause: raw.eliminate?.rootCause ?? "",
      fixApplied: raw.eliminate?.fixApplied ?? "",
      safeguards: raw.eliminate?.safeguards ?? "",
      followUp: raw.eliminate?.followUp ?? "",
    },

    createdAt: raw.createdAt ?? now,
    updatedAt: raw.updatedAt ?? now,
  };
}

function toApiPayload(item: TraceInvestigation) {
  return {
    title: item.title,
    description: item.description,
    status: item.status,
    severity: item.severity,
    layer: item.layer,
    environment: item.environment,
    tags: item.tags,

    tenantId: item.tenantId,
    tenantName: item.tenantName,
    projectId: item.projectId,
    projectName: item.projectName,

    reportedBy: item.reportedBy,
    openedBy: item.openedBy,

    trigger: item.trigger,
    reduce: item.reduce,
    analyze: item.analyze,
    challenge: item.challenge,
    eliminate: item.eliminate,
  };
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `API request failed (${response.status}): ${text || response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}

export async function loadInvestigations(): Promise<TraceInvestigation[]> {
  try {
    const data = await apiFetch<
      Array<Partial<TraceInvestigation> & { _id?: string }>
    >("/api/investigations");
    return data.map(normalizeInvestigation);
  } catch (error) {
    console.error("Failed to load investigations from API:", error);
    return [];
  }
}

export async function getInvestigationById(
  id: string,
): Promise<TraceInvestigation | undefined> {
  try {
    const data = await apiFetch<Partial<TraceInvestigation> & { _id?: string }>(
      `/api/investigations/${id}`,
    );
    return normalizeInvestigation(data);
  } catch (error) {
    console.error(`Failed to load investigation ${id}:`, error);
    return undefined;
  }
}

export async function createInvestigation(
  item: TraceInvestigation,
): Promise<TraceInvestigation> {
  const data = await apiFetch<Partial<TraceInvestigation> & { _id?: string }>(
    "/api/investigations",
    {
      method: "POST",
      body: JSON.stringify(toApiPayload(item)),
    },
  );

  return normalizeInvestigation(data);
}

export async function updateInvestigation(
  updated: TraceInvestigation,
): Promise<TraceInvestigation> {
  const data = await apiFetch<Partial<TraceInvestigation> & { _id?: string }>(
    `/api/investigations/${updated.id}`,
    {
      method: "PUT",
      body: JSON.stringify(toApiPayload(updated)),
    },
  );

  return normalizeInvestigation(data);
}

export async function deleteInvestigation(id: string): Promise<void> {
  await apiFetch(`/api/investigations/${id}`, {
    method: "DELETE",
  });
}

export function createEmptyInvestigation(): TraceInvestigation {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    tenantId: "",
    tenantName: "",
    projectId: "",
    projectName: "",

    title: "",
    description: "",
    status: "open",
    severity: "medium",
    layer: "unknown",
    environment: "local",
    tags: [],

    reportedBy: emptyTech(),
    openedBy: emptyTech(),

    trigger: {
      owner: emptyTech(),
      stepsToReproduce: "",
      expectedBehavior: "",
      actualBehavior: "",
    },
    reduce: {
      owner: emptyTech(),
      suspectedLayer: "",
      scopeNotes: "",
    },
    analyze: {
      owner: emptyTech(),
      logs: "",
      telemetry: "",
      observedErrors: "",
    },
    challenge: {
      owner: emptyTech(),
      hypotheses: "",
      experiments: "",
      findings: "",
    },
    eliminate: {
      owner: emptyTech(),
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
  updatedAt: string,
): number | null {
  const start = new Date(createdAt).getTime();
  const end = new Date(updatedAt).getTime();

  if (Number.isNaN(start) || Number.isNaN(end)) return null;

  return Math.max(0, Math.round((end - start) / 1000 / 60));
}

export function getDurationLabel(createdAt: string, updatedAt: string): string {
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
