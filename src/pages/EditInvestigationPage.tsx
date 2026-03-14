import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import InvestigationForm from "../components/InvestigationForm";
import type { TraceInvestigation } from "../types/trace";
import {
  getInvestigationById,
  updateInvestigation,
} from "../utils/storage";

export default function EditInvestigationPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [investigation, setInvestigation] = useState<TraceInvestigation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadInvestigation() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const result = await getInvestigationById(id);

        if (isMounted) {
          setInvestigation(result ?? null);
        }
      } catch (error) {
        console.error("Failed to load investigation:", error);
        if (isMounted) {
          setInvestigation(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadInvestigation();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (!id) {
    return (
      <section className="empty-state">
        <h2>Missing investigation id</h2>
        <Link className="secondary-btn" to="/">
          Back to Dashboard
        </Link>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="empty-state">
        <h2>Loading investigation...</h2>
        <p>Pulling the case file now.</p>
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

  return (
    <section className="page-stack">
      <div className="page-hero">
        <h2>Edit Investigation</h2>
        <p>Refine the case file as you trace the issue deeper.</p>
      </div>

      <InvestigationForm
        initialValue={investigation}
        submitLabel="Update Investigation"
        onSubmit={async (value) => {
          await updateInvestigation(value);
          navigate(`/investigation/${value.id}`);
        }}
      />
    </section>
  );
}