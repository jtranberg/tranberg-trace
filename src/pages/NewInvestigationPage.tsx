import { useNavigate } from "react-router-dom";
import InvestigationForm from "../components/InvestigationForm";
import {
  createEmptyInvestigation,
  createInvestigation,
} from "../utils/storage";

export default function NewInvestigationPage() {
  const navigate = useNavigate();

  const initialValue = createEmptyInvestigation();

  return (
    <section className="page-stack">
      <div className="page-hero">
        <h2>Start New TRACE Investigation</h2>
        <p>
          Capture the bug, isolate the layer, analyze the evidence, test the
          theory, and eliminate the root cause.
        </p>
      </div>

      <InvestigationForm
        initialValue={initialValue}
        submitLabel="Save Investigation"
        onSubmit={async (value) => {
          const created = await createInvestigation(value);
          navigate(`/investigation/${created.id}`);
        }}
      />
    </section>
  );
}