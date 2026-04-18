import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.brand}>PokéDex Manager</Link>
      {user ? (
        <div className={styles.links}>
          <Link to="/search">Search</Link>
          <Link to="/collection">My Collection</Link>
          <span className={styles.username}>{user.username}</span>
          <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
        </div>
      ) : (
        <div className={styles.links}>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      )}
    </nav>
  );
}
