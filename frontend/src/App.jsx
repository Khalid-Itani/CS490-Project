// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Landing from "./pages/Landing";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Login from "./pages/Login";
import Register from "./pages/Register";

import ProfileDashboard from "./pages/ProfileDashboard";
import EducationPage from "./pages/EducationPage";
import CertificationsPage from "./pages/CertificationsPage";
import ProjectsPage from "./pages/ProjectsPage";

import TypographyPreview from "./pages/TypographyPreview";
import IconDemo from "./components/ui/IconDemo";

export default function App() {
  return (
    <BrowserRouter>
      <header className="border-b border-gray-800">
        <nav className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-4 text-sm">
          <Link to="/">Home</Link>
          <Link to="/typography">Typography</Link>
          <Link to="/icons">Icons</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/education">Education</Link>
          <Link to="/certifications">Certifications</Link>
          <Link to="/projects">Projects</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Landing />} />

        {/* Demo pages */}
        <Route path="/typography" element={<TypographyPreview />} />
        <Route path="/icons" element={<IconDemo />} />

        {/* Legal */}
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* App pages */}
        <Route path="/dashboard" element={<ProfileDashboard />} />
        <Route path="/education" element={<EducationPage />} />
        <Route path="/certifications" element={<CertificationsPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
