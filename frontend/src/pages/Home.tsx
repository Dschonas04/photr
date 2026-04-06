import { useEffect, useState } from 'react';
import { scrapbooks as api } from '../api/client';
import type { Scrapbook } from '../types';
import ScrapbookCard from '../components/ScrapbookCard';

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: '1100px', margin: '0 auto', padding: '3rem 1.5rem' },
  hero: { textAlign: 'center', marginBottom: '3rem' },
  h1: { fontSize: '2.5rem', fontWeight: 800, color: '#6366f1', marginBottom: '0.75rem' },
  sub: { color: '#64748b', fontSize: '1.1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' },
};

export default function Home() {
  const [books, setBooks] = useState<Scrapbook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listPublic()
      .then(setBooks)
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.h1}>Willkommen bei Scrapebook 📒</h1>
        <p style={styles.sub}>Erstelle und teile deine digitalen Scrapbooks</p>
      </div>
      {loading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8' }}>Lädt...</p>
      ) : books.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#94a3b8' }}>Noch keine öffentlichen Scrapbooks vorhanden.</p>
      ) : (
        <div style={styles.grid}>
          {books.map((b) => <ScrapbookCard key={b.id} scrapbook={b} />)}
        </div>
      )}
    </div>
  );
}
