import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export default function EducationPage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ userId: 1, degree: '', institution: '', startDate: '', endDate: '', ongoing: false, gpa: '', showGpa: true, honors: [] });

  function resetForm() {
    setForm({ userId: 1, degree: '', institution: '', startDate: '', endDate: '', ongoing: false, gpa: '', showGpa: true, honors: [] });
  }
  useEffect(() => {
    axios.get(`${API}/education/user/1`).then((r) => setItems(r.data)).catch(() => {});
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Education</h2>
      <div style={{ marginBottom: 20 }}>
        <h3>Add education</h3>
        <input placeholder="Degree" value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} />{' '}
        <input placeholder="Institution" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} />{' '}
        <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />{' '}
        <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />{' '}
        <input placeholder="GPA" value={form.gpa} onChange={(e) => setForm({ ...form, gpa: e.target.value })} />{' '}
        <button onClick={() => {
          axios.post(`${API}/education`, form).then(() => { axios.get(`${API}/education/user/1`).then((r) => setItems(r.data)); resetForm(); });
        }}>Add</button>
      </div>
      <ul>
        {items.map((e) => (
          <li key={e.id} style={{ marginBottom: 8 }}>
            <strong>{e.degree}</strong> — {e.institution}<br />
            {e.fieldOfStudy && <em>{e.fieldOfStudy}</em>} {e.startDate?.slice(0,10)} - {e.endDate ? e.endDate.slice(0,10) : 'Ongoing'}
            {e.showGpa && e.gpa && <div>GPA: {e.gpa}</div>}
            {e.honors?.length > 0 && <div>Honors: {e.honors.join(', ')}</div>}
            <div style={{ marginTop: 6 }}>
              <button onClick={() => {
                if (!confirm('Delete this education entry?')) return;
                axios.delete(`${API}/education/${e.id}`).then(() => axios.get(`${API}/education/user/1`).then((r) => setItems(r.data)));
              }}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
