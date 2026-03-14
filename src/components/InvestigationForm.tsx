import { useEffect, useState } from "react";
import TraceSectionCard from "./TraceSectionCard";
import type { TraceInvestigation } from "../types/trace";
import {
  loadProjects,
  loadTenants,
  type ProjectOption,
  type TenantOption,
} from "../utils/storage";

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
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    setForm(initialValue);
  }, [initialValue]);

  useEffect(() => {
    let isMounted = true;

    async function fetchTenants() {
      try {
        const data = await loadTenants();
        if (isMounted) {
          setTenants(data);
        }
      } catch (error) {
        console.error("Failed to fetch tenants:", error);
      } finally {
        if (isMounted) {
          setLoadingTenants(false);
        }
      }
    }

    fetchTenants();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchProjects() {
      if (!form.tenantId) {
        setProjects([]);
        return;
      }

      try {
        setLoadingProjects(true);
        const data = await loadProjects(form.tenantId);

        if (isMounted) {
          setProjects(data);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        if (isMounted) {
          setProjects([]);
        }
      } finally {
        if (isMounted) {
          setLoadingProjects(false);
        }
      }
    }

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, [form.tenantId]);

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
    F extends Exclude<keyof TraceInvestigation[K], "owner">
  >(section: K, field: F, value: TraceInvestigation[K][F]) {
    setForm((prev: TraceInvestigation) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
      updatedAt: new Date().toISOString(),
    }));
  }

  function updateTopLevelTech(
    field: "reportedBy" | "openedBy",
    techKey: "techId" | "techName",
    value: string
  ) {
    setForm((prev: TraceInvestigation) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [techKey]: value,
      },
      updatedAt: new Date().toISOString(),
    }));
  }

  function updateStageOwner(
    section: "trigger" | "reduce" | "analyze" | "challenge" | "eliminate",
    techKey: "techId" | "techName",
    value: string
  ) {
    setForm((prev: TraceInvestigation) => ({
      ...prev,
      [section]: {
        ...prev[section],
        owner: {
          ...prev[section].owner,
          [techKey]: value,
        },
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

  function handleTenantSelect(tenantId: string) {
    const selectedTenant = tenants.find((tenant) => tenant._id === tenantId);

    setForm((prev: TraceInvestigation) => ({
      ...prev,
      tenantId: selectedTenant?._id ?? "",
      tenantName: selectedTenant?.name ?? "",
      projectId: "",
      projectName: "",
      updatedAt: new Date().toISOString(),
    }));
  }

  function handleProjectSelect(projectId: string) {
    const selectedProject = projects.find((project) => project._id === projectId);

    setForm((prev: TraceInvestigation) => ({
      ...prev,
      projectId: selectedProject?._id ?? "",
      projectName: selectedProject?.name ?? "",
      updatedAt: new Date().toISOString(),
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.tenantId.trim()) {
      alert("Please select a company.");
      return;
    }

    if (!form.projectId.trim()) {
      alert("Please select a project.");
      return;
    }

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
            <span>Company</span>
            <select
              value={form.tenantId}
              onChange={(e) => handleTenantSelect(e.target.value)}
              disabled={loadingTenants}
            >
              <option value="">
                {loadingTenants ? "Loading companies..." : "Select a company"}
              </option>
              {tenants.map((tenant) => (
                <option key={tenant._id} value={tenant._id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Project</span>
            <select
              value={form.projectId}
              onChange={(e) => handleProjectSelect(e.target.value)}
              disabled={!form.tenantId || loadingProjects}
            >
              <option value="">
                {!form.tenantId
                  ? "Select a company first"
                  : loadingProjects
                  ? "Loading projects..."
                  : "Select a project"}
              </option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name} ({project.key})
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Company ID</span>
            <input type="text" value={form.tenantId} readOnly />
          </label>

          <label className="field">
            <span>Project ID</span>
            <input type="text" value={form.projectId} readOnly />
          </label>

          <label className="field">
            <span>Status</span>
            <select
              value={form.status}
              onChange={(e) =>
                updateField(
                  "status",
                  e.target.value as TraceInvestigation["status"]
                )
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
                updateField(
                  "layer",
                  e.target.value as TraceInvestigation["layer"]
                )
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

          <label className="field">
            <span>Reported By Name</span>
            <input
              type="text"
              placeholder="Example: Jay Tranberg"
              value={form.reportedBy.techName}
              onChange={(e) =>
                updateTopLevelTech("reportedBy", "techName", e.target.value)
              }
            />
          </label>

          <label className="field">
            <span>Reported By ID</span>
            <input
              type="text"
              placeholder="Example: TECH-001"
              value={form.reportedBy.techId}
              onChange={(e) =>
                updateTopLevelTech("reportedBy", "techId", e.target.value)
              }
            />
          </label>

          <label className="field">
            <span>Opened By Name</span>
            <input
              type="text"
              placeholder="Example: Alex Chen"
              value={form.openedBy.techName}
              onChange={(e) =>
                updateTopLevelTech("openedBy", "techName", e.target.value)
              }
            />
          </label>

          <label className="field">
            <span>Opened By ID</span>
            <input
              type="text"
              placeholder="Example: TECH-014"
              value={form.openedBy.techId}
              onChange={(e) =>
                updateTopLevelTech("openedBy", "techId", e.target.value)
              }
            />
          </label>
        </div>
      </section>

      <TraceSectionCard
        title="T — Trigger the Issue"
        subtitle="Reproduce it clearly and define the gap between expected and actual behavior."
      >
        <div className="form-grid">
          <label className="field">
            <span>Trigger Owner Name</span>
            <input
              type="text"
              placeholder="Example: Jordan Lee"
              value={form.trigger.owner.techName}
              onChange={(e) =>
                updateStageOwner("trigger", "techName", e.target.value)
              }
            />
          </label>

          <label className="field">
            <span>Trigger Owner ID</span>
            <input
              type="text"
              placeholder="Example: TECH-021"
              value={form.trigger.owner.techId}
              onChange={(e) =>
                updateStageOwner("trigger", "techId", e.target.value)
              }
            />
          </label>

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
            <span>Reduce Owner Name</span>
            <input
              type="text"
              placeholder="Example: Taylor Brooks"
              value={form.reduce.owner.techName}
              onChange={(e) =>
                updateStageOwner("reduce", "techName", e.target.value)
              }
            />
          </label>

          <label className="field">
            <span>Reduce Owner ID</span>
            <input
              type="text"
              placeholder="Example: TECH-031"
              value={form.reduce.owner.techId}
              onChange={(e) =>
                updateStageOwner("reduce", "techId", e.target.value)
              }
            />
          </label>

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
          <label className="field">
            <span>Analyze Owner Name</span>
            <input
              type="text"
              placeholder="Example: Morgan Patel"
              value={form.analyze.owner.techName}
              onChange={(e) =>
                updateStageOwner("analyze", "techName", e.target.value)
              }
            />
          </label>

          <label className="field">
            <span>Analyze Owner ID</span>
            <input
              type="text"
              placeholder="Example: TECH-041"
              value={form.analyze.owner.techId}
              onChange={(e) =>
                updateStageOwner("analyze", "techId", e.target.value)
              }
            />
          </label>

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
              value={form.analyze.observedErrors}
              onChange={(e) =>
                updateNestedField("analyze", "observedErrors", e.target.value)
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
            <span>Challenge Owner Name</span>
            <input
              type="text"
              placeholder="Example: Sam Rivera"
              value={form.challenge.owner.techName}
              onChange={(e) =>
                updateStageOwner("challenge", "techName", e.target.value)
              }
            />
          </label>

          <label className="field">
            <span>Challenge Owner ID</span>
            <input
              type="text"
              placeholder="Example: TECH-051"
              value={form.challenge.owner.techId}
              onChange={(e) =>
                updateStageOwner("challenge", "techId", e.target.value)
              }
            />
          </label>

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
            <span>Eliminate Owner Name</span>
            <input
              type="text"
              placeholder="Example: Casey Wong"
              value={form.eliminate.owner.techName}
              onChange={(e) =>
                updateStageOwner("eliminate", "techName", e.target.value)
              }
            />
          </label>

          <label className="field">
            <span>Eliminate Owner ID</span>
            <input
              type="text"
              placeholder="Example: TECH-061"
              value={form.eliminate.owner.techId}
              onChange={(e) =>
                updateStageOwner("eliminate", "techId", e.target.value)
              }
            />
          </label>

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