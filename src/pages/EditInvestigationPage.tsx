import { Link, useNavigate, useParams } from "react-router-dom";
import InvestigationForm from "../components/InvestigationForm";
import {
  getInvestigationById,
  updateInvestigation,
} from "../utils/storage";

export default function EditInvestigationPage() {
  const { id } = useParams();
  const navigate = useNavigate();

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

  const investigation = getInvestigationById(id);

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
        onSubmit={(value) => {
          updateInvestigation(value);
          navigate(`/investigation/${value.id}`);
        }}
      />
    </section>
  );
}