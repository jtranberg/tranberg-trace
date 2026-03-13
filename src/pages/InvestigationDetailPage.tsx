import { Link, useNavigate, useParams } from "react-router-dom";
import TraceSectionCard from "../components/TraceSectionCard";
import {
  deleteInvestigation,
  getInvestigationById,
} from "../utils/storage";

export default function InvestigationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const investigation = id ? getInvestigationById(id) : undefined;

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

  function handleDelete() {
    const confirmed = window.confirm(
      "Delete this investigation? This action cannot be undone."
    );

    if (!confirmed) return;

    deleteInvestigation(investigation.id);
    navigate("/");
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
            <button className="danger-btn" type="button" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>

        <div className="meta-row">
          <span>Layer: {investigation.layer}</span>
          <span>Environment: {investigation.environment}</span>
        </div>

        {investigation.tags.length > 0 && (
          <div className="tag-row">
            {investigation.tags.map((tag:string) => (
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