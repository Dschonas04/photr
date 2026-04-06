import { Link, useNavigate } from 'react-router-dom';

const styles: Record<string, React.CSSProperties> = {
  nav: {
    background: '#6366f1',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    height: '56px',
    boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
  },
  logo: { fontWeight: 700, fontSize: '1.3rem', color: '#fff', textDecoration: 'none' },
  links: { display: 'flex', gap: '1.2rem', alignItems: 'center' },
  link: { color: '#e0e7ff', textDecoration: 'none', fontWeight: 500 },
  btn: {
    background: '#fff',
    color: '#6366f1',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 16px',
    cursor: 'pointer',
    fontWeight: 600,
  },
};

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  function logout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>📒 Scrapebook</Link>
      <div style={styles.links}>
        {token ? (
          <>
            <Link to="/dashboard" style={styles.link}>Mein Dashboard</Link>
            <Link to="/scrapbooks/new" style={styles.link}>+ Neu</Link>
            <button style={styles.btn} onClick={logout}>Abmelden</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Anmelden</Link>
            <Link to="/register" style={styles.link}>Registrieren</Link>
          </>
        )}
      </div>
    </nav>
  );
}
