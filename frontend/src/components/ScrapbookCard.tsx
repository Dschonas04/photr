import type { Scrapbook } from '../types';
import { Link } from 'react-router-dom';

const cardStyle: React.CSSProperties = {
  borderRadius: '12px',
  padding: '1.5rem',
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
  transition: 'transform 0.15s',
  cursor: 'pointer',
  textDecoration: 'none',
  position: 'relative',
};

interface Props {
  scrapbook: Scrapbook;
  onDelete?: (id: number) => void;
}

export default function ScrapbookCard({ scrapbook, onDelete }: Props) {
  return (
    <Link
      to={`/scrapbooks/${scrapbook.id}`}
      style={{ ...cardStyle, background: scrapbook.cover_color }}
    >
      <span style={{ fontSize: '2rem' }}>📒</span>
      <strong style={{ fontSize: '1.1rem' }}>{scrapbook.title}</strong>
      {scrapbook.description && (
        <p style={{ opacity: 0.85, fontSize: '0.9rem' }}>{scrapbook.description}</p>
      )}
      <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
        {scrapbook.is_public ? '🌍 Öffentlich' : '🔒 Privat'}
      </span>
      {onDelete && (
        <button
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            background: 'rgba(255,255,255,0.25)',
            border: 'none',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            cursor: 'pointer',
            color: '#fff',
            fontWeight: 700,
          }}
          onClick={(e) => {
            e.preventDefault();
            onDelete(scrapbook.id);
          }}
        >
          ×
        </button>
      )}
    </Link>
  );
}
