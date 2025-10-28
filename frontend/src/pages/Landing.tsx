import { Link } from "react-router-dom";
import "./Landing.css";

export default function Landing() {
  return (
    <div className="landing">
      <header>
        <img src="/propel-logo.png" alt="Propel Logo" className="logo" />
        <nav>
          <Link to="/login">Login</Link>
          <Link to="/register" className="primary-btn">Get Started</Link>
        </nav>
      </header>

      <main>
        <h1>Launch into your star role</h1>
        <p>Propel gives job seekers the power of an ATS, right at your fingertips!</p>
        <Link to="/register" className="cta-btn">Start for Free</Link>
      </main>
    </div>
  );
}
