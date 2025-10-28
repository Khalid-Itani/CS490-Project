import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export default function CertificationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ userId: 1, name: '', issuingOrganization: '', dateEarned: '', expirationDate: '', doesNotExpire: false, certificationNumber: '', documentUrl: '' });
  useEffect(() => {
    axios.get(`${API}/certifications/user/1`).then((r) => setItems(r.data)).catch(() => {});
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Certifications</h2>
      <div style={{ marginBottom: 20 }}>
        <h3>Add certification</h3>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />{' '}
        <input placeholder="Organization" value={form.issuingOrganization} onChange={(e) => setForm({ ...form, issuingOrganization: e.target.value })} />{' '}
        <input type="date" value={form.dateEarned} onChange={(e) => setForm({ ...form, dateEarned: e.target.value })} />{' '}
        <button onClick={() => { axios.post(`${API}/certifications`, form).then(() => axios.get(`${API}/certifications/user/1`).then((r) => setItems(r.data))); }}>Add</button>
      </div>
      <ul>
        {items.map((c) => (
          <li key={c.id} style={{ marginBottom: 8 }}>
            <strong>{c.name}</strong> — {c.issuingOrganization}<br />
            Earned: {c.dateEarned?.slice(0,10)} {c.doesNotExpire ? '(Does not expire)' : c.expirationDate ? `- Expires ${c.expirationDate?.slice(0,10)}` : ''}
            {c.certificationNumber && <div>ID: {c.certificationNumber}</div>}
            {c.documentUrl && <div><a href={c.documentUrl} target="_blank">View document</a></div>}
            <div>Status: {c.verificationStatus}</div>
            <div style={{ marginTop: 6 }}>
              <button onClick={() => {
                if (!confirm('Delete this certification?')) return;
                axios.delete(`${API}/certifications/${c.id}`).then(() => axios.get(`${API}/certifications/user/1`).then((r) => setItems(r.data)));
              }}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
