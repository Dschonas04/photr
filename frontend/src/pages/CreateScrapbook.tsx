import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { scrapbooks as api } from '../api/client';

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444'];

const styles: Record<string, React.CSSProperties> = {
  wrapper: { minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { background: '#fff', borderRadius: '16px', padding: '2.5rem', boxShadow: '0 4px 24px rgba(99,102,241,0.1)', width: '100%', maxWidth: '480px' },
  h2: { fontSize: '1.8rem', fontWeight: 700, color: '#6366f1', marginBottom: '1.5rem', textAlign: 'center' },
  label: { display: 'block', marginBottom: '0.25rem', fontWeight: 500, color: '#374151' },
  input: { width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '1rem', marginBottom: '1rem', outline: 'none' },
  textarea: { width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '1rem', marginBottom: '1rem', outline: 'none', resize: 'vertical', minHeight: '80px' },
  btn: { width: '100%', padding: '0.75rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' },
  err: { color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' },
  colorRow: { display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' },
  checkRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' },
};

const colorDot = (selected: boolean, color: string): React.CSSProperties => ({
  width: '32px', height: '32px', borderRadius: '50%', background: color, cursor: 'pointer',
  border: selected ? '3px solid #1a1a2e' : '3px solid transparent', outline: 'none',
});

export default function CreateScrapbook() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', cover_color: COLORS[0], is_public: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const sb = await api.create(form);
      navigate(`/scrapbooks/${sb.id}`);
    } catch {
      setError('Scrapbook konnte nicht erstellt werden.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.h2}>Neues Scrapbook</h2>
        {error && <p style={styles.err}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Titel</label>
          <input style={styles.input} required value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <label style={styles.label}>Beschreibung</label>
          <textarea style={styles.textarea} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <label style={styles.label}>Cover-Farbe</label>
          <div style={styles.colorRow}>
            {COLORS.map((c) => (
              <button key={c} type="button" style={colorDot(form.cover_color === c, c)}
                onClick={() => setForm({ ...form, cover_color: c })} />
            ))}
          </div>
          <div style={styles.checkRow}>
            <input type="checkbox" id="public" checked={form.is_public}
              onChange={(e) => setForm({ ...form, is_public: e.target.checked })} />
            <label htmlFor="public" style={{ cursor: 'pointer' }}>Öffentlich sichtbar</label>
          </div>
          <button style={styles.btn} disabled={loading}>
            {loading ? 'Erstelle...' : 'Scrapbook erstellen'}
          </button>
        </form>
      </div>
    </div>
  );
}
