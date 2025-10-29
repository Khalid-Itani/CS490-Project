import { Routes, Route, Link } from "react-router-dom";
import TypographyPreview from "./pages/TypographyPreview";
import IconDemo from "./components/ui/IconDemo";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <div>
      <header className="border-b border-gray-800">
        <nav className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-4 text-sm">
          <Link to="/">Home</Link>
          <Link to="/typography">Typography</Link>
          <Link to="/icons">Icons</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<div className="p-6">Home</div>} />
        <Route path="/typography" element={<TypographyPreview />} />
        <Route path="/icons" element={<IconDemo />} />
        <Route path="/" element={<Landing />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<h1>Dashboard</h1>} />
      </Routes>
    </div>

}
