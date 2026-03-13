import { Link } from "react-router-dom";
import { loadInvestigations } from "../utils/storage";

export default function DashboardPage() {
  const investigations = loadInvestigations();

  return (
    <section className="page-stack">
      <div className="page-hero hero-row">
        <div>
          <h2>Investigations Dashboard</h2>
          <p>
            Every bug gets a trail. Every trail gets a structure. Hunt with
            TRACE.
          </p>
        </div>

        <Link className="primary-btn" to="/new">
          New Investigation
        </Link>
      </div>

      {investigations.length === 0 ? (
        <section className="empty-state">
          <h3>No investigations yet</h3>
          <p>
            Start your first TRACE case and begin building your debugging
            library.
          </p>
          <Link className="secondary-btn" to="/new">
            Create First Investigation
          </Link>
        </section>
      ) : (
        <div className="investigation-grid">
          {investigations.map((item) => (
            <Link
              key={item.id}
              to={`/investigation/${item.id}`}
              className="investigation-card"
            >
              <div className="card-topline">
                <span className={`badge status-${item.status}`}>
                  {item.status.replace("_", " ")}
                </span>
                <span className={`badge severity-${item.severity}`}>
                  {item.severity}
                </span>
              </div>

              <h3>{item.title}</h3>
              <p>{item.description || "No description provided yet."}</p>

              <div className="meta-row">
                <span>{item.layer}</span>
                <span>{item.environment}</span>
              </div>

              <div className="tag-row">
                {item.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="tag-pill">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}