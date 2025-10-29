// frontend/src/components/DeleteAccountCard.jsx
import { useState } from "react";

export default function DeleteAccountCard() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleDelete() {
    setError("");
    const ok = window.confirm(
      "Deleting your account starts a 30-day grace period. Continue?"
    );
    if (!ok) return;
    if (!password) {
      setError("Password is required.");
      return;
    }
    alert("Would call backend here, then logout and redirect to /login.");
  }

  return (
    <div style={{ maxWidth: 560, margin: "80px auto", padding: 24, border: "1px solid #444", borderRadius: 12 }}>
      <h1>Delete Account</h1>
      <p style={{ color: "#c33" }}>This becomes permanent after a 30-day grace period.</p>

      <label>Password (required)</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
        style={{ width: "100%", padding: 10, marginTop: 6, marginBottom: 10 }}
      />

      {error && <div style={{ color: "#c33", marginBottom: 10 }}>{error}</div>}

      <button
        onClick={handleDelete}
        style={{ background:"#c62828", color:"#fff", padding:"10px 16px", border:"none", borderRadius:8, cursor:"pointer" }}
      >
        Delete my account
      </button>
    </div>
  );
}
