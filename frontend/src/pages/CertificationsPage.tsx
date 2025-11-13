import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useEffect as useReactEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Helper to get JWT token from localStorage
function getToken() {
  return window.localStorage.getItem('token');
}

const API = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

type Props = { userId?: string };
export default function CertificationsPage({ userId }: Props) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);
  const [debugToken, setDebugToken] = useState<string | null>(null);
  const [debugError, setDebugError] = useState<string | null>(null);
  // Fetch current user info from backend
  useEffect(() => {
    // Redirect to login if no token
    if (!window.localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    const token = getToken();
    setDebugToken(token || null);
    if (!token) {
      setDebugError('No token found in localStorage.');
      return;
    }
    axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
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
        setDebugError(err?.response?.data?.error || err?.message || 'Unknown error fetching user info.');
      });
  }, []);
  const [items, setItems] = useState<any[]>([]);
  // Use userId from props, or fallback to localStorage
  const currentUserId = userId || window.localStorage.getItem('userId');
  const [form, setForm] = useState<any>({ userId: currentUserId, name: '', issuingOrganization: '', dateEarned: '', expirationDate: '', doesNotExpire: false, certificationNumber: '', documentUrl: '', category: '', renewalReminderDays: 30 });
  const [orgQuery, setOrgQuery] = useState('');
  const [orgOptions, setOrgOptions] = useState<string[]>([]);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
  if (!currentUserId) return;
  axios.get(`${API}/certifications/user/${currentUserId}`).then((r) => setItems(r.data)).catch(() => {});
  }, [currentUserId]);

  useEffect(() => {
    if (!orgQuery) { setOrgOptions([]); return; }
    const id = setTimeout(() => {
      axios.get(`${API}/certifications/search/organizations?q=${encodeURIComponent(orgQuery)}`).then(r => {
        const opts = (r.data || []).map((x: any) => x.issuingOrganization).filter(Boolean);
        setOrgOptions(Array.from(new Set(opts)));
      }).catch(() => setOrgOptions([]));
    }, 250);
    return () => clearTimeout(id);
  }, [orgQuery]);

  const sorted = useMemo(() => [...items].sort((a, b) => new Date(b.dateEarned || 0).getTime() - new Date(a.dateEarned || 0).getTime()), [items]);

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
    <div className="max-w-6xl mx-auto p-6 text-gray-900">
      {errorMsg && (
        <div className="mb-3 text-red-600 font-medium">{errorMsg}</div>
      )}
      <h2 className="text-gray-900">Certifications</h2>
      <div className="page-card mt-2 mb-6">
        <div className="page-card-inner">
          <h3 className="mb-3 text-gray-900">Add certification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
            <div>
              <label className="form-label">Name</label>
              <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Organization</label>
              <input className="input" placeholder="Organization" value={form.issuingOrganization} onChange={(e) => setForm({ ...form, issuingOrganization: e.target.value })} onInput={(e) => setOrgQuery((e.target as HTMLInputElement).value)} list="orgOptions" />
              <datalist id="orgOptions">
                {orgOptions.map((o) => (<option key={o} value={o} />))}
              </datalist>
            </div>
            <div>
              <label className="form-label">Date earned</label>
              <input className="input" type="date" value={form.dateEarned} onChange={(e) => setForm({ ...form, dateEarned: e.target.value })} />
            </div>
            {!form.doesNotExpire && (
              <div>
                <label className="form-label">Expiration date</label>
                <input className="input" type="date" value={form.expirationDate} onChange={(e) => setForm({ ...form, expirationDate: e.target.value })} />
              </div>
            )}
            <div className="flex items-center gap-2 h-[42px]">
              <input className="checkbox" id="no-expire" type="checkbox" checked={form.doesNotExpire} onChange={(e) => setForm({ ...form, doesNotExpire: e.target.checked, expirationDate: '' })} />
              <label htmlFor="no-expire" className="form-label m-0">Does not expire</label>
            </div>
            <div>
              <label className="form-label">Certification ID</label>
              <input className="input" placeholder="Certification ID" value={form.certificationNumber} onChange={(e) => setForm({ ...form, certificationNumber: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Category</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">Category</option>
                <option>Cloud</option>
                <option>Security</option>
                <option>Data</option>
                <option>Project Management</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="form-label">Renewal reminder (days)</label>
              <input className="input" type="number" min={0} value={form.renewalReminderDays} onChange={(e) => setForm({ ...form, renewalReminderDays: Number(e.target.value) })} placeholder="Reminder (days)" />
            </div>
            <div>
              <label className="form-label">Document</label>
              <input className="input" type="file" accept="image/*,application/pdf" onChange={(e) => handleFileInput(e.target.files?.[0] || null)} />
              {uploadPreview && (
                <a className="text-sm text-blue-600 hover:underline ml-2" href={uploadPreview} target="_blank" rel="noreferrer">Preview</a>
              )}
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <button className="btn btn-primary btn-md" onClick={() => {
                setErrorMsg(null);
                if (!currentUserId) {
                  setErrorMsg('No userId found. Please log in again.');
                  return;
                }
                axios.post(`${API}/certifications`, { ...form, userId: currentUserId })
                  .then(() => axios.get(`${API}/certifications/user/${currentUserId}`).then((r) => setItems(r.data)))
                  .catch((err) => {
                    setErrorMsg(err?.response?.data?.message || 'Failed to add certification. Please check your input and try again.');
                  });
              }}>Add</button>
            </div>
          </div>
        </div>
      </div>
      <ul className="space-y-3">
        {sorted.map((c) => {
          const daysLeft = c.doesNotExpire || !c.expirationDate ? null : Math.ceil((new Date(c.expirationDate).getTime() - Date.now()) / (1000*60*60*24));
          const statusColor = c.doesNotExpire ? '#10b981' : daysLeft !== null && daysLeft <= 30 ? '#f59e0b' : '#3b82f6';
          return (
            <li key={c.id} className="page-card">
              <div className="page-card-inner">
              {editingId === c.id ? (
                <div>
                  <input className="input mb-2" placeholder="Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />{' '}
                  <input className="input mb-2" placeholder="Organization" value={editForm.issuingOrganization} onChange={(e) => setEditForm({ ...editForm, issuingOrganization: e.target.value })} />{' '}
                  <input className="input mb-2" type="date" value={editForm.dateEarned?.slice(0,10) ?? ''} onChange={(e) => setEditForm({ ...editForm, dateEarned: e.target.value })} />{' '}
                  {!editForm.doesNotExpire && (
                    <input className="input mb-2" type="date" value={editForm.expirationDate?.slice(0,10) ?? ''} onChange={(e) => setEditForm({ ...editForm, expirationDate: e.target.value })} />
                  )}{' '}
                  <label>
                    <input className="checkbox" type="checkbox" checked={!!editForm.doesNotExpire} onChange={(e) => setEditForm({ ...editForm, doesNotExpire: e.target.checked, expirationDate: null })} /> Does not expire
                  </label>
                  <input className="input mb-2" placeholder="Certification ID" value={editForm.certificationNumber ?? ''} onChange={(e) => setEditForm({ ...editForm, certificationNumber: e.target.value })} />
                  <div className="mt-2 space-x-2">
                    <button className="btn btn-primary btn-sm" onClick={() => { axios.put(`${API}/certifications/${c.id}`, editForm).then(() => { setEditingId(null); setEditForm(null); axios.get(`${API}/certifications/user/1`).then((r) => setItems(r.data)); }); }}>Save</button>{' '}
                    <button className="btn btn-secondary btn-sm" onClick={() => { setEditingId(null); setEditForm(null); }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div>
                      <strong>{c.name}</strong> — {c.issuingOrganization}
                      <div className="text-gray-600">Earned: {c.dateEarned?.slice(0,10)} {c.doesNotExpire ? '(Does not expire)' : c.expirationDate ? `- Expires ${c.expirationDate?.slice(0,10)}` : ''}</div>
                      {c.certificationNumber && <div>ID: {c.certificationNumber}</div>}
                      {c.category && <div>Category: {c.category}</div>}
                      {c.documentUrl && <div><a className="text-blue-600 hover:underline" href={c.documentUrl} target="_blank">View document</a></div>}
                      <div className="mt-2">
                        <span style={{ background: statusColor, color: '#fff', padding: '2px 8px', borderRadius: 999 }}>{c.doesNotExpire ? 'Permanent' : daysLeft !== null ? `${daysLeft} days left` : 'No expiration set'}</span>
                        <span style={{ marginLeft: 8, background: '#111827', color: '#fff', padding: '2px 8px', borderRadius: 999 }}>Verification: {c.verificationStatus ?? 'Unverified'}</span>
                      </div>
                    </div>
                    <div>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setEditingId(c.id); setEditForm({ ...c }); }}>Edit</button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <button className="btn btn-ghost btn-sm" onClick={() => {
                      if (!confirm('Delete this certification?')) return;
                      if (!currentUserId) return;
                      axios.delete(`${API}/certifications/${c.id}`).then(() => axios.get(`${API}/certifications/user/${currentUserId}`).then((r) => setItems(r.data)));
                    }}>Delete</button>
                  </div>
                </div>
              )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
