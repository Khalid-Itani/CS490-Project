import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export default function ProjectsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ userId: 1, name: '', description: '', role: '', startDate: '', endDate: '', technologies: '', url: '', teamSize: '', outcomes: '', industry: '', status: 'Planned' });
  const [mediaFile, setMediaFile] = useState<string | null>(null);
  const [filters, setFilters] = useState({ tech: '', industry: '', status: '', sort: 'date-desc' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any | null>(null);

  useEffect(() => {
    axios.get(`${API}/projects/user/1`).then((r) => setItems(r.data)).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    let list = [...items];
    if (filters.tech) list = list.filter((p) => (p.technologies || []).some((t: string) => t.toLowerCase().includes(filters.tech.toLowerCase())));
    if (filters.industry) list = list.filter((p) => (p.industry || '') === filters.industry);
    if (filters.status) list = list.filter((p) => (p.status || '') === filters.status);
    if (filters.sort === 'date-desc') list.sort((a, b) => new Date(b.startDate||0).getTime() - new Date(a.startDate||0).getTime());
    if (filters.sort === 'date-asc') list.sort((a, b) => new Date(a.startDate||0).getTime() - new Date(b.startDate||0).getTime());
    return list;
  }, [items, filters]);

  function handleMedia(file: File | null) {
    if (!file) { setMediaFile(null); return; }
    const reader = new FileReader();
    reader.onload = () => setMediaFile(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Projects</h2>
      <div style={{ marginBottom: 20 }}>
        <h3>Add project</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          <input placeholder="Technologies (comma separated)" value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} />
          <input placeholder="Project URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          <input type="number" min={1} placeholder="Team size" value={form.teamSize} onChange={(e) => setForm({ ...form, teamSize: Number(e.target.value) })} />
          <input placeholder="Outcomes & achievements" value={form.outcomes} onChange={(e) => setForm({ ...form, outcomes: e.target.value })} />
          <input placeholder="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>Planned</option>
            <option>Ongoing</option>
            <option>Completed</option>
          </select>
          <label>
            <input type="file" accept="image/*" onChange={(e) => handleMedia(e.target.files?.[0] || null)} /> Media
          </label>
          <button onClick={async () => {
            const payload = { ...form, technologies: form.technologies ? form.technologies.split(',').map((t: string) => t.trim()).filter(Boolean) : [] };
            const res = await axios.post(`${API}/projects`, payload);
            const proj = res.data;
            if (mediaFile && proj?.id) {
              await axios.post(`${API}/projects/${proj.id}/media`, { url: mediaFile, type: 'IMAGE' });
            }
            setMediaFile(null);
            setForm({ userId: 1, name: '', description: '', role: '', startDate: '', endDate: '', technologies: '', url: '', teamSize: '', outcomes: '', industry: '', status: 'Planned' });
            axios.get(`${API}/projects/user/1`).then((r) => setItems(r.data));
          }}>Add</button>
        </div>
      </div>

      {/* Filters & sort */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="Search technology" value={filters.tech} onChange={(e) => setFilters({ ...filters, tech: e.target.value })} />
        <input placeholder="Industry" value={filters.industry} onChange={(e) => setFilters({ ...filters, industry: e.target.value })} />
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All statuses</option>
          <option>Planned</option>
          <option>Ongoing</option>
          <option>Completed</option>
        </select>
        <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
          <option value="date-desc">Newest</option>
          <option value="date-asc">Oldest</option>
        </select>
      </div>

      {/* Portfolio grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {filtered.map((p) => (
          <div key={p.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
            {editingId === p.id ? (
              <div>
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                <input value={editForm.role ?? ''} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} placeholder="Role" />
                <input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                <select value={editForm.status ?? 'Planned'} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                  <option>Planned</option>
                  <option>Ongoing</option>
                  <option>Completed</option>
                </select>
                <div style={{ marginTop: 6 }}>
                  <button onClick={() => { axios.put(`${API}/projects/${p.id}`, editForm).then(() => { setEditingId(null); setEditForm(null); axios.get(`${API}/projects/user/1`).then((r) => setItems(r.data)); }); }}>Save</button>{' '}
                  <button onClick={() => { setEditingId(null); setEditForm(null); }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <h3 style={{ marginBottom: 6 }}>{p.name}</h3>
                <div style={{ color: '#6b7280' }}>{p.role}</div>
                <div>{p.description}</div>
                {Array.isArray(p.technologies) && p.technologies.length > 0 && (
                  <div style={{ marginTop: 6 }}>
                    {p.technologies.map((t: string, i: number) => (
                      <span key={i} style={{ display: 'inline-block', background: '#eef2ff', color: '#3730a3', padding: '2px 8px', borderRadius: 999, marginRight: 6, marginBottom: 4 }}>{t}</span>
                    ))}
                  </div>
                )}
                <div style={{ marginTop: 8 }}><strong>Status:</strong> {p.status}</div>
                {p.url && <div><a href={p.url} target="_blank">Visit</a></div>}
                <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
                  <button onClick={() => { setEditingId(p.id); setEditForm({ ...p }); }}>Edit</button>
                  <button onClick={() => {
                    if (!confirm('Delete this project?')) return;
                    axios.delete(`${API}/projects/${p.id}`).then(() => axios.get(`${API}/projects/user/1`).then((r) => setItems(r.data)));
                  }}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
