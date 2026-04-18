import styles from './PokemonCard.module.css';

const typeColors = {
  fire: '#f08030', water: '#6890f0', grass: '#78c850', electric: '#f8d030',
  psychic: '#f85888', ice: '#98d8d8', dragon: '#7038f8', dark: '#705848',
  fairy: '#ee99ac', normal: '#a8a878', fighting: '#c03028', flying: '#a890f0',
  poison: '#a040a0', ground: '#e0c068', rock: '#b8a038', bug: '#a8b820',
  ghost: '#705898', steel: '#b8b8d0',
};

const SHOWN_STATS = ['hp', 'attack', 'defense', 'speed'];
const STAT_LABELS = { hp: 'HP', attack: 'Atk', defense: 'Def', speed: 'Spd' };
const STAT_COLORS = { hp: '#78c850', attack: '#f08030', defense: '#6890f0', speed: '#f8d030' };

export default function PokemonCard({ pokemon, inCollection, onAdd, onRemove }) {
  const displayStats = pokemon.stats
    ? pokemon.stats.filter((s) => SHOWN_STATS.includes(s.name))
    : [];

  return (
    <div className={styles.card}>
      <img
        src={pokemon.pokemon_sprite || pokemon.sprite}
        alt={pokemon.pokemon_name || pokemon.name}
        className={styles.sprite}
      />
      <div className={styles.info}>
        <span className={styles.id}>#{String(pokemon.pokemon_id || pokemon.id).padStart(3, '0')}</span>
        <h3 className={styles.name}>{pokemon.pokemon_name || pokemon.name}</h3>
        {pokemon.types && (
          <div className={styles.types}>
            {pokemon.types.map((t) => (
              <span
                key={t}
                className={styles.type}
                style={{ background: typeColors[t] || '#888' }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
        {displayStats.length > 0 && (
          <div className={styles.stats}>
            {displayStats.map((s) => (
              <div key={s.name} className={styles.statRow}>
                <span className={styles.statLabel}>{STAT_LABELS[s.name]}</span>
                <div className={styles.statBarBg}>
                  <div
                    className={styles.statBarFill}
                    style={{
                      width: `${Math.round((s.value / 255) * 100)}%`,
                      background: STAT_COLORS[s.name],
                    }}
                  />
                </div>
                <span className={styles.statValue}>{s.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className={styles.actions}>
        {inCollection ? (
          <button
            className={`${styles.btn} ${styles.remove}`}
            onClick={() => onRemove(pokemon.pokemon_id || pokemon.id)}
          >
            Remove
          </button>
        ) : (
          <button
            className={`${styles.btn} ${styles.add}`}
            onClick={() => onAdd(pokemon)}
          >
            + Add
          </button>
        )}
      </div>
    </div>
  );
}
