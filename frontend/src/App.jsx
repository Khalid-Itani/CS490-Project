import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import TypographyPreview from "./pages/TypographyPreview";
import IconDemo from "./components/ui/IconDemo";
import Landing from "./pages/Landing";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfileDashboard from "./pages/ProfileDashboard";
import EducationPage from "./pages/EducationPage";
import CertificationsPage from "./pages/CertificationsPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProfileForm from "./components/ProfileForm";
import ProfileSummary from "./components/ProfileSummary";


function App() {
  return (
    <Router>
      <header className="border-b border-gray-800">
        <nav className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-4 text-sm">
          <Link to="/">Home</Link>
          <Link to="/typography">Typography</Link>
          <Link to="/icons">Icons</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/education">Education</Link>
          <Link to="/certifications">Certifications</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/profile-form">Profile Form</Link>
          <Link to="/summary">Profile Summary</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
      </header>
      <div className="App">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/typography" element={<TypographyPreview />} />
          <Route path="/icons" element={<IconDemo />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProfileDashboard />} />
          <Route path="/education" element={<EducationPage />} />
          <Route path="/certifications" element={<CertificationsPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/profile-form" element={<ProfileForm />} />
          <Route path="/summary" element={<ProfileSummary />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
