import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../api/client';

const styles: Record<string, React.CSSProperties> = {
  wrapper: { minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { background: '#fff', borderRadius: '16px', padding: '2.5rem', boxShadow: '0 4px 24px rgba(99,102,241,0.1)', width: '100%', maxWidth: '400px' },
  h2: { fontSize: '1.8rem', fontWeight: 700, color: '#6366f1', marginBottom: '1.5rem', textAlign: 'center' },
  label: { display: 'block', marginBottom: '0.25rem', fontWeight: 500, color: '#374151' },
  input: { width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '1rem', marginBottom: '1rem', outline: 'none' },
  btn: { width: '100%', padding: '0.75rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' },
  err: { color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' },
  link: { display: 'block', textAlign: 'center', marginTop: '1rem', color: '#6366f1' },
};

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await auth.login(form);
      localStorage.setItem('token', res.token);
      navigate('/dashboard');
    } catch {
      setError('Ungültige E-Mail oder Passwort');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.h2}>Anmelden</h2>
        {error && <p style={styles.err}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>E-Mail</label>
          <input style={styles.input} type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <label style={styles.label}>Passwort</label>
          <input style={styles.input} type="password" required value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button style={styles.btn} disabled={loading}>
            {loading ? 'Lädt...' : 'Anmelden'}
          </button>
        </form>
        <Link to="/register" style={styles.link}>Noch kein Konto? Registrieren</Link>
      </div>
    </div>
  );
}
