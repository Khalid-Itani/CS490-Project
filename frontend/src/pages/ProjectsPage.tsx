import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export default function ProjectsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ userId: 1, name: '', description: '', startDate: '', endDate: '', technologies: [] });
  useEffect(() => {
    axios.get(`${API}/projects/user/1`).then((r) => setItems(r.data)).catch(() => {});
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Projects</h2>
      <div style={{ marginBottom: 20 }}>
        <h3>Add project</h3>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />{' '}
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />{' '}
        <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />{' '}
        <button onClick={() => { axios.post(`${API}/projects`, form).then(() => axios.get(`${API}/projects/user/1`).then((r) => setItems(r.data))); }}>Add</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {items.map((p) => (
          <div key={p.id} style={{ border: '1px solid #ddd', padding: 12 }}>
            <h3>{p.name}</h3>
            <div>{p.description}</div>
            <div style={{ marginTop: 8 }}><strong>Status:</strong> {p.status}</div>
            {p.url && <div><a href={p.url} target="_blank">Visit</a></div>}
            <div style={{ marginTop: 6 }}>
              <button onClick={() => {
                if (!confirm('Delete this project?')) return;
                axios.delete(`${API}/projects/${p.id}`).then(() => axios.get(`${API}/projects/user/1`).then((r) => setItems(r.data)));
              }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
