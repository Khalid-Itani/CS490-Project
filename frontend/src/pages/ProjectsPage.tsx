import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Helper to get JWT token from localStorage
function getToken() {
  return window.localStorage.getItem('token');
}

const API = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export default function ProjectsPage() {
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);
  const [debugToken, setDebugToken] = useState<string | null>(null);
  const [debugError, setDebugError] = useState<string | null>(null);
  const navigate = useNavigate ? useNavigate() : null;

  // Use the actual user UUID from localStorage (fallback demo)
  const currentUserId = window.localStorage.getItem('userId') || 'demo-user-uuid';

  // Auth check
  useEffect(() => {
    const token = getToken();
    setDebugToken(token || null);
    if (!token && navigate) {
      navigate('/login');
      return;
    }
    if (!token) {
      setDebugError('No token found in localStorage.');
      return;
    }
    axios
      .get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (r.data?.user) {
          setCurrentUser({ id: r.data.user.id, email: r.data.user.email });
          setDebugError(null);
        } else {
          setCurrentUser(null);
          setDebugError('No user object in response.');
        }
      })
      .catch((err) => {
        setCurrentUser(null);
        setDebugError(
          err?.response?.data?.error || err?.message || 'Unknown error fetching user info.'
        );
      });
  }, []);

  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    userId: currentUserId,
    name: '',
    description: '',
    role: '',
    startDate: '',
    endDate: '',
    technologies: '',
    url: '',
    teamSize: '',
    outcomes: '',
    industry: '',
    status: 'Planned',
  });
  const [mediaFile, setMediaFile] = useState<string | null>(null);
  const [filters, setFilters] = useState({ tech: '', industry: '', status: '', sort: 'date-desc' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any | null>(null);

  useEffect(() => {
    axios
      .get(`${API}/projects/user/${currentUserId}`)
      .then((r) => setItems(r.data))
      .catch(() => {});
  }, [currentUserId]);

  const filtered = useMemo(() => {
    let list = [...items];
    if (filters.tech)
      list = list.filter((p) =>
        (p.technologies || []).some((t: string) =>
          t.toLowerCase().includes(filters.tech.toLowerCase())
        )
      );
    if (filters.industry) list = list.filter((p) => (p.industry || '') === filters.industry);
    if (filters.status) list = list.filter((p) => (p.status || '') === filters.status);
    if (filters.sort === 'date-desc')
      list.sort(
        (a, b) => new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime()
      );
    if (filters.sort === 'date-asc')
      list.sort(
        (a, b) => new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime()
      );
    return list;
  }, [items, filters]);

  function handleMedia(file: File | null) {
    if (!file) {
      setMediaFile(null);
      return;
    }
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
          <div className="grid gap-2">
            <label className="text-sm text-gray-600">Name</label>
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-gray-600">Role</label>
            <input
              placeholder="Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="input"
            />
          </div>
          <div className="grid gap-2 lg:col-span-1 md:col-span-2">
            <label className="text-sm text-gray-600">Description</label>
            <input
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-gray-600">Start date</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="input"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-gray-600">End date</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="input"
            />
          </div>
          <div className="grid gap-2 lg:col-span-1 md:col-span-2">
            <label className="text-sm text-gray-600">Technologies (comma separated)</label>
            <input
              placeholder="React, Node, PostgreSQL…"
              value={form.technologies}
              onChange={(e) => setForm({ ...form, technologies: e.target.value })}
              className="input"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-gray-600">Project URL</label>
            <input
              placeholder="https://…"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="input"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-gray-600">Team size</label>
            <input
              type="number"
              min={1}
              placeholder="Team size"
              value={form.teamSize}
              onChange={(e) => setForm({ ...form, teamSize: Number(e.target.value) })}
              className="input"
            />
          </div>
          <div className="grid gap-2 lg:col-span-1 md:col-span-2">
            <label className="text-sm text-gray-600">Outcomes & achievements</label>
            <input
              placeholder="Impact, metrics, results…"
              value={form.outcomes}
              onChange={(e) => setForm({ ...form, outcomes: e.target.value })}
              className="input"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-gray-600">Industry</label>
            <input
              placeholder="Industry"
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
              className="input"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-gray-600">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="input"
            >
              <option>Planned</option>
              <option>Ongoing</option>
              <option>Completed</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-gray-600">Media (image)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleMedia(e.target.files?.[0] || null)}
              className="file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-gray-700 hover:file:bg-gray-200"
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
              setForm({
                userId: currentUserId,
                name: '',
                description: '',
                role: '',
                startDate: '',
                endDate: '',
                technologies: '',
                url: '',
                teamSize: '',
                outcomes: '',
                industry: '',
                status: 'Planned',
              });
              axios.get(`${API}/projects/user/${currentUserId}`).then((r) => setItems(r.data));
            }}
            className="btn btn-primary"
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
          className="input w-full max-w-xs"
        />
        <input
          placeholder="Industry"
          value={filters.industry}
          onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
          className="input w-full max-w-xs"
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="input"
        >
          <option value="">All statuses</option>
          <option>Planned</option>
          <option>Ongoing</option>
          <option>Completed</option>
        </select>
        <select
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
          className="input"
        >
          <option value="date-desc">Newest</option>
          <option value="date-asc">Oldest</option>
        </select>
      </div>

      {/* Project cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-[var(--border-color)] bg-[var(--panel-bg)] p-4"
          >
            {editingId === p.id ? (
              <div className="space-y-3">
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="input"
                />
                <input
                  value={editForm.role ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  placeholder="Role"
                  className="input"
                />
                <input
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="input"
                />
                <select
                  value={editForm.status ?? 'Planned'}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="input"
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
                        axios.get(`${API}/projects/user/${currentUserId}`).then((r) => setItems(r.data));
                      });
                    }}
                    className="btn btn-primary"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditForm(null);
                    }}
                    className="btn btn-secondary"
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
                    onClick={() => {
                      setEditingId(p.id);
                      setEditForm({ ...p });
                    }}
                    className="btn btn-secondary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (!confirm('Delete this project?')) return;
                      axios
                        .delete(`${API}/projects/${p.id}`)
                        .then(() =>
                          axios
                            .get(`${API}/projects/user/${currentUserId}`)
                            .then((r) => setItems(r.data))
                        );
                    }}
                    className="btn btn-secondary"
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
