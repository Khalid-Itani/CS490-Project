import { useState } from "react";
import { api } from "../lib/api";
import AuthCard from "../components/AuthCard";

export default function PasswordResetRequest() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      await api.post("/auth/request-password-reset", { email });
      setMessage("If your email exists, a reset link has been sent.");
    } catch {
      setMessage("If your email exists, a reset link has been sent.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthCard title="Reset your password">
        <form onSubmit={submit}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={submitting}>
            {submitting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        {message && <p>{message}</p>}
      </AuthCard>
    </div>
  );
}
