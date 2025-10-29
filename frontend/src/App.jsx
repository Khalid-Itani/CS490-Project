import { Routes, Route, Link } from "react-router-dom";
import TypographyPreview from "./pages/TypographyPreview";
import IconDemo from "./components/ui/IconDemo";

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
      </Routes>
    </div>
  );
}
