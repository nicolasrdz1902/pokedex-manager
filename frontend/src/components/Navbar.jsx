import { Link, useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function toggleMusic() {
    const audio = audioRef.current;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  }

  return (
    <nav className={styles.nav}>
      <audio ref={audioRef} src="/pokemon-song.mp3" loop onCanPlay={(e) => { e.target.volume = 0.4; }} />
      <Link to="/" className={styles.brand}>PokéDex Manager</Link>
      {user ? (
        <div className={styles.links}>
          <Link to="/search">Search</Link>
          <Link to="/collection">My Collection</Link>
          <Link to="/assistant">AI Assistant</Link>
          <span className={styles.username}>{user.username}</span>
          <button onClick={toggleMusic} className={styles.musicBtn}>{playing ? '🔇' : '🎵'}</button>
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
