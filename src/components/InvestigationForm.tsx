import { useState } from "react";
import TraceSectionCard from "./TraceSectionCard";
import type { TraceInvestigation } from "../types/trace";

type InvestigationFormProps = {
  initialValue: TraceInvestigation;
  submitLabel: string;
  onSubmit: (value: TraceInvestigation) => void;
};

export default function InvestigationForm({
  initialValue,
  submitLabel,
  onSubmit,
}: InvestigationFormProps) {
  const [form, setForm] = useState<TraceInvestigation>(initialValue);

  function updateField<K extends keyof TraceInvestigation>(
    key: K,
    value: TraceInvestigation[K]
  ) {
    setForm((prev: TraceInvestigation) => ({
      ...prev,
      [key]: value,
      updatedAt: new Date().toISOString(),
    }));
  }

  function updateNestedField<
    K extends keyof Pick<
      TraceInvestigation,
      "trigger" | "reduce" | "analyze" | "challenge" | "eliminate"
    >,
    F extends keyof TraceInvestigation[K]
  >(section: K, field: F, value: TraceInvestigation[K][F]) {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
      updatedAt: new Date().toISOString(),
    }));
  }

  function handleTagsChange(value: string) {
    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    updateField("tags", tags);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim()) {
      alert("Please enter an investigation title.");
      return;
    }

    onSubmit({
      ...form,
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <form className="trace-form" onSubmit={handleSubmit}>
      <section className="trace-card">
        <div className="trace-card-header">
          <h3>Investigation Overview</h3>
          <p>Define the case before you begin the hunt.</p>
        </div>

        <div className="form-grid">
          <label className="field field-full">
            <span>Title</span>
            <input
              type="text"
              placeholder="Example: Login fails on token refresh"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
            />
          </label>

          <label className="field field-full">
            <span>Description</span>
            <textarea
              rows={4}
              placeholder="Describe the issue, user impact, and current symptoms..."
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </label>

          <label className="field">
            <span>Status</span>
            <select
              value={form.status}
              onChange={(e) =>
                updateField("status", e.target.value as TraceInvestigation["status"])
              }
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="archived">Archived</option>
            </select>
          </label>

          <label className="field">
            <span>Severity</span>
            <select
              value={form.severity}
              onChange={(e) =>
                updateField(
                  "severity",
                  e.target.value as TraceInvestigation["severity"]
                )
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </label>

          <label className="field">
            <span>System Layer</span>
            <select
              value={form.layer}
              onChange={(e) =>
                updateField("layer", e.target.value as TraceInvestigation["layer"])
              }
            >
              <option value="unknown">Unknown</option>
              <option value="frontend">Frontend</option>
              <option value="api">API</option>
              <option value="service">Service</option>
              <option value="database">Database</option>
              <option value="infra">Infrastructure</option>
            </select>
          </label>

          <label className="field">
            <span>Environment</span>
            <select
              value={form.environment}
              onChange={(e) =>
                updateField(
                  "environment",
                  e.target.value as TraceInvestigation["environment"]
                )
              }
            >
              <option value="local">Local</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
          </label>

          <label className="field field-full">
            <span>Tags</span>
            <input
              type="text"
              placeholder="auth, login, jwt, production"
              value={form.tags.join(", ")}
              onChange={(e) => handleTagsChange(e.target.value)}
            />
          </label>
        </div>
      </section>

      <TraceSectionCard
        title="T — Trigger the Issue"
        subtitle="Reproduce it clearly and define the gap between expected and actual behavior."
      >
        <div className="form-grid">
          <label className="field field-full">
            <span>Steps to Reproduce</span>
            <textarea
              rows={5}
              value={form.trigger.stepsToReproduce}
              onChange={(e) =>
                updateNestedField("trigger", "stepsToReproduce", e.target.value)
              }
            />
          </label>

          <label className="field">
            <span>Expected Behavior</span>
            <textarea
              rows={4}
              value={form.trigger.expectedBehavior}
              onChange={(e) =>
                updateNestedField("trigger", "expectedBehavior", e.target.value)
              }
            />
          </label>

          <label className="field">
            <span>Actual Behavior</span>
            <textarea
              rows={4}
              value={form.trigger.actualBehavior}
              onChange={(e) =>
                updateNestedField("trigger", "actualBehavior", e.target.value)
              }
            />
          </label>
        </div>
      </TraceSectionCard>

      <TraceSectionCard
        title="R — Reduce the Scope"
        subtitle="Narrow the blast radius and isolate the likely layer."
      >
        <div className="form-grid">
          <label className="field">
            <span>Suspected Layer</span>
            <input
              type="text"
              placeholder="Example: API auth middleware"
              value={form.reduce.suspectedLayer}
              onChange={(e) =>
                updateNestedField("reduce", "suspectedLayer", e.target.value)
              }
            />
          </label>

          <label className="field field-full">
            <span>Scope Notes</span>
            <textarea
              rows={4}
              value={form.reduce.scopeNotes}
              onChange={(e) =>
                updateNestedField("reduce", "scopeNotes", e.target.value)
              }
            />
          </label>
        </div>
      </TraceSectionCard>

      <TraceSectionCard
        title="A — Analyze the Signals"
        subtitle="Capture logs, telemetry, and raw evidence."
      >
        <div className="form-grid">
          <label className="field field-full">
            <span>Logs</span>
            <textarea
              rows={5}
              value={form.analyze.logs}
              onChange={(e) =>
                updateNestedField("analyze", "logs", e.target.value)
              }
            />
          </label>

          <label className="field">
            <span>Telemetry</span>
            <textarea
              rows={4}
              value={form.analyze.telemetry}
              onChange={(e) =>
                updateNestedField("analyze", "telemetry", e.target.value)
              }
            />
          </label>

          <label className="field">
            <span>Error Messages</span>
            <textarea
              rows={4}
              value={form.analyze.errors}
              onChange={(e) =>
                updateNestedField("analyze", "errors", e.target.value)
              }
            />
          </label>
        </div>
      </TraceSectionCard>

      <TraceSectionCard
        title="C — Challenge Assumptions"
        subtitle="List your theories, experiments, and what the evidence proved."
      >
        <div className="form-grid">
          <label className="field">
            <span>Hypotheses</span>
            <textarea
              rows={4}
              value={form.challenge.hypotheses}
              onChange={(e) =>
                updateNestedField("challenge", "hypotheses", e.target.value)
              }
            />
          </label>

          <label className="field">
            <span>Experiments Run</span>
            <textarea
              rows={4}
              value={form.challenge.experiments}
              onChange={(e) =>
                updateNestedField("challenge", "experiments", e.target.value)
              }
            />
          </label>

          <label className="field field-full">
            <span>Findings</span>
            <textarea
              rows={4}
              value={form.challenge.findings}
              onChange={(e) =>
                updateNestedField("challenge", "findings", e.target.value)
              }
            />
          </label>
        </div>
      </TraceSectionCard>

      <TraceSectionCard
        title="E — Eliminate the Root Cause"
        subtitle="Document the actual fix and the guardrails that keep it gone."
      >
        <div className="form-grid">
          <label className="field">
            <span>Root Cause</span>
            <textarea
              rows={4}
              value={form.eliminate.rootCause}
              onChange={(e) =>
                updateNestedField("eliminate", "rootCause", e.target.value)
              }
            />
          </label>

          <label className="field">
            <span>Fix Applied</span>
            <textarea
              rows={4}
              value={form.eliminate.fixApplied}
              onChange={(e) =>
                updateNestedField("eliminate", "fixApplied", e.target.value)
              }
            />
          </label>

          <label className="field">
            <span>Safeguards Added</span>
            <textarea
              rows={4}
              value={form.eliminate.safeguards}
              onChange={(e) =>
                updateNestedField("eliminate", "safeguards", e.target.value)
              }
            />
          </label>

          <label className="field">
            <span>Follow-up Tasks</span>
            <textarea
              rows={4}
              value={form.eliminate.followUp}
              onChange={(e) =>
                updateNestedField("eliminate", "followUp", e.target.value)
              }
            />
          </label>
        </div>
      </TraceSectionCard>

      <div className="form-actions">
        <button className="primary-btn" type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}