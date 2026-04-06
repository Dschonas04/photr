import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { scrapbooks as sbApi, pages as pageApi } from '../api/client';
import type { Scrapbook, Page } from '../types';

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.5rem' },
  header: { borderRadius: '16px', padding: '2rem', color: '#fff', marginBottom: '2rem', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' },
  h1: { fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' },
  badge: { display: 'inline-block', background: 'rgba(255,255,255,0.25)', borderRadius: '20px', padding: '2px 12px', fontSize: '0.8rem' },
  addForm: { background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: '2rem' },
  label: { display: 'block', marginBottom: '0.25rem', fontWeight: 500, color: '#374151' },
  input: { width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '1rem', marginBottom: '0.75rem', outline: 'none' },
  textarea: { width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '1rem', marginBottom: '0.75rem', outline: 'none', resize: 'vertical', minHeight: '80px' },
  btn: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.4rem', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' },
  pageCard: { background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: '1rem', position: 'relative' },
  deleteBtn: { position: 'absolute', top: '1rem', right: '1rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', fontWeight: 600 },
  h2: { fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' },
  img: { maxWidth: '100%', borderRadius: '8px', marginTop: '0.75rem' },
};

export default function ViewScrapbook() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scrapbook, setScrapbook] = useState<Scrapbook | null>(null);
  const [pagesList, setPagesList] = useState<Page[]>([]);
  const [form, setForm] = useState({ title: '', content: '', image_url: '' });
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!id) return;
    const numId = parseInt(id, 10);
    Promise.all([sbApi.get(numId), pageApi.list(numId)])
      .then(([sb, pgs]) => { setScrapbook(sb); setPagesList(pgs); })
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  async function handleAddPage(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setAdding(true);
    try {
      const p = await pageApi.create(parseInt(id, 10), {
        ...form,
        page_order: pagesList.length,
      });
      setPagesList((prev) => [...prev, p]);
      setForm({ title: '', content: '', image_url: '' });
    } finally {
      setAdding(false);
    }
  }

  async function handleDeletePage(pageId: number) {
    if (!id || !confirm('Seite löschen?')) return;
    await pageApi.delete(parseInt(id, 10), pageId);
    setPagesList((prev) => prev.filter((p) => p.id !== pageId));
  }

  if (loading) return <p style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Lädt...</p>;
  if (!scrapbook) return null;

  return (
    <div style={styles.container}>
      <div style={{ ...styles.header, background: scrapbook.cover_color }}>
        <h1 style={styles.h1}>{scrapbook.title}</h1>
        {scrapbook.description && <p style={{ opacity: 0.9 }}>{scrapbook.description}</p>}
        <span style={styles.badge}>{scrapbook.is_public ? '🌍 Öffentlich' : '🔒 Privat'}</span>
      </div>

      <div style={styles.addForm}>
        <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: '#1a1a2e' }}>+ Neue Seite hinzufügen</h3>
        <form onSubmit={handleAddPage}>
          <label style={styles.label}>Seitentitel</label>
          <input style={styles.input} required value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <label style={styles.label}>Inhalt</label>
          <textarea style={styles.textarea} value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })} />
          <label style={styles.label}>Bild-URL (optional)</label>
          <input style={styles.input} value={form.image_url} placeholder="https://..."
            onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          <button style={styles.btn} disabled={adding}>
            {adding ? 'Hinzufügen...' : 'Seite hinzufügen'}
          </button>
        </form>
      </div>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem' }}>
        Seiten ({pagesList.length})
      </h2>
      {pagesList.length === 0 && (
        <p style={{ color: '#94a3b8' }}>Noch keine Seiten vorhanden. Füge die erste hinzu!</p>
      )}
      {pagesList.map((p) => (
        <div key={p.id} style={styles.pageCard}>
          <h2 style={styles.h2}>{p.title}</h2>
          {p.content && <p style={{ color: '#4b5563', lineHeight: 1.6 }}>{p.content}</p>}
          {p.image_url && <img src={p.image_url} alt={p.title} style={styles.img} />}
          <button style={styles.deleteBtn} onClick={() => handleDeletePage(p.id)}>Löschen</button>
        </div>
      ))}
    </div>
  );
}
