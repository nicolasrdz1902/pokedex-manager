import styles from './PokemonCard.module.css';

const typeCardGradients = {
  fire:     'linear-gradient(135deg, rgba(240,128,48,0.12) 0%, #fff 55%)',
  water:    'linear-gradient(135deg, rgba(104,144,240,0.12) 0%, #fff 55%)',
  grass:    'linear-gradient(135deg, rgba(120,200,80,0.12) 0%, #fff 55%)',
  electric: 'linear-gradient(135deg, rgba(248,208,48,0.14) 0%, #fff 55%)',
  psychic:  'linear-gradient(135deg, rgba(248,88,136,0.11) 0%, #fff 55%)',
  ice:      'linear-gradient(135deg, rgba(152,216,216,0.14) 0%, #fff 55%)',
  dragon:   'linear-gradient(135deg, rgba(112,56,248,0.10) 0%, #fff 55%)',
  dark:     'linear-gradient(135deg, rgba(112,88,72,0.11) 0%, #fff 55%)',
  fairy:    'linear-gradient(135deg, rgba(238,153,172,0.12) 0%, #fff 55%)',
  normal:   'linear-gradient(135deg, rgba(168,168,120,0.10) 0%, #fff 55%)',
  fighting: 'linear-gradient(135deg, rgba(192,48,40,0.11) 0%, #fff 55%)',
  flying:   'linear-gradient(135deg, rgba(168,144,240,0.11) 0%, #fff 55%)',
  poison:   'linear-gradient(135deg, rgba(160,64,160,0.10) 0%, #fff 55%)',
  ground:   'linear-gradient(135deg, rgba(224,192,104,0.13) 0%, #fff 55%)',
  rock:     'linear-gradient(135deg, rgba(184,160,56,0.11) 0%, #fff 55%)',
  bug:      'linear-gradient(135deg, rgba(168,184,32,0.11) 0%, #fff 55%)',
  ghost:    'linear-gradient(135deg, rgba(112,88,152,0.10) 0%, #fff 55%)',
  steel:    'linear-gradient(135deg, rgba(184,184,208,0.13) 0%, #fff 55%)',
};

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

export default function PokemonCard({ pokemon, inCollection, onAdd, onRemove, officialArtwork = false }) {
  const displayStats = pokemon.stats
    ? pokemon.stats.filter((s) => SHOWN_STATS.includes(s.name))
    : [];

  const primaryType = pokemon.types?.[0];
  const cardGradient = typeCardGradients[primaryType] || 'linear-gradient(135deg, rgba(200,200,200,0.08) 0%, #fff 55%)';

  return (
    <div className={styles.card} style={{ background: cardGradient }}>
      <div className={styles.spriteWrap}>
        <img
          src={
            officialArtwork
              ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.pokemon_id || pokemon.id}.png`
              : (pokemon.sprite || pokemon.pokemon_sprite)
          }
          onError={officialArtwork ? (e) => { e.target.src = pokemon.pokemon_sprite || pokemon.sprite; } : undefined}
          alt={pokemon.pokemon_name || pokemon.name}
          className={styles.sprite}
        />
      </div>
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
