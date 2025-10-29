import React from "react";
import "./styles/colors.css";
import ColorGuide from "./ColorGuide";
import ContrastSamples from "./ContrastSamples";

function App() {
  const [theme, setTheme] = React.useState(
    localStorage.getItem("theme") || "light"
  );

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === "dark" ? "light" : "dark"));

  return (
    <div style={{ minHeight: "100vh", padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={{ color: "var(--primary-color)", margin: 0 }}>
          ATS for Job Seekers
        </h1>
        <button className="btn secondary" onClick={toggleTheme}>
          {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
        </button>
      </div>

      <p style={{ color: "var(--accent-color)", marginTop: 12 }}>
        Welcome to your candidate dashboard!
      </p>

      <a href="/" style={{ display: "inline-block", marginRight: 12 }}>
        Learn more
      </a>
      <button className="btn">Primary</button>
      <button className="btn secondary" style={{ marginLeft: 8 }}>
        Secondary
      </button>

      <ColorGuide />
      <ContrastSamples />
    </div>
  );
}

export default App;
