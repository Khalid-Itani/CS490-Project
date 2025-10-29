import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

type EducationItem = {
  id: number;
  degree: string;
  institution: string;
  startDate?: string | null;
  endDate?: string | null;
};

type ProjectItem = { id: number; name: string; status?: string };

type Overview = {
  summary?: { educationCount?: number; certificationCount?: number; projectCount?: number };
  recent?: { education?: EducationItem[]; certifications?: any[]; projects?: ProjectItem[] };
  completion?: { score?: number };
};

function fmtDate(d: string | Date | undefined | null) {
  if (!d) return null;
  try {
    const dt = new Date(d as any);
    if (isNaN(dt.getTime())) return null;
    return dt.toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

export default function ProfileDashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);

  useEffect(() => {
    // for demo, use userId=1
    axios
      .get(`${API}/profile/overview?userId=1`)
      .then((res) => setOverview(res.data))
      .catch(() => setOverview({}));
  }, []);

  if (!overview) return <div>Loading dashboard...</div>;

  const educList = overview.recent?.education ?? [];
  const projList = overview.recent?.projects ?? [];
  const summary = overview.summary ?? {};
  const score = overview.completion?.score ?? 0;

  return (
    <div style={{ padding: 20 }}>
      <h2>Profile Overview</h2>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8, minWidth: 220 }}>
          <h4>Education</h4>
          <p>{summary.educationCount ?? 0} entries</p>
          <a href="/education">+ Quick add</a>
        </div>
        <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8, minWidth: 220 }}>
          <h4>Certifications</h4>
          <p>{summary.certificationCount ?? 0} entries</p>
          <a href="/certifications">+ Quick add</a>
        </div>
        <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8, minWidth: 220 }}>
          <h4>Projects</h4>
          <p>{summary.projectCount ?? 0} entries</p>
          <a href="/projects">+ Quick add</a>
        </div>
      </div>

      <h3 style={{ marginTop: 20 }}>Recent</h3>
      <section>
        <h4>Education</h4>
        <ul>
          {educList.map((e) => (
            <li key={e.id}>
              {e.degree} — {e.institution} ({fmtDate(e.startDate) ?? 'N/A'} - {fmtDate(e.endDate) ?? 'Ongoing'})
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h4>Projects</h4>
        <ul>
          {projList.map((p) => (
            <li key={p.id}>{p.name} — {p.status ?? 'Unknown'}</li>
          ))}
        </ul>
      </section>

      <div style={{ marginTop: 20 }}>
        <h4>Profile Strength</h4>
        <div style={{ width: 300, background: '#eee' }}>
          <div style={{ width: `${Math.min(100, Math.max(0, score))}%`, background: '#4caf50', color: '#fff', padding: 8 }}>{score}%</div>
        </div>
        <div style={{ marginTop: 8, color: '#6b7280' }}>
          {score < 50 && <div>Add more education and at least one project to boost your profile.</div>}
          {score >= 50 && score < 80 && <div>Great start! Add certifications and project outcomes for a stronger profile.</div>}
          {score >= 80 && <div>Strong profile. Keep it up by keeping entries current.</div>}
        </div>
      </div>
    </div>
  );
}
