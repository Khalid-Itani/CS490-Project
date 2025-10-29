import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    api.post("/auth/logout").finally(() => {
      localStorage.clear();
      sessionStorage.clear();
      navigate("/");
    });
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <h2>Logging out...</h2>
    </div>
  );
}
