import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export default function EducationPage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ userId: 1, degree: '', institution: '', fieldOfStudy: '', startDate: '', endDate: '', ongoing: false, gpa: '', showGpa: true, honors: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any | null>(null);

  function resetForm() {
    setForm({ userId: 1, degree: '', institution: '', fieldOfStudy: '', startDate: '', endDate: '', ongoing: false, gpa: '', showGpa: true, honors: '' });
  }
  useEffect(() => {
    axios.get(`${API}/education/user/1`).then((r) => setItems(r.data)).catch(() => {});
  }, []);

  const sorted = useMemo(() => {
    // Ensure reverse chronological by endDate then startDate
    return [...items].sort((a, b) => {
      const ax = new Date(a.endDate || a.startDate || 0).getTime();
      const bx = new Date(b.endDate || b.startDate || 0).getTime();
      return bx - ax;
    });
  }, [items]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Education</h2>
      <div style={{ marginBottom: 20 }}>
        <h3>Add education</h3>
        <input placeholder="Degree" value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} />{' '}
        <input placeholder="Institution" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} />{' '}
        <input placeholder="Field of Study" value={form.fieldOfStudy} onChange={(e) => setForm({ ...form, fieldOfStudy: e.target.value })} />{' '}
        <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />{' '}
        {!form.ongoing && (
          <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
        )}{' '}
        <label style={{ marginRight: 8 }}>
          <input type="checkbox" checked={form.ongoing} onChange={(e) => setForm({ ...form, ongoing: e.target.checked, endDate: '' })} /> Ongoing
        </label>
        <input placeholder="GPA" value={form.gpa} onChange={(e) => setForm({ ...form, gpa: e.target.value })} style={{ width: 80 }} />{' '}
        <label style={{ marginRight: 8 }}>
          <input type="checkbox" checked={form.showGpa} onChange={(e) => setForm({ ...form, showGpa: e.target.checked })} /> Show GPA
        </label>
        <input placeholder="Honors (comma separated)" value={form.honors} onChange={(e) => setForm({ ...form, honors: e.target.value })} style={{ minWidth: 280 }} />{' '}
        <button onClick={() => {
          const payload = { ...form, honors: form.honors ? form.honors.split(',').map((h: string) => h.trim()).filter(Boolean) : [] };
          axios.post(`${API}/education`, payload).then(() => { axios.get(`${API}/education/user/1`).then((r) => setItems(r.data)); resetForm(); });
        }}>Add</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <h3>Entries</h3>
          <ul>
            {sorted.map((e) => (
              <li key={e.id} style={{ marginBottom: 12, padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
                {editingId === e.id ? (
                  <div>
                    <input placeholder="Degree" value={editForm.degree} onChange={(ev) => setEditForm({ ...editForm, degree: ev.target.value })} />{' '}
                    <input placeholder="Institution" value={editForm.institution} onChange={(ev) => setEditForm({ ...editForm, institution: ev.target.value })} />{' '}
                    <input placeholder="Field of Study" value={editForm.fieldOfStudy ?? ''} onChange={(ev) => setEditForm({ ...editForm, fieldOfStudy: ev.target.value })} />{' '}
                    <input type="date" value={editForm.startDate?.slice(0,10) ?? ''} onChange={(ev) => setEditForm({ ...editForm, startDate: ev.target.value })} />{' '}
                    {!editForm.ongoing && (
                      <input type="date" value={editForm.endDate?.slice(0,10) ?? ''} onChange={(ev) => setEditForm({ ...editForm, endDate: ev.target.value })} />
                    )}{' '}
                    <label style={{ marginRight: 8 }}>
                      <input type="checkbox" checked={!!editForm.ongoing} onChange={(ev) => setEditForm({ ...editForm, ongoing: ev.target.checked, endDate: null })} /> Ongoing
                    </label>
                    <input placeholder="GPA" value={editForm.gpa ?? ''} onChange={(ev) => setEditForm({ ...editForm, gpa: ev.target.value })} style={{ width: 80 }} />{' '}
                    <label>
                      <input type="checkbox" checked={!!editForm.showGpa} onChange={(ev) => setEditForm({ ...editForm, showGpa: ev.target.checked })} /> Show GPA
                    </label>
                    <div style={{ marginTop: 8 }}>
                      <input placeholder="Honors (comma separated)" value={(editForm.honors || []).join(', ')} onChange={(ev) => setEditForm({ ...editForm, honors: ev.target.value.split(',').map((h: string) => h.trim()).filter(Boolean) })} style={{ minWidth: 280 }} />
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <button onClick={() => {
                        axios.put(`${API}/education/${e.id}`, editForm).then(() => {
                          setEditingId(null);
                          setEditForm(null);
                          axios.get(`${API}/education/user/1`).then((r) => setItems(r.data));
                        });
                      }}>Save</button>{' '}
                      <button onClick={() => { setEditingId(null); setEditForm(null); }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <strong>{e.degree}</strong> — {e.institution}
                        <div style={{ color: '#6b7280' }}>{e.fieldOfStudy}</div>
                        <div>{e.startDate?.slice(0,10)} - {e.endDate ? e.endDate.slice(0,10) : 'Ongoing'} {e.ongoing && <span style={{ marginLeft: 8, padding: '2px 6px', background: '#fef3c7', borderRadius: 4 }} title="Ongoing">In progress</span>}</div>
                        {e.showGpa && e.gpa && <div><strong>GPA:</strong> {e.gpa}</div>}
                        {e.honors?.length > 0 && (
                          <div style={{ marginTop: 6 }}>
                            {e.honors.map((h: string, i: number) => (
                              <span key={i} style={{ display: 'inline-block', background: '#e0f2fe', color: '#075985', padding: '2px 8px', borderRadius: 999, marginRight: 6, marginBottom: 4 }}>{h}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <button onClick={() => { setEditingId(e.id); setEditForm({ ...e }); }}>Edit</button>
                      </div>
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <button onClick={() => {
                        if (!confirm('Delete this education entry?')) return;
                        axios.delete(`${API}/education/${e.id}`).then(() => axios.get(`${API}/education/user/1`).then((r) => setItems(r.data)));
                      }}>Delete</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Simple timeline view */}
        <div>
          <h3>Timeline</h3>
          <div style={{ position: 'relative', paddingLeft: 24 }}>
            <div style={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 2, background: '#e5e7eb' }} />
            {sorted.map((e, idx) => (
              <div key={e.id} style={{ position: 'relative', marginBottom: 16 }}>
                <div style={{ position: 'absolute', left: 0, top: 4, width: 10, height: 10, background: e.endDate ? '#10b981' : '#f59e0b', borderRadius: '50%' }} />
                <div style={{ marginLeft: 16 }}>
                  <div style={{ fontWeight: 600 }}>{e.degree} <span style={{ color: '#6b7280' }}>@ {e.institution}</span></div>
                  <div style={{ color: '#6b7280', fontSize: 12 }}>{e.startDate?.slice(0,10)} - {e.endDate ? e.endDate.slice(0,10) : 'Present'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
