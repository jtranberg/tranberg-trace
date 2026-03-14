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
    const lines = doc.splitTextToSize(text || "—", maxWidth);
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

    function labelValue(label: string, value: string) {
      ensureSpace(18);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(label, margin, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      y = addWrappedText(doc, value || "—", margin, y, maxWidth);
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
      investigation.description || "No summary was added.",
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
    labelValue("Tags", investigation.tags.join(", ") || "—");
    labelValue("Created", formatDateTime(investigation.createdAt));
    labelValue("Last Updated", formatDateTime(investigation.updatedAt));
    labelValue(
      "Debug Duration",
      durationMinutes !== null ? `${durationMinutes} minutes` : "Unknown"
    );

    subheading("T — Trigger the Issue");
    labelValue("Steps to Reproduce", investigation.trigger.stepsToReproduce);
    labelValue("Expected Behavior", investigation.trigger.expectedBehavior);
    labelValue("Actual Behavior", investigation.trigger.actualBehavior);

    subheading("R — Reduce the Scope");
    labelValue("Suspected Layer", investigation.reduce.suspectedLayer);
    labelValue("Scope Notes", investigation.reduce.scopeNotes);

    subheading("A — Analyze the Signals");
    labelValue("Logs", investigation.analyze.logs);
    labelValue("Telemetry", investigation.analyze.telemetry);
    labelValue("Error Messages", investigation.analyze.errors);

    subheading("C — Challenge Assumptions");
    labelValue("Hypotheses", investigation.challenge.hypotheses);
    labelValue("Experiments", investigation.challenge.experiments);
    labelValue("Findings", investigation.challenge.findings);

    subheading("E — Eliminate the Root Cause");
    labelValue("Root Cause", investigation.eliminate.rootCause);
    labelValue("Fix Applied", investigation.eliminate.fixApplied);
    labelValue("Safeguards", investigation.eliminate.safeguards);
    labelValue("Follow-up", investigation.eliminate.followUp);

    const safeTitle = investigation.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    doc.save(`${safeTitle || "trace-report"}.pdf`);
  }

  return (
    <section className="page-stack">
      <div className="page-hero">
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
            <p>{investigation.description || "No summary was added."}</p>
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
            <p>{investigation.trigger.stepsToReproduce || "—"}</p>
          </div>
          <div>
            <h4>Expected Behavior</h4>
            <p>{investigation.trigger.expectedBehavior || "—"}</p>
          </div>
          <div>
            <h4>Actual Behavior</h4>
            <p>{investigation.trigger.actualBehavior || "—"}</p>
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
            <p>{investigation.reduce.suspectedLayer || "—"}</p>
          </div>
          <div>
            <h4>Scope Notes</h4>
            <p>{investigation.reduce.scopeNotes || "—"}</p>
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
            <p>{investigation.analyze.logs || "—"}</p>
          </div>
          <div>
            <h4>Telemetry</h4>
            <p>{investigation.analyze.telemetry || "—"}</p>
          </div>
          <div>
            <h4>Error Messages</h4>
            <p>{investigation.analyze.errors || "—"}</p>
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
            <p>{investigation.challenge.hypotheses || "—"}</p>
          </div>
          <div>
            <h4>Experiments</h4>
            <p>{investigation.challenge.experiments || "—"}</p>
          </div>
          <div>
            <h4>Findings</h4>
            <p>{investigation.challenge.findings || "—"}</p>
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
            <p>{investigation.eliminate.rootCause || "—"}</p>
          </div>
          <div>
            <h4>Fix Applied</h4>
            <p>{investigation.eliminate.fixApplied || "—"}</p>
          </div>
          <div>
            <h4>Safeguards</h4>
            <p>{investigation.eliminate.safeguards || "—"}</p>
          </div>
          <div>
            <h4>Follow-up</h4>
            <p>{investigation.eliminate.followUp || "—"}</p>
          </div>
        </div>
      </TraceSectionCard>
    </section>
  );
}