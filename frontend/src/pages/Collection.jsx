import { useState, useEffect } from 'react';
import api from '../services/api';
import PokemonCard from '../components/PokemonCard';
import UploadModal from '../components/UploadModal';
import styles from './Collection.module.css';

export default function Collection() {
  const [collection, setCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { loadCollection(); }, []);

  async function loadCollection() {
    try {
      const { data } = await api.get('/collection');
      setCollection(data);
      setLoading(false);
      const enriched = await Promise.all(
        data.map(async (item) => {
          try {
            const { data: full } = await api.get(`/pokemon/search?name=${item.pokemon_name}`);
            return { ...item, types: full.types, stats: full.stats };
          } catch {
            return item;
          }
        })
      );
      setCollection(enriched);
    } catch {
      setLoading(false);
    }
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function handleRemove(pokemonId) {
    try {
      await api.delete(`/collection/${pokemonId}`);
      setCollection((prev) => prev.filter((p) => Number(p.pokemon_id) !== Number(pokemonId)));
      showToast('Removed from collection');
    } catch {
      showToast('Failed to remove');
    }
  }

  function handleIdentified(pokemon) {
    setCollection((prev) => {
      if (prev.some((p) => Number(p.pokemon_id) === Number(pokemon.id))) return prev;
      return [
        { pokemon_id: pokemon.id, pokemon_name: pokemon.name, pokemon_sprite: pokemon.sprite, added_at: new Date().toISOString() },
        ...prev,
      ];
    });
    showToast(`${pokemon.name} identified and added!`);
  }

  return (
    <div className={styles.page}>
      {toast && <div className={styles.toast}>{toast}</div>}
      <div className={styles.header}>
        <h1>My Collection <span className={styles.count}>({collection.length})</span></h1>
        <button onClick={() => setShowUpload(true)} className={styles.uploadBtn}>
          Scan Card
        </button>
      </div>

      {loading && <p className={styles.loading}>Loading...</p>}

      {!loading && collection.length === 0 && (
        <div className={styles.empty}>
          <p>Your collection is empty.</p>
          <p>Search for Pokémon to add them, or scan a card!</p>
        </div>
      )}

      <div className={styles.grid}>
        {collection.map((p) => (
          <PokemonCard
            key={p.pokemon_id}
            pokemon={p}
            inCollection
            onRemove={handleRemove}
            officialArtwork
          />
        ))}
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={(pokemon) => {
            handleIdentified(pokemon);
            setShowUpload(false);
          }}
        />
      )}
    </div>
  );
}
