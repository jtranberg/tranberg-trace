import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { Link, useNavigate, useParams } from "react-router-dom";
import TraceSectionCard from "../components/TraceSectionCard";
import type { TraceInvestigation } from "../types/trace";
import {
  deleteInvestigation,
  formatDateTime,
  getDurationLabel,
  getInvestigationById,
} from "../utils/storage";

export default function InvestigationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [investigation, setInvestigation] = useState<TraceInvestigation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchInvestigation() {
      if (!id) {
        if (isMounted) {
          setInvestigation(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const data = await getInvestigationById(id);
        if (isMounted) {
          setInvestigation(data ?? null);
        }
      } catch (error) {
        console.error("Failed to fetch investigation:", error);
        if (isMounted) {
          setInvestigation(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchInvestigation();

    return () => {
      isMounted = false;
    };
  }, [id]);

  function emptyText(value: string, fallback: string) {
    return value.trim() ? value : fallback;
  }

  function techLabel(techId: string, techName: string, fallback: string): string {
    const name = techName.trim();
    const idValue = techId.trim();

    if (!name && !idValue) return fallback;
    if (name && idValue) return `${name} (${idValue})`;
    return name || idValue;
  }

  if (isLoading) {
    return (
      <section className="empty-state">
        <h2>Loading investigation...</h2>
        <p>Pulling the latest TRACE case from the database.</p>
      </section>
    );
  }

  if (!investigation) {
    return (
      <section className="empty-state">
        <h2>Investigation not found</h2>
        <p>The case file may have been removed or never saved.</p>
        <Link className="secondary-btn" to="/">
          Back to Dashboard
        </Link>
      </section>
    );
  }

  const current = investigation;

  const durationLabel = getDurationLabel(
    current.createdAt,
    current.updatedAt
  );

  async function handleDelete() {
    const confirmed = window.confirm(
      "Delete this investigation? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      await deleteInvestigation(current.id);
      navigate("/");
    } catch (error) {
      console.error("Failed to delete investigation:", error);
      alert("Failed to delete investigation.");
    }
  }

  function addWrappedText(
    doc: jsPDF,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight = 7
  ) {
    const safeText = text.trim() ? text : "Not documented yet.";
    const lines = doc.splitTextToSize(safeText, maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * lineHeight;
  }

  function exportPdfReport() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const maxWidth = pageWidth - margin * 2;
    let y = 18;

    const sectionGap = 10;
    const blockGap = 7;

    function ensureSpace(extra = 20) {
      const pageHeight = doc.internal.pageSize.getHeight();
      if (y + extra > pageHeight - 14) {
        doc.addPage();
        y = 18;
      }
    }

    function heading(text: string) {
      ensureSpace(14);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(text, margin, y);
      y += 10;
    }

    function subheading(text: string) {
      ensureSpace(12);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(text, margin, y);
      y += 8;
    }

    function labelValue(
      label: string,
      value: string,
      fallback = "Not documented yet."
    ) {
      ensureSpace(18);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(label, margin, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      y = addWrappedText(doc, value.trim() ? value : fallback, margin, y, maxWidth);
      y += blockGap;
    }

    heading("Tranberg TRACE Report");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    y = addWrappedText(doc, current.title, margin, y, maxWidth);
    y += 2;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    y = addWrappedText(
      doc,
      emptyText(current.description, "No summary has been added yet."),
      margin,
      y,
      maxWidth
    );
    y += sectionGap;

    subheading("Overview");
    labelValue("Status", current.status.replace("_", " "));
    labelValue("Severity", current.severity);
    labelValue("Layer", current.layer);
    labelValue("Environment", current.environment);
    labelValue("Tags", current.tags.join(", "), "No tags added.");
    labelValue(
      "Reported By",
      techLabel(
        current.reportedBy.techId,
        current.reportedBy.techName,
        "Not assigned"
      )
    );
    labelValue(
      "Opened By",
      techLabel(
        current.openedBy.techId,
        current.openedBy.techName,
        "Not assigned"
      )
    );
    labelValue("Created", formatDateTime(current.createdAt));
    labelValue("Last Updated", formatDateTime(current.updatedAt));
    labelValue("Resolution Time", durationLabel);

    subheading("T — Trigger the Issue");
    labelValue(
      "Stage Owner",
      techLabel(
        current.trigger.owner.techId,
        current.trigger.owner.techName,
        "No trigger owner assigned yet."
      )
    );
    labelValue(
      "Steps to Reproduce",
      current.trigger.stepsToReproduce,
      "Reproduction steps have not been documented yet."
    );
    labelValue(
      "Expected Behavior",
      current.trigger.expectedBehavior,
      "Expected behavior has not been recorded yet."
    );
    labelValue(
      "Actual Behavior",
      current.trigger.actualBehavior,
      "Actual behavior has not been recorded yet."
    );

    subheading("R — Reduce the Scope");
    labelValue(
      "Stage Owner",
      techLabel(
        current.reduce.owner.techId,
        current.reduce.owner.techName,
        "No reduce owner assigned yet."
      )
    );
    labelValue(
      "Suspected Layer",
      current.reduce.suspectedLayer,
      "Suspected layer has not been identified yet."
    );
    labelValue(
      "Scope Notes",
      current.reduce.scopeNotes,
      "Scope notes have not been recorded yet."
    );

    subheading("A — Analyze the Signals");
    labelValue(
      "Stage Owner",
      techLabel(
        current.analyze.owner.techId,
        current.analyze.owner.techName,
        "No analyze owner assigned yet."
      )
    );
    labelValue(
      "Logs",
      current.analyze.logs,
      "Logs have not been captured yet."
    );
    labelValue(
      "Telemetry",
      current.analyze.telemetry,
      "Telemetry has not been captured yet."
    );
    labelValue(
      "Observed Errors",
      current.analyze.observedErrors,
      "Observed errors have not been recorded yet."
    );

    subheading("C — Challenge Assumptions");
    labelValue(
      "Stage Owner",
      techLabel(
        current.challenge.owner.techId,
        current.challenge.owner.techName,
        "No challenge owner assigned yet."
      )
    );
    labelValue(
      "Hypotheses",
      current.challenge.hypotheses,
      "No hypotheses have been recorded yet."
    );
    labelValue(
      "Experiments",
      current.challenge.experiments,
      "No experiments have been recorded yet."
    );
    labelValue(
      "Findings",
      current.challenge.findings,
      "No findings have been documented yet."
    );

    subheading("E — Eliminate the Root Cause");
    labelValue(
      "Stage Owner",
      techLabel(
        current.eliminate.owner.techId,
        current.eliminate.owner.techName,
        "No eliminate owner assigned yet."
      )
    );
    labelValue(
      "Root Cause",
      current.eliminate.rootCause,
      "Root cause has not been identified yet."
    );
    labelValue(
      "Fix Applied",
      current.eliminate.fixApplied,
      "Fix applied has not been recorded yet."
    );
    labelValue(
      "Safeguards",
      current.eliminate.safeguards,
      "Safeguards have not been documented yet."
    );
    labelValue(
      "Follow-up",
      current.eliminate.followUp,
      "No follow-up actions have been recorded yet."
    );

    const safeTitle = current.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    doc.save(`${safeTitle || "trace-report"}.pdf`);
  }

  return (
    <section className="page-stack">
      <div className={`page-hero severity-hero-${current.severity}`}>
        <div className="detail-header-row">
          <div>
            <div className="card-topline">
              <span className={`badge status-${current.status}`}>
                {current.status.replace("_", " ")}
              </span>
              <span className={`badge severity-${current.severity}`}>
                {current.severity}
              </span>
            </div>

            <h2>{current.title}</h2>
            <p>
              {emptyText(
                current.description,
                "No summary has been added yet."
              )}
            </p>
          </div>

          <div className="action-row">
            <Link
              className="secondary-btn"
              to={`/investigation/${current.id}/edit`}
            >
              Edit
            </Link>
            <button
              className="secondary-btn"
              type="button"
              onClick={exportPdfReport}
            >
              Export PDF
            </button>
            <button className="danger-btn" type="button" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>

        <div className="meta-row">
          
          <span>Layer: {current.layer}</span>
          <span>Environment: {current.environment}</span>
          <span>
            Reported By:{" "}
            {techLabel(
              current.reportedBy.techId,
              current.reportedBy.techName,
              "Not assigned"
            )}
          </span>
          <span>
            Opened By:{" "}
            {techLabel(
              current.openedBy.techId,
              current.openedBy.techName,
              "Not assigned"
            )}
          </span>
          <span>Created: {formatDateTime(current.createdAt)}</span>
          <span>Updated: {formatDateTime(current.updatedAt)}</span>
          <span>Resolution Time: {durationLabel}</span>
        </div>

        {current.tags.length > 0 && (
          <div className="tag-row">
            {current.tags.map((tag: string) => (
              <span key={tag} className="tag-pill">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <TraceSectionCard
        title="T — Trigger the Issue"
        subtitle="How the bug was reproduced."
      >
        <div className="detail-grid">
          <div>
            <h4>Stage Owner</h4>
            <p>
              {techLabel(
                current.trigger.owner.techId,
                current.trigger.owner.techName,
                "No trigger owner assigned yet."
              )}
            </p>
          </div>
          <div>
            <h4>Steps to Reproduce</h4>
            <p>
              {emptyText(
                current.trigger.stepsToReproduce,
                "Reproduction steps have not been documented yet."
              )}
            </p>
          </div>
          <div>
            <h4>Expected Behavior</h4>
            <p>
              {emptyText(
                current.trigger.expectedBehavior,
                "Expected behavior has not been recorded yet."
              )}
            </p>
          </div>
          <div>
            <h4>Actual Behavior</h4>
            <p>
              {emptyText(
                current.trigger.actualBehavior,
                "Actual behavior has not been recorded yet."
              )}
            </p>
          </div>
        </div>
      </TraceSectionCard>

      <TraceSectionCard
        title="R — Reduce the Scope"
        subtitle="Where the issue was narrowed down."
      >
        <div className="detail-grid">
          <div>
            <h4>Stage Owner</h4>
            <p>
              {techLabel(
                current.reduce.owner.techId,
                current.reduce.owner.techName,
                "No reduce owner assigned yet."
              )}
            </p>
          </div>
          <div>
            <h4>Suspected Layer</h4>
            <p>
              {emptyText(
                current.reduce.suspectedLayer,
                "Suspected layer has not been identified yet."
              )}
            </p>
          </div>
          <div>
            <h4>Scope Notes</h4>
            <p>
              {emptyText(
                current.reduce.scopeNotes,
                "Scope notes have not been recorded yet."
              )}
            </p>
          </div>
        </div>
      </TraceSectionCard>

      <TraceSectionCard
        title="A — Analyze the Signals"
        subtitle="Logs, telemetry, and error evidence."
      >
        <div className="detail-grid">
          <div>
            <h4>Stage Owner</h4>
            <p>
              {techLabel(
                current.analyze.owner.techId,
                current.analyze.owner.techName,
                "No analyze owner assigned yet."
              )}
            </p>
          </div>
          <div>
            <h4>Logs</h4>
            <p>
              {emptyText(
                current.analyze.logs,
                "Logs have not been captured yet."
              )}
            </p>
          </div>
          <div>
            <h4>Telemetry</h4>
            <p>
              {emptyText(
                current.analyze.telemetry,
                "Telemetry has not been captured yet."
              )}
            </p>
          </div>
          <div>
            <h4>Observed Errors</h4>
            <p>
              {emptyText(
                current.analyze.observedErrors,
                "Observed errors have not been recorded yet."
              )}
            </p>
          </div>
        </div>
      </TraceSectionCard>

      <TraceSectionCard
        title="C — Challenge Assumptions"
        subtitle="Hypotheses and experiments."
      >
        <div className="detail-grid">
          <div>
            <h4>Stage Owner</h4>
            <p>
              {techLabel(
                current.challenge.owner.techId,
                current.challenge.owner.techName,
                "No challenge owner assigned yet."
              )}
            </p>
          </div>
          <div>
            <h4>Hypotheses</h4>
            <p>
              {emptyText(
                current.challenge.hypotheses,
                "No hypotheses have been recorded yet."
              )}
            </p>
          </div>
          <div>
            <h4>Experiments</h4>
            <p>
              {emptyText(
                current.challenge.experiments,
                "No experiments have been recorded yet."
              )}
            </p>
          </div>
          <div>
            <h4>Findings</h4>
            <p>
              {emptyText(
                current.challenge.findings,
                "No findings have been documented yet."
              )}
            </p>
          </div>
        </div>
      </TraceSectionCard>

      <TraceSectionCard
        title="E — Eliminate the Root Cause"
        subtitle="The fix and the prevention layer."
      >
        <div className="detail-grid">
          <div>
            <h4>Stage Owner</h4>
            <p>
              {techLabel(
                current.eliminate.owner.techId,
                current.eliminate.owner.techName,
                "No eliminate owner assigned yet."
              )}
            </p>
          </div>
          <div>
            <h4>Root Cause</h4>
            <p>
              {emptyText(
                current.eliminate.rootCause,
                "Root cause has not been identified yet."
              )}
            </p>
          </div>
          <div>
            <h4>Fix Applied</h4>
            <p>
              {emptyText(
                current.eliminate.fixApplied,
                "Fix applied has not been recorded yet."
              )}
            </p>
          </div>
          <div>
            <h4>Safeguards</h4>
            <p>
              {emptyText(
                current.eliminate.safeguards,
                "Safeguards have not been documented yet."
              )}
            </p>
          </div>
          <div>
            <h4>Follow-up</h4>
            <p>
              {emptyText(
                current.eliminate.followUp,
                "No follow-up actions have been recorded yet."
              )}
            </p>
          </div>
        </div>
      </TraceSectionCard>
    </section>
  );
}