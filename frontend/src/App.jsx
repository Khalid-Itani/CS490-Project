// frontend/src/App.jsx
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

// ✅ New profile pages
import ProfileForm from "./components/ProfileForm";
import ProfileSummary from "./components/ProfileSummary";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard + Profile Sections */}
        <Route path="/dashboard" element={<ProfileDashboard />} />
        <Route path="/education" element={<EducationPage />} />
        <Route path="/certifications" element={<CertificationsPage />} />
        <Route path="/projects" element={<ProjectsPage />} />

        {/* ✅ New Profile Completion pages */}
        <Route path="/profile/edit" element={<ProfileForm />} />
        <Route path="/profile/summary" element={<ProfileSummary />} />

        {/* Optional fallback 404 later */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
