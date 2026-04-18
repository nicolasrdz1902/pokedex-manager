import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Home.module.css';

export default function Home() {
  const { user } = useAuth();
  return (
    <div className={styles.hero}>
      <h1 className={styles.title}>PokéDex Manager</h1>
      <p className={styles.sub}>Search, collect, and identify Pokémon from your cards.</p>
      <div className={styles.actions}>
        {user ? (
          <>
            <Link to="/search" className={styles.primary}>Browse Pokémon</Link>
            <Link to="/collection" className={styles.secondary}>My Collection</Link>
          </>
        ) : (
          <>
            <Link to="/register" className={styles.primary}>Get Started</Link>
            <Link to="/login" className={styles.secondary}>Login</Link>
          </>
        )}
      </div>
    </div>
  );
}
