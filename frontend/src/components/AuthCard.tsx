import React from "react";
import "./AuthCard.css";

interface Props {
  children: React.ReactNode;
  title: string;
}

export default function AuthCard({ children, title }: Props) {
  return (
    <div className="auth-card-container">
      <div className="auth-card">
        <img src="/propel-logo.png" alt="Propel Logo" className="logo" />
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}
