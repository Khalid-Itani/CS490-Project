import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export default function EducationPage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    userId: 1,
    degree: '',
    institution: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    ongoing: false,
    gpa: '',
    showGpa: true,
    honors: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any | null>(null);

  function resetForm() {
    setForm({
      userId: 1,
      degree: '',
      institution: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      ongoing: false,
      gpa: '',
      showGpa: true,
      honors: '',
    });
  }

  useEffect(() => {
    axios.get(`${API}/education/user/1`).then((r) => setItems(r.data)).catch(() => {});
  }, []);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const ax = new Date(a.endDate || a.startDate || 0).getTime();
      const bx = new Date(b.endDate || b.startDate || 0).getTime();
      return bx - ax;
    });
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Education</h2>
        <p className="text-sm text-gray-600">Add entries and keep your timeline up to date.</p>
      </div>

      {/* Add form */}
      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--panel-bg)] p-4 sm:p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Add education</h3>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm text-gray-600">Degree</label>
            <input
              placeholder="Degree"
              value={form.degree}
              onChange={(e) => setForm({ ...form, degree: e.target.value })}
              className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-gray-600">Institution</label>
            <input
              placeholder="Institution"
              value={form.institution}
              onChange={(e) => setForm({ ...form, institution: e.target.value })}
              className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-gray-600">Field of Study</label>
            <input
              placeholder="Field of Study"
              value={form.fieldOfStudy}
              onChange={(e) => setForm({ ...form, fieldOfStudy: e.target.value })}
              className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-gray-600">Honors (comma separated)</label>
            <input
              placeholder="Honors (comma separated)"
              value={form.honors}
              onChange={(e) => setForm({ ...form, honors: e.target.value })}
              className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-gray-600">Start date</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
            />
          </div>

          {!form.ongoing && (
            <div className="grid gap-2">
              <label className="text-sm text-gray-600">End date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
              />
            </div>
          )}

          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.ongoing}
                onChange={(e) => setForm({ ...form, ongoing: e.target.checked, endDate: '' })}
                className="h-4 w-4 rounded border-[var(--border-color)] text-[var(--primary-color)]"
              />
              Ongoing
            </label>

            <div className="grid grid-cols-[auto_1fr] items-center gap-2">
              <span className="text-sm text-gray-600">GPA</span>
              <input
                placeholder="GPA"
                value={form.gpa}
                onChange={(e) => setForm({ ...form, gpa: e.target.value })}
                className="w-24 rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
              />
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.showGpa}
                onChange={(e) => setForm({ ...form, showGpa: e.target.checked })}
                className="h-4 w-4 rounded border-[var(--border-color)] text-[var(--primary-color)]"
              />
              Show GPA
            </label>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={() => {
              const payload = {
                ...form,
                honors: form.honors
                  ? form.honors.split(',').map((h: string) => h.trim()).filter(Boolean)
                  : [],
              };
              axios
                .post(`${API}/education`, payload)
                .then(() => {
                  axios.get(`${API}/education/user/1`).then((r) => setItems(r.data));
                  resetForm();
                });
            }}
            className="inline-flex items-center rounded-md bg-[var(--primary-color)] px-4 py-2 text-sm font-medium text-white hover:brightness-90"
          >
            Add
          </button>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Entries list */}
        <div>
          <h3 className="mb-3 text-lg font-semibold">Entries</h3>
          <ul className="space-y-3">
            {sorted.map((e) => (
              <li
                key={e.id}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--panel-bg)] p-4"
              >
                {editingId === e.id ? (
                  <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        placeholder="Degree"
                        value={editForm.degree}
                        onChange={(ev) => setEditForm({ ...editForm, degree: ev.target.value })}
                        className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
                      />
                      <input
                        placeholder="Institution"
                        value={editForm.institution}
                        onChange={(ev) => setEditForm({ ...editForm, institution: ev.target.value })}
                        className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
                      />
                      <input
                        placeholder="Field of Study"
                        value={editForm.fieldOfStudy ?? ''}
                        onChange={(ev) => setEditForm({ ...editForm, fieldOfStudy: ev.target.value })}
                        className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
                      />
                      <input
                        type="date"
                        value={editForm.startDate?.slice(0, 10) ?? ''}
                        onChange={(ev) => setEditForm({ ...editForm, startDate: ev.target.value })}
                        className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
                      />
                      {!editForm.ongoing && (
                        <input
                          type="date"
                          value={editForm.endDate?.slice(0, 10) ?? ''}
                          onChange={(ev) => setEditForm({ ...editForm, endDate: ev.target.value })}
                          className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
                        />
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={!!editForm.ongoing}
                          onChange={(ev) =>
                            setEditForm({ ...editForm, ongoing: ev.target.checked, endDate: null })
                          }
                          className="h-4 w-4 rounded border-[var(--border-color)] text-[var(--primary-color)]"
                        />
                        Ongoing
                      </label>

                      <div className="grid grid-cols-[auto_1fr] items-center gap-2">
                        <span className="text-sm text-gray-600">GPA</span>
                        <input
                          placeholder="GPA"
                          value={editForm.gpa ?? ''}
                          onChange={(ev) => setEditForm({ ...editForm, gpa: ev.target.value })}
                          className="w-24 rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
                        />
                      </div>

                      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={!!editForm.showGpa}
                          onChange={(ev) => setEditForm({ ...editForm, showGpa: ev.target.checked })}
                          className="h-4 w-4 rounded border-[var(--border-color)] text-[var(--primary-color)]"
                        />
                        Show GPA
                      </label>
                    </div>

                    <input
                      placeholder="Honors (comma separated)"
                      value={(editForm.honors || []).join(', ')}
                      onChange={(ev) =>
                        setEditForm({
                          ...editForm,
                          honors: ev.target.value
                            .split(',')
                            .map((h: string) => h.trim())
                            .filter(Boolean),
                        })
                      }
                      className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          axios.put(`${API}/education/${e.id}`, editForm).then(() => {
                            setEditingId(null);
                            setEditForm(null);
                            axios.get(`${API}/education/user/1`).then((r) => setItems(r.data));
                          });
                        }}
                        className="inline-flex items-center rounded-md bg-[var(--primary-color)] px-3 py-2 text-sm font-medium text-white hover:brightness-90"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditForm(null);
                        }}
                        className="inline-flex items-center rounded-md border border-[var(--border-color)] bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-900">
                          {e.degree} <span className="font-normal text-gray-600">— {e.institution}</span>
                        </div>
                        <div className="text-sm text-gray-600">{e.fieldOfStudy}</div>
                        <div className="text-sm">
                          {e.startDate?.slice(0, 10)} – {e.endDate ? e.endDate.slice(0, 10) : 'Ongoing'}
                          {e.ongoing && (
                            <span
                              className="ml-2 rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800"
                              title="Ongoing"
                            >
                              In progress
                            </span>
                          )}
                        </div>
                        {e.showGpa && e.gpa && (
                          <div className="text-sm">
                            <strong>GPA:</strong> {e.gpa}
                          </div>
                        )}
                        {e.honors?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {e.honors.map((h: string, i: number) => (
                              <span
                                key={i}
                                className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-900"
                              >
                                {h}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0">
                        <button
                          onClick={() => {
                            setEditingId(e.id);
                            setEditForm({ ...e });
                          }}
                          className="inline-flex items-center rounded-md border border-[var(--border-color)] bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <button
                        onClick={() => {
                          if (!confirm('Delete this education entry?')) return;
                          axios
                            .delete(`${API}/education/${e.id}`)
                            .then(() => axios.get(`${API}/education/user/1`).then((r) => setItems(r.data)));
                        }}
                        className="inline-flex items-center rounded-md border border-[var(--border-color)] bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Timeline */}
        <div>
          <h3 className="mb-3 text-lg font-semibold">Timeline</h3>
          <div className="relative pl-6">
            <div className="absolute left-2 top-0 h-full w-[2px] bg-[var(--border-color)]" />
            {sorted.map((e) => (
              <div key={e.id} className="relative mb-4">
                <div
                  className={`absolute left-0 top-1 h-2.5 w-2.5 rounded-full ${
                    e.endDate ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                />
                <div className="ml-4">
                  <div className="font-medium">
                    {e.degree}{' '}
                    <span className="text-gray-600">@ {e.institution}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {e.startDate?.slice(0, 10)} – {e.endDate ? e.endDate.slice(0, 10) : 'Present'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
