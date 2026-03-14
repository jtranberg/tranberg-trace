import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { TraceInvestigation } from "../types/trace";
import {
  getDurationLabel,
  loadInvestigations,
  loadProjects,
  loadTenants,
  type ProjectOption,
  type TenantOption,
} from "../utils/storage";

function emptyText(value: string, fallback: string) {
  return value.trim() ? value : fallback;
}

export default function DashboardPage() {
  const [investigations, setInvestigations] = useState<TraceInvestigation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        const [investigationData, tenantData] = await Promise.all([
          loadInvestigations(),
          loadTenants(),
        ]);

        if (isMounted) {
          setInvestigations(investigationData);
          setTenants(tenantData);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchProjects() {
      if (!selectedTenantId) {
        setProjects([]);
        setSelectedProjectId("");
        return;
      }

      try {
        const data = await loadProjects(selectedTenantId);
        if (isMounted) {
          setProjects(data);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        if (isMounted) {
          setProjects([]);
        }
      }
    }

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, [selectedTenantId]);

  const filteredInvestigations = useMemo(() => {
    return investigations.filter((item) => {
      const matchesTenant = selectedTenantId
        ? item.tenantId === selectedTenantId
        : true;

      const matchesProject = selectedProjectId
        ? item.projectId === selectedProjectId
        : true;

      return matchesTenant && matchesProject;
    });
  }, [investigations, selectedTenantId, selectedProjectId]);

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

      <div className="trace-card">
        <div className="trace-card-header">
          <h3>Workspace Filters</h3>
          <p>Focus investigations by company and project.</p>
        </div>

        <div className="form-grid">
          <label className="field">
            <span>Company</span>
            <select
              value={selectedTenantId}
              onChange={(e) => {
                setSelectedTenantId(e.target.value);
                setSelectedProjectId("");
              }}
            >
              <option value="">All companies</option>
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
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              disabled={!selectedTenantId}
            >
              <option value="">
                {!selectedTenantId ? "Select a company first" : "All projects"}
              </option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name} ({project.key})
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {isLoading ? (
        <section className="empty-state">
          <h3>Loading investigations...</h3>
          <p>Pulling your latest TRACE cases from the database.</p>
        </section>
      ) : filteredInvestigations.length === 0 ? (
        <section className="empty-state">
          <h3>No investigations found</h3>
          <p>
            Try adjusting the workspace filters or create a new TRACE case.
          </p>
          <Link className="secondary-btn" to="/new">
            Create Investigation
          </Link>
        </section>
      ) : (
        <div className="investigation-grid">
          {filteredInvestigations.map((item) => (
            <Link
              key={item.id}
              to={`/investigation/${item.id}`}
              className={`investigation-card severity-card-${item.severity}`}
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
              <p>
                {emptyText(
                  item.description,
                  "No description has been added yet."
                )}
              </p>

              <div className="meta-row">
                <span>{item.tenantName || "No company"}</span>
                <span>{item.projectName || "No project"}</span>
              </div>

              <div className="meta-row">
                <span>{item.layer}</span>
                <span>{item.environment}</span>
                <span>⏱ {getDurationLabel(item.createdAt, item.updatedAt)}</span>
              </div>

              {item.tags.length > 0 && (
                <div className="tag-row">
                  {item.tags.slice(0, 4).map((tag: string) => (
                    <span key={tag} className="tag-pill">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}