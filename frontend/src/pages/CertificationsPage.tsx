import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export default function CertificationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    userId: 1,
    name: '',
    issuingOrganization: '',
    dateEarned: '',
    expirationDate: '',
    doesNotExpire: false,
    certificationNumber: '',
    documentUrl: '',
    category: '',
    renewalReminderDays: 30,
  });
  const [orgQuery, setOrgQuery] = useState('');
  const [orgOptions, setOrgOptions] = useState<string[]>([]);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any | null>(null);

  useEffect(() => {
    axios.get(`${API}/certifications/user/1`).then((r) => setItems(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!orgQuery) { setOrgOptions([]); return; }
    const id = setTimeout(() => {
      axios
        .get(`${API}/certifications/search/organizations?q=${encodeURIComponent(orgQuery)}`)
        .then((r) => {
          const opts = (r.data || [])
            .map((x: any) => x.issuingOrganization)
            .filter(Boolean);
          setOrgOptions(Array.from(new Set(opts)));
        })
        .catch(() => setOrgOptions([]));
    }, 250);
    return () => clearTimeout(id);
  }, [orgQuery]);

  const sorted = useMemo(
    () =>
      [...items].sort(
        (a, b) =>
          new Date(b.dateEarned || 0).getTime() - new Date(a.dateEarned || 0).getTime()
      ),
    [items]
  );

  function handleFileInput(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setForm((f: any) => ({ ...f, documentUrl: url }));
      setUploadPreview(url);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Certifications</h2>
        <p className="text-sm text-gray-600">Keep your certs current and verified.</p>
      </div>

      {/* Add form card */}
      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--panel-bg)] p-4 sm:p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Add certification</h3>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <div className="grid gap-2">
            <label className="text-sm text-gray-600">Name</label>
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none
                         focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-gray-600">Organization</label>
            <input
              placeholder="Organization"
              value={form.issuingOrganization}
              onChange={(e) => setForm({ ...form, issuingOrganization: e.target.value })}
              onInput={(e) => setOrgQuery((e.target as HTMLInputElement).value)}
              list="orgOptions"
              className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none
                         focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
            />
            <datalist id="orgOptions">
              {orgOptions.map((o) => (
                <option key={o} value={o} />
              ))}
            </datalist>
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-gray-600">Date earned</label>
            <input
              type="date"
              value={form.dateEarned}
              onChange={(e) => setForm({ ...form, dateEarned: e.target.value })}
              className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none
                         focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
            />
          </div>

          {!form.doesNotExpire && (
            <div className="grid gap-2">
              <label className="text-sm text-gray-600">Expiration date</label>
              <input
                type="date"
                value={form.expirationDate}
                onChange={(e) => setForm({ ...form, expirationDate: e.target.value })}
                className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none
                           focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
              />
            </div>
          )}

          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.doesNotExpire}
                onChange={(e) => setForm({ ...form, doesNotExpire: e.target.checked, expirationDate: '' })}
                className="h-4 w-4 rounded border-[var(--border-color)] text-[var(--primary-color)]"
              />
              Does not expire
            </label>

            <div className="grid grid-cols-[auto_1fr] items-center gap-2">
              <span className="text-sm text-gray-600">Certification ID</span>
              <input
                placeholder="Certification ID"
                value={form.certificationNumber}
                onChange={(e) => setForm({ ...form, certificationNumber: e.target.value })}
                className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none
                           focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-gray-600">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none
                         focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
            >
              <option value="">Category</option>
              <option>Cloud</option>
              <option>Security</option>
              <option>Data</option>
              <option>Project Management</option>
              <option>Other</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-gray-600">Renewal reminder (days)</label>
            <input
              type="number"
              min={0}
              value={form.renewalReminderDays}
              onChange={(e) =>
                setForm({ ...form, renewalReminderDays: Number(e.target.value) })
              }
              className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none
                         focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-gray-600">Upload document (image/PDF)</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => handleFileInput(e.target.files?.[0] || null)}
              className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-gray-700 hover:file:bg-gray-200"
            />
            {uploadPreview && (
              <a
                href={uploadPreview}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-[var(--primary-color)] hover:underline"
              >
                Preview
              </a>
            )}
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={() => {
              axios
                .post(`${API}/certifications`, form)
                .then(() =>
                  axios.get(`${API}/certifications/user/1`).then((r) => setItems(r.data))
                );
            }}
            className="inline-flex items-center rounded-md bg-[var(--primary-color)] px-4 py-2 text-sm font-medium text-white hover:brightness-90"
          >
            Add
          </button>
        </div>
      </div>

      {/* List */}
      <ul className="space-y-3">
        {sorted.map((c) => {
          const daysLeft =
            c.doesNotExpire || !c.expirationDate
              ? null
              : Math.ceil(
                  (new Date(c.expirationDate).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                );

          const statusColor = c.doesNotExpire
            ? 'var(--success-color)'
            : daysLeft !== null && daysLeft <= 30
            ? 'var(--warning-color)'
            : 'var(--accent-color)';

          return (
            <li
              key={c.id}
              className="rounded-xl border border-[var(--border-color)] bg-[var(--panel-bg)] p-4"
            >
              {editingId === c.id ? (
                <div className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      placeholder="Name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
                    />
                    <input
                      placeholder="Organization"
                      value={editForm.issuingOrganization}
                      onChange={(e) =>
                        setEditForm({ ...editForm, issuingOrganization: e.target.value })
                      }
                      className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
                    />
                    <input
                      type="date"
                      value={editForm.dateEarned?.slice(0, 10) ?? ''}
                      onChange={(e) => setEditForm({ ...editForm, dateEarned: e.target.value })}
                      className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
                    />
                    {!editForm.doesNotExpire && (
                      <input
                        type="date"
                        value={editForm.expirationDate?.slice(0, 10) ?? ''}
                        onChange={(e) =>
                          setEditForm({ ...editForm, expirationDate: e.target.value })
                        }
                        className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
                      />
                    )}
                  </div>

                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={!!editForm.doesNotExpire}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          doesNotExpire: e.target.checked,
                          expirationDate: null,
                        })
                      }
                      className="h-4 w-4 rounded border-[var(--border-color)] text-[var(--primary-color)]"
                    />
                    Does not expire
                  </label>

                  <input
                    placeholder="Certification ID"
                    value={editForm.certificationNumber ?? ''}
                    onChange={(e) =>
                      setEditForm({ ...editForm, certificationNumber: e.target.value })
                    }
                    className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--primary-color)/0.25]"
                  />

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        axios.put(`${API}/certifications/${c.id}`, editForm).then(() => {
                          setEditingId(null);
                          setEditForm(null);
                          axios.get(`${API}/certifications/user/1`).then((r) => setItems(r.data));
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
                        {c.name}{' '}
                        <span className="font-normal text-gray-600">— {c.issuingOrganization}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Earned: {c.dateEarned?.slice(0, 10)}{' '}
                        {c.doesNotExpire
                          ? '(Does not expire)'
                          : c.expirationDate
                          ? `- Expires ${c.expirationDate?.slice(0, 10)}`
                          : ''}
                      </div>
                      {c.certificationNumber && (
                        <div className="text-sm">ID: {c.certificationNumber}</div>
                      )}
                      {c.category && <div className="text-sm">Category: {c.category}</div>}
                      {c.documentUrl && (
                        <div className="text-sm">
                          <a
                            href={c.documentUrl}
                            target="_blank"
                            className="font-medium text-[var(--primary-color)] hover:underline"
                          >
                            View document
                          </a>
                        </div>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white"
                          style={{ background: statusColor }}
                        >
                          {c.doesNotExpire
                            ? 'Permanent'
                            : daysLeft !== null
                            ? `${daysLeft} days left`
                            : 'No expiration set'}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-gray-900 px-2 py-0.5 text-xs font-medium text-white">
                          Verification: {c.verificationStatus ?? 'Unverified'}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <button
                        onClick={() => {
                          setEditingId(c.id);
                          setEditForm({ ...c });
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
                        if (!confirm('Delete this certification?')) return;
                        axios
                          .delete(`${API}/certifications/${c.id}`)
                          .then(() =>
                            axios.get(`${API}/certifications/user/1`).then((r) => setItems(r.data))
                          );
                      }}
                      className="inline-flex items-center rounded-md border border-[var(--border-color)] bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
