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

export type TraceInvestigation = {
  id: string;
  title: string;
  description: string;
  status: InvestigationStatus;
  severity: Severity;
  layer: SystemLayer;
  environment: EnvironmentType;
  tags: string[];
  trigger: {
    stepsToReproduce: string;
    expectedBehavior: string;
    actualBehavior: string;
  };
  reduce: {
    suspectedLayer: string;
    scopeNotes: string;
  };
  analyze: {
    logs: string;
    telemetry: string;
    errors: string;
  };
  challenge: {
    hypotheses: string;
    experiments: string;
    findings: string;
  };
  eliminate: {
    rootCause: string;
    fixApplied: string;
    safeguards: string;
    followUp: string;
  };
  createdAt: string;
  updatedAt: string;
};