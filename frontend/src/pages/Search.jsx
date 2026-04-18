import { useState, useEffect } from 'react';
import api from '../services/api';
import PokemonCard from '../components/PokemonCard';
import styles from './Search.module.css';

export default function Search() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [list, setList] = useState([]);
  const [collection, setCollection] = useState([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const LIMIT = 20;

  useEffect(() => {
    loadCollection();
    loadList(0);
  }, []);

  async function loadCollection() {
    try {
      const { data } = await api.get('/collection');
      setCollection(data);
    } catch {}
  }

  async function loadList(newOffset) {
    setLoading(true);
    try {
      const { data } = await api.get(`/pokemon/list?limit=${LIMIT}&offset=${newOffset}`);
      setList(data.pokemon);
      setTotal(data.count);
      setOffset(newOffset);
    } catch {
      setError('Failed to load Pokémon list');
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const { data } = await api.get(`/pokemon/search?name=${encodeURIComponent(query.trim())}`);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Pokémon not found');
    } finally {
      setLoading(false);
    }
  }

  function isInCollection(pokemonId) {
    return collection.some((c) => Number(c.pokemon_id) === Number(pokemonId));
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function handleAdd(pokemon) {
    try {
      await api.post('/collection', {
        pokemon_id: pokemon.id,
        pokemon_name: pokemon.name,
        pokemon_sprite: pokemon.sprite,
      });
      await loadCollection();
      showToast(`${pokemon.name} added to collection!`);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to add');
    }
  }

  async function handleRemove(pokemonId) {
    try {
      await api.delete(`/collection/${pokemonId}`);
      await loadCollection();
      showToast('Removed from collection');
    } catch {
      showToast('Failed to remove');
    }
  }

  const displayList = result ? [result] : list;

  return (
    <div className={styles.page}>
      {toast && <div className={styles.toast}>{toast}</div>}
      <div className={styles.searchBar}>
        <form onSubmit={handleSearch} className={styles.form}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Pokémon (e.g. pikachu)"
            className={styles.input}
          />
          <button type="submit" className={styles.searchBtn}>Search</button>
          {result && (
            <button type="button" onClick={() => { setResult(null); setQuery(''); }} className={styles.clearBtn}>
              Clear
            </button>
          )}
        </form>
        {error && <p className={styles.error}>{error}</p>}
      </div>

      {loading && <p className={styles.loading}>Loading...</p>}

      <div className={styles.grid}>
        {displayList.map((p) => (
          <PokemonCard
            key={p.id}
            pokemon={p}
            inCollection={isInCollection(p.id)}
            onAdd={handleAdd}
            onRemove={handleRemove}
          />
        ))}
      </div>

      {!result && (
        <div className={styles.pagination}>
          <button
            onClick={() => loadList(Math.max(0, offset - LIMIT))}
            disabled={offset === 0 || loading}
          >
            Previous
          </button>
          <span>{Math.floor(offset / LIMIT) + 1} / {Math.ceil(total / LIMIT)}</span>
          <button
            onClick={() => loadList(offset + LIMIT)}
            disabled={offset + LIMIT >= total || loading}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
