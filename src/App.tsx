import { Routes, Route, Link } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import NewInvestigationPage from "./pages/NewInvestigationPage";
import InvestigationDetailPage from "./pages/InvestigationDetailPage";
import EditInvestigationPage from "./pages/EditInvestigationPage";

export default function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>Tranberg TRACE</h1>
          <p>Debug with structure instead of guesswork.</p>
        </div>

        <nav className="topnav">
          <Link to="/">Dashboard</Link>
          <Link to="/new">New Investigation</Link>
        </nav>
      </header>

      <main className="page-shell">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/new" element={<NewInvestigationPage />} />
          <Route path="/investigation/:id" element={<InvestigationDetailPage />} />
          <Route path="/investigation/:id/edit" element={<EditInvestigationPage />} />
        </Routes>
      </main>
    </div>
  );
}