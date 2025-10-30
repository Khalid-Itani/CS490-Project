import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export default function ProjectsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    userId: 1, name: '', description: '', role: '', startDate: '', endDate: '',
    technologies: '', url: '', teamSize: '', outcomes: '', industry: '', status: 'Planned'
  });
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Projects</h2>
        <p className="text-sm text-gray-600">Showcase what you’ve built and how you worked.</p>
      </div>

      {/* Add form */}
      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--panel-bg)] p-4 sm:p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Add project</h3>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {/* Row 1 */}
          <div className="grid gap-2">
            <label className="text-sm text-gray-600">Name</label>
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-gray-600">Role</label>
            <input
              placeholder="Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
            />
          </div>
          <div className="grid gap-2 lg:col-span-1 md:col-span-2">
            <label className="text-sm text-gray-600">Description</label>
            <input
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
            />
          </div>

          {/* Row 2 */}
          <div className="grid gap-2">
            <label className="text-sm text-gray-600">Start date</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-gray-600">End date</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
            />
          </div>
          <div className="grid gap-2 lg:col-span-1 md:col-span-2">
            <label className="text-sm text-gray-600">Technologies (comma separated)</label>
            <input
              placeholder="React, Node, PostgreSQL…"
              value={form.technologies}
              onChange={(e) => setForm({ ...form, technologies: e.target.value })}
              className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
            />
          </div>

          {/* Row 3 */}
          <div className="grid gap-2">
            <label className="text-sm text-gray-600">Project URL</label>
            <input
              placeholder="https://…"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-gray-600">Team size</label>
            <input
              type="number" min={1} placeholder="Team size"
              value={form.teamSize}
              onChange={(e) => setForm({ ...form, teamSize: Number(e.target.value) })}
              className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
            />
          </div>
          <div className="grid gap-2 lg:col-span-1 md:col-span-2">
            <label className="text-sm text-gray-600">Outcomes & achievements</label>
            <input
              placeholder="Impact, metrics, results…"
              value={form.outcomes}
              onChange={(e) => setForm({ ...form, outcomes: e.target.value })}
              className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
            />
          </div>

          {/* Row 4 */}
          <div className="grid gap-2">
            <label className="text-sm text-gray-600">Industry</label>
            <input
              placeholder="Industry"
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
              className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-gray-600">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
            >
              <option>Planned</option>
              <option>Ongoing</option>
              <option>Completed</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-gray-600">Media (image)</label>
            <input
              type="file" accept="image/*"
              onChange={(e) => handleMedia(e.target.files?.[0] || null)}
              className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-gray-700 hover:file:bg-gray-200"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={async () => {
              const payload = {
                ...form,
                technologies: form.technologies
                  ? form.technologies.split(',').map((t: string) => t.trim()).filter(Boolean)
                  : [],
              };
              const res = await axios.post(`${API}/projects`, payload);
              const proj = res.data;
              if (mediaFile && proj?.id) {
                await axios.post(`${API}/projects/${proj.id}/media`, { url: mediaFile, type: 'IMAGE' });
              }
              setMediaFile(null);
              setForm({ userId: 1, name: '', description: '', role: '', startDate: '', endDate: '', technologies: '', url: '', teamSize: '', outcomes: '', industry: '', status: 'Planned' });
              axios.get(`${API}/projects/user/1`).then((r) => setItems(r.data));
            }}
            className="inline-flex items-center rounded-md bg-[var(--primary-color)] px-4 py-2 text-sm font-medium text-white hover:brightness-90"
          >
            Add
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          placeholder="Search technology"
          value={filters.tech}
          onChange={(e) => setFilters({ ...filters, tech: e.target.value })}
          className="w-full max-w-xs rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
        />
        <input
          placeholder="Industry"
          value={filters.industry}
          onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
          className="w-full max-w-xs rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
        >
          <option value="">All statuses</option>
          <option>Planned</option>
          <option>Ongoing</option>
          <option>Completed</option>
        </select>
        <select
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
          className="rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
        >
          <option value="date-desc">Newest</option>
          <option value="date-asc">Oldest</option>
        </select>
      </div>

      {/* Portfolio grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <div key={p.id} className="rounded-xl border border-[var(--border-color)] bg-[var(--panel-bg)] p-4">
            {editingId === p.id ? (
              <div className="space-y-3">
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
                />
                <input
                  value={editForm.role ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  placeholder="Role"
                  className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
                />
                <input
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
                />
                <select
                  value={editForm.status ?? 'Planned'}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
                >
                  <option>Planned</option>
                  <option>Ongoing</option>
                  <option>Completed</option>
                </select>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      axios.put(`${API}/projects/${p.id}`, editForm).then(() => {
                        setEditingId(null);
                        setEditForm(null);
                        axios.get(`${API}/projects/user/1`).then((r) => setItems(r.data));
                      });
                    }}
                    className="inline-flex items-center rounded-md bg-[var(--primary-color)] px-3 py-2 text-sm font-medium text-white hover:brightness-90"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setEditingId(null); setEditForm(null); }}
                    className="inline-flex items-center rounded-md border border-[var(--border-color)] bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="mb-1 text-lg font-semibold text-gray-900">{p.name}</h3>
                <div className="text-sm text-gray-600">{p.role}</div>
                <div className="mt-2 text-sm text-gray-800">{p.description}</div>

                {Array.isArray(p.technologies) && p.technologies.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.technologies.map((t: string, i: number) => (
                      <span
                        key={i}
                        className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-900"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 text-sm">
                  <strong>Status:</strong> {p.status}
                </div>

                {p.url && (
                  <div className="mt-1">
                    <a
                      href={p.url}
                      target="_blank"
                      className="text-sm font-medium text-[var(--primary-color)] hover:underline"
                    >
                      Visit
                    </a>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => { setEditingId(p.id); setEditForm({ ...p }); }}
                    className="inline-flex items-center rounded-md border border-[var(--border-color)] bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (!confirm('Delete this project?')) return;
                      axios.delete(`${API}/projects/${p.id}`).then(() =>
                        axios.get(`${API}/projects/user/1`).then((r) => setItems(r.data))
                      );
                    }}
                    className="inline-flex items-center rounded-md border border-[var(--border-color)] bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
