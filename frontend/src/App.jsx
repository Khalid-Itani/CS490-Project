import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfileDashboard from "./pages/ProfileDashboard";
import EducationPage from "./pages/EducationPage";
import CertificationsPage from "./pages/CertificationsPage";
import ProjectsPage from "./pages/ProjectsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
  <Route path="/dashboard" element={<ProfileDashboard />} />
  <Route path="/education" element={<EducationPage />} />
  <Route path="/certifications" element={<CertificationsPage />} />
  <Route path="/projects" element={<ProjectsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
