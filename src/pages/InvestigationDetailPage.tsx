import jsPDF from "jspdf";
import { Link, useNavigate, useParams } from "react-router-dom";
import TraceSectionCard from "../components/TraceSectionCard";
import {
  deleteInvestigation,
  formatDateTime,
  getDurationMinutes,
  getInvestigationById,
} from "../utils/storage";

export default function InvestigationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const foundInvestigation = id ? getInvestigationById(id) : undefined;

  if (!foundInvestigation) {
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

  const investigation = foundInvestigation;
  const durationMinutes = getDurationMinutes(
    investigation.createdAt,
    investigation.updatedAt
  );

  function emptyText(value: string, fallback: string) {
    return value.trim() ? value : fallback;
  }

  function handleDelete() {
    const confirmed = window.confirm(
      "Delete this investigation? This action cannot be undone."
    );

    if (!confirmed) return;

    deleteInvestigation(investigation.id);
    navigate("/");
  }

  function addWrappedText(
    doc: jsPDF,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight = 7
  ) {
    const lines = doc.splitTextToSize(text.trim() ? text : "Not documented yet.", maxWidth);
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

    function labelValue(label: string, value: string, fallback = "Not documented yet.") {
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
    y = addWrappedText(doc, investigation.title, margin, y, maxWidth);
    y += 2;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    y = addWrappedText(
      doc,
      emptyText(investigation.description, "No summary has been added yet."),
      margin,
      y,
      maxWidth
    );
    y += sectionGap;

    subheading("Overview");
    labelValue("Status", investigation.status.replace("_", " "));
    labelValue("Severity", investigation.severity);
    labelValue("Layer", investigation.layer);
    labelValue("Environment", investigation.environment);
    labelValue("Tags", investigation.tags.join(", "), "No tags added.");
    labelValue("Created", formatDateTime(investigation.createdAt));
    labelValue("Last Updated", formatDateTime(investigation.updatedAt));
    labelValue(
      "Debug Duration",
      durationMinutes !== null ? `${durationMinutes} minutes` : "Unknown"
    );

    subheading("T — Trigger the Issue");
    labelValue(
      "Steps to Reproduce",
      investigation.trigger.stepsToReproduce,
      "Reproduction steps have not been documented yet."
    );
    labelValue(
      "Expected Behavior",
      investigation.trigger.expectedBehavior,
      "Expected behavior has not been recorded yet."
    );
    labelValue(
      "Actual Behavior",
      investigation.trigger.actualBehavior,
      "Actual behavior has not been recorded yet."
    );

    subheading("R — Reduce the Scope");
    labelValue(
      "Suspected Layer",
      investigation.reduce.suspectedLayer,
      "Suspected layer has not been identified yet."
    );
    labelValue(
      "Scope Notes",
      investigation.reduce.scopeNotes,
      "Scope notes have not been recorded yet."
    );

    subheading("A — Analyze the Signals");
    labelValue(
      "Logs",
      investigation.analyze.logs,
      "Logs have not been captured yet."
    );
    labelValue(
      "Telemetry",
      investigation.analyze.telemetry,
      "Telemetry has not been captured yet."
    );
    labelValue(
      "Error Messages",
      investigation.analyze.errors,
      "Error messages have not been recorded yet."
    );

    subheading("C — Challenge Assumptions");
    labelValue(
      "Hypotheses",
      investigation.challenge.hypotheses,
      "No hypotheses have been recorded yet."
    );
    labelValue(
      "Experiments",
      investigation.challenge.experiments,
      "No experiments have been recorded yet."
    );
    labelValue(
      "Findings",
      investigation.challenge.findings,
      "No findings have been documented yet."
    );

    subheading("E — Eliminate the Root Cause");
    labelValue(
      "Root Cause",
      investigation.eliminate.rootCause,
      "Root cause has not been identified yet."
    );
    labelValue(
      "Fix Applied",
      investigation.eliminate.fixApplied,
      "Fix applied has not been recorded yet."
    );
    labelValue(
      "Safeguards",
      investigation.eliminate.safeguards,
      "Safeguards have not been documented yet."
    );
    labelValue(
      "Follow-up",
      investigation.eliminate.followUp,
      "No follow-up actions have been recorded yet."
    );

    const safeTitle = investigation.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    doc.save(`${safeTitle || "trace-report"}.pdf`);
  }

  return (
    <section className="page-stack">
      <div className={`page-hero severity-hero-${investigation.severity}`}>
        <div className="detail-header-row">
          <div>
            <div className="card-topline">
              <span className={`badge status-${investigation.status}`}>
                {investigation.status.replace("_", " ")}
              </span>
              <span className={`badge severity-${investigation.severity}`}>
                {investigation.severity}
              </span>
            </div>

            <h2>{investigation.title}</h2>
            <p>
              {emptyText(
                investigation.description,
                "No summary has been added yet."
              )}
            </p>
          </div>

          <div className="action-row">
            <Link
              className="secondary-btn"
              to={`/investigation/${investigation.id}/edit`}
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
          <span>Layer: {investigation.layer}</span>
          <span>Environment: {investigation.environment}</span>
          <span>Created: {formatDateTime(investigation.createdAt)}</span>
          <span>Updated: {formatDateTime(investigation.updatedAt)}</span>
          <span>
            Duration:{" "}
            {durationMinutes !== null ? `${durationMinutes} min` : "Unknown"}
          </span>
        </div>

        {investigation.tags.length > 0 && (
          <div className="tag-row">
            {investigation.tags.map((tag: string) => (
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
            <h4>Steps to Reproduce</h4>
            <p>
              {emptyText(
                investigation.trigger.stepsToReproduce,
                "Reproduction steps have not been documented yet."
              )}
            </p>
          </div>
          <div>
            <h4>Expected Behavior</h4>
            <p>
              {emptyText(
                investigation.trigger.expectedBehavior,
                "Expected behavior has not been recorded yet."
              )}
            </p>
          </div>
          <div>
            <h4>Actual Behavior</h4>
            <p>
              {emptyText(
                investigation.trigger.actualBehavior,
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
            <h4>Suspected Layer</h4>
            <p>
              {emptyText(
                investigation.reduce.suspectedLayer,
                "Suspected layer has not been identified yet."
              )}
            </p>
          </div>
          <div>
            <h4>Scope Notes</h4>
            <p>
              {emptyText(
                investigation.reduce.scopeNotes,
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
            <h4>Logs</h4>
            <p>
              {emptyText(
                investigation.analyze.logs,
                "Logs have not been captured yet."
              )}
            </p>
          </div>
          <div>
            <h4>Telemetry</h4>
            <p>
              {emptyText(
                investigation.analyze.telemetry,
                "Telemetry has not been captured yet."
              )}
            </p>
          </div>
          <div>
            <h4>Error Messages</h4>
            <p>
              {emptyText(
                investigation.analyze.errors,
                "Error messages have not been recorded yet."
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
            <h4>Hypotheses</h4>
            <p>
              {emptyText(
                investigation.challenge.hypotheses,
                "No hypotheses have been recorded yet."
              )}
            </p>
          </div>
          <div>
            <h4>Experiments</h4>
            <p>
              {emptyText(
                investigation.challenge.experiments,
                "No experiments have been recorded yet."
              )}
            </p>
          </div>
          <div>
            <h4>Findings</h4>
            <p>
              {emptyText(
                investigation.challenge.findings,
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
            <h4>Root Cause</h4>
            <p>
              {emptyText(
                investigation.eliminate.rootCause,
                "Root cause has not been identified yet."
              )}
            </p>
          </div>
          <div>
            <h4>Fix Applied</h4>
            <p>
              {emptyText(
                investigation.eliminate.fixApplied,
                "Fix applied has not been recorded yet."
              )}
            </p>
          </div>
          <div>
            <h4>Safeguards</h4>
            <p>
              {emptyText(
                investigation.eliminate.safeguards,
                "Safeguards have not been documented yet."
              )}
            </p>
          </div>
          <div>
            <h4>Follow-up</h4>
            <p>
              {emptyText(
                investigation.eliminate.followUp,
                "No follow-up actions have been recorded yet."
              )}
            </p>
          </div>
        </div>
      </TraceSectionCard>
    </section>
  );
}