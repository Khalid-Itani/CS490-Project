import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function DeleteAccount() {
  const navigate = useNavigate();

  useEffect(() => {
    const confirmed = window.confirm("Are you sure you want to delete your account? This action is permanent.");
    if (!confirmed) {
      navigate("/profile/summary");
      return;
    }
    // Prompt for password (could be improved with a form)
    const password = window.prompt("Please enter your password to confirm:");
    if (!password) {
      navigate("/profile/summary");
      return;
    }
    api.post("/auth/delete-account", { password })
      .then(() => {
        localStorage.clear();
        sessionStorage.clear();
        alert("Account deleted. You have been logged out.");
        navigate("/");
      })
      .catch((err) => {
        alert(err?.response?.data?.message || "Failed to delete account.");
        navigate("/profile/summary");
      });
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <h2>Deleting account...</h2>
    </div>
  );
}
