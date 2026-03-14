export type InvestigationStatus =
  | "open"
  | "in_progress"
  | "resolved"
  | "archived";

export type Severity = "low" | "medium" | "high" | "critical";

export type SystemLayer =
  | "frontend"
  | "api"
  | "service"
  | "database"
  | "infra"
  | "unknown";

export type EnvironmentType = "local" | "staging" | "production";

export type TechReference = {
  techId: string;
  techName: string;
};

export type TraceInvestigation = {
  id: string;

  tenantId: string;
  tenantName: string;

  projectId: string;
  projectName: string;

  title: string;
  description: string;
  status: InvestigationStatus;
  severity: Severity;
  layer: SystemLayer;
  environment: EnvironmentType;
  tags: string[];

  reportedBy: TechReference;
  openedBy: TechReference;

  trigger: {
    owner: TechReference;
    stepsToReproduce: string;
    expectedBehavior: string;
    actualBehavior: string;
  };

  reduce: {
    owner: TechReference;
    suspectedLayer: string;
    scopeNotes: string;
  };

  analyze: {
    owner: TechReference;
    logs: string;
    telemetry: string;
    observedErrors: string;
  };

  challenge: {
    owner: TechReference;
    hypotheses: string;
    experiments: string;
    findings: string;
  };

  eliminate: {
    owner: TechReference;
    rootCause: string;
    fixApplied: string;
    safeguards: string;
    followUp: string;
  };

  createdAt: string;
  updatedAt: string;
};