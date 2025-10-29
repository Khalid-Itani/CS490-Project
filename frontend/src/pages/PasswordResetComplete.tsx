import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import AuthCard from "../components/AuthCard";

export default function PasswordResetComplete() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setSubmitting(false);
      return;
    }
    try {
      await api.post(`/auth/reset-password`, { token, password: form.password });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid or expired reset link");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthCard title="Set a new password">
        <form onSubmit={submit}>
          <input
            type="password"
            placeholder="New password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            required
          />
          <button type="submit" disabled={submitting}>
            {submitting ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </AuthCard>
    </div>
  );
}
