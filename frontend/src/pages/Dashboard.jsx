import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = import.meta.env?.VITE_API_URL || 'http://localhost:3000';

export default function Dashboard() {
  const [education, setEducation] = useState([]);
  useEffect(() => {
    axios.get(`${API}/education/user/1`).then(r => setEducation(r.data)).catch(() => {});
  }, []);

  const completeness = useMemo(() => {
    // Example: 20% for education if at least one entry
    return education.length > 0 ? 20 : 0;
  }, [education]);

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p>Welcome! Use the nav to explore the app.</p>
      <div style={{ marginTop: 24 }}>
        <h2>Education Summary</h2>
        {education.length === 0 ? (
          <div>No education entries yet.</div>
        ) : (
          <ul>
            {education.map(e => (
              <li key={e.id}>
                <strong>{e.degree}</strong> — {e.institution} ({e.educationLevel})
                <span style={{ color: '#6b7280', marginLeft: 8 }}>{e.startDate?.slice(0,10)} - {e.endDate ? e.endDate.slice(0,10) : 'Ongoing'}</span>
              </li>
            ))}
          </ul>
        )}
        <div style={{ marginTop: 16 }}>
          <strong>Profile Completeness:</strong> {completeness}%
        </div>
      </div>
    </div>
  );
}
