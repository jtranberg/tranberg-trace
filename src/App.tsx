import { Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardPage from "./pages/DashboardPage";
import NewInvestigationPage from "./pages/NewInvestigationPage";
import InvestigationDetailPage from "./pages/InvestigationDetailPage";
import EditInvestigationPage from "./pages/EditInvestigationPage";


export default function App() {
 const [theme, setTheme] = useState<"dark" | "light">(() => {
  const saved = localStorage.getItem("trace-theme");
  return saved === "light" ? "light" : "dark";
});




  useEffect(() => {
  document.body.classList.remove("theme-dark", "theme-light");

  document.body.classList.add(`theme-${theme}`);

  localStorage.setItem("trace-theme", theme);
}, [theme]);

function toggleTheme() {
  setTheme((prev) => (prev === "dark" ? "light" : "dark"));
}
  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="theme-toggle" onClick={toggleTheme}>
  {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
</button>
        <div>
          <h1>TRANBERG T.R.A.C.E.</h1>
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