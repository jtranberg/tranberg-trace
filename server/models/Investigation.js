import mongoose from "mongoose";

const TechSchema = new mongoose.Schema(
  {
    techId: { type: String, default: "" },
    techName: { type: String, default: "" },
  },
  { _id: false }
);

const TriggerSchema = new mongoose.Schema(
  {
    owner: { type: TechSchema, default: () => ({}) },
    stepsToReproduce: { type: String, default: "" },
    expectedBehavior: { type: String, default: "" },
    actualBehavior: { type: String, default: "" },
  },
  { _id: false }
);

const ReduceSchema = new mongoose.Schema(
  {
    owner: { type: TechSchema, default: () => ({}) },
    suspectedLayer: { type: String, default: "" },
    scopeNotes: { type: String, default: "" },
  },
  { _id: false }
);

const AnalyzeSchema = new mongoose.Schema(
  {
    owner: { type: TechSchema, default: () => ({}) },
    logs: { type: String, default: "" },
    telemetry: { type: String, default: "" },
    observedErrors: { type: String, default: "" },
  },
  { _id: false }
);

const ChallengeSchema = new mongoose.Schema(
  {
    owner: { type: TechSchema, default: () => ({}) },
    hypotheses: { type: String, default: "" },
    experiments: { type: String, default: "" },
    findings: { type: String, default: "" },
  },
  { _id: false }
);

const EliminateSchema = new mongoose.Schema(
  {
    owner: { type: TechSchema, default: () => ({}) },
    rootCause: { type: String, default: "" },
    fixApplied: { type: String, default: "" },
    safeguards: { type: String, default: "" },
    followUp: { type: String, default: "" },
  },
  { _id: false }
);

const InvestigationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "archived"],
      default: "open",
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    layer: {
      type: String,
      enum: ["frontend", "api", "service", "database", "infra", "unknown"],
      default: "unknown",
    },

    environment: {
      type: String,
      enum: ["local", "staging", "production"],
      default: "local",
    },

    tags: {
      type: [String],
      default: [],
    },

    reportedBy: { type: TechSchema, default: () => ({}) },
    openedBy: { type: TechSchema, default: () => ({}) },

    trigger: { type: TriggerSchema, default: () => ({}) },
    reduce: { type: ReduceSchema, default: () => ({}) },
    analyze: { type: AnalyzeSchema, default: () => ({}) },
    challenge: { type: ChallengeSchema, default: () => ({}) },
    eliminate: { type: EliminateSchema, default: () => ({}) },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Investigation", InvestigationSchema);