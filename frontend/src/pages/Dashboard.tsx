import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { scrapbooks as api } from '../api/client';
import type { Scrapbook } from '../types';
import ScrapbookCard from '../components/ScrapbookCard';

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  h1: { fontSize: '1.8rem', fontWeight: 700, color: '#1a1a2e' },
  btn: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.2rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'none' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' },
  empty: { textAlign: 'center', color: '#94a3b8', padding: '3rem 0' },
};

export default function Dashboard() {
  const [books, setBooks] = useState<Scrapbook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.list()
      .then(setBooks)
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number) {
    if (!confirm('Sammlung wirklich löschen?')) return;
    await api.delete(id);
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.h1}>Meine Sammlungen</h1>
        <Link to="/scrapbooks/new" style={styles.btn}>+ Neue Sammlung</Link>
      </div>
      {loading ? (
        <p style={styles.empty}>Lädt...</p>
      ) : books.length === 0 ? (
        <div style={styles.empty}>
          <p>Du hast noch keine Sammlungen.</p>
          <Link to="/scrapbooks/new" style={{ color: '#6366f1', fontWeight: 600 }}>Jetzt erstellen →</Link>
        </div>
      ) : (
        <div style={styles.grid}>
          {books.map((b) => (
            <ScrapbookCard key={b.id} scrapbook={b} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
