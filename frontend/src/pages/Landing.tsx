import { Link } from "react-router-dom";
import "./Landing.css";

export default function Landing() {
  return (
    <div className="landing">
      {/* Top Nav */}
      <header className="lp-header container">
        <div className="lp-brand">
          <img src="/propel-logo.png" alt="Propel Logo" className="lp-logo" />
          <span className="lp-wordmark" aria-hidden>Propel</span>
        </div>
        <nav className="lp-nav">
          <Link to="/login" className="lp-link">Login</Link>
          <Link to="/register" className="btn btn--primary">Get Started</Link>
        </nav>
      </header>

      {/* Hero */}
      <main>
        <section className="hero container">
          <div className="hero-art" aria-hidden />
          <h1 className="hero-title">Launch into your star role</h1>
          <p className="hero-subtitle">
            Propel gives job seekers the power of an ATS! <br /> 
            Organized applications, polished profiles, and smart insights.
          </p>

          <div className="hero-cta">
            <Link to="/register" className="btn btn--primary">Start for Free</Link>
            <Link to="/login" className="btn btn--secondary">I already have an account</Link>
          </div>

          <p className="hero-meta">
            No credit card required · Secure by design
          </p>
        </section>

        {/* Features (minimal, clean) */}
        <section className="features container">
          <div className="feature">
            <div className="feature-icon" aria-hidden>🚀</div>
            <h3>Fast Onboarding</h3>
            <p>Create a profile in minutes. Import work history and skills without the busywork.</p>
          </div>

          <div className="feature">
            <div className="feature-icon" aria-hidden>🧭</div>
            <h3>Application Tracking</h3>
            <p>Stay on top of deadlines and statuses pipeline views built for candidates.</p>
          </div>

          <div className="feature">
            <div className="feature-icon" aria-hidden>✨</div>
            <h3>Polished Profiles</h3>
            <p>Upload a photo, highlight projects, and showcase skills with clarity.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="lp-footer container">
        <span>© {new Date().getFullYear()} Propel</span>
        <nav className="lp-footer-links">
          <Link to="/terms" className="lp-link">Terms</Link>
          <Link to="/privacy" className="lp-link">Privacy</Link>
        </nav>
      </footer>
    </div>
  );
}
