import { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './AIAssistant.module.css';

export default function AIAssistant() {
  const [collection, setCollection] = useState([]);

  const [recommendations, setRecommendations] = useState(null);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState('');

  const [factPokemon, setFactPokemon] = useState('');
  const [fact, setFact] = useState('');
  const [factLoading, setFactLoading] = useState(false);
  const [factError, setFactError] = useState('');

  const [compare1, setCompare1] = useState('');
  const [compare2, setCompare2] = useState('');
  const [comparison, setComparison] = useState('');
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState('');

  useEffect(() => {
    api.get('/collection').then(({ data }) => setCollection(data)).catch(() => {});
  }, []);

  async function handleGetRecommendations() {
    setRecLoading(true);
    setRecError('');
    try {
      const { data } = await api.post('/ai/recommendations');
      setRecommendations(data.recommendations);
    } catch {
      setRecError('Failed to get recommendations. Please try again.');
    }
    setRecLoading(false);
  }

  async function handleGetFact(e) {
    e.preventDefault();
    if (!factPokemon.trim()) return;
    setFactLoading(true);
    setFactError('');
    setFact('');
    try {
      const { data } = await api.get(`/ai/funfact/${encodeURIComponent(factPokemon.toLowerCase().trim())}`);
      setFact(data.fact);
    } catch {
      setFactError('Could not get a fun fact. Check the Pokémon name and try again.');
    }
    setFactLoading(false);
  }

  async function handleCompare(e) {
    e.preventDefault();
    if (!compare1 || !compare2) return;
    setCompareLoading(true);
    setCompareError('');
    setComparison('');
    try {
      const { data } = await api.post('/ai/compare', { pokemon1: compare1, pokemon2: compare2 });
      setComparison(data.comparison);
    } catch (err) {
      setCompareError(err.response?.data?.error || 'Failed to compare Pokémon. Please try again.');
    }
    setCompareLoading(false);
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1>AI Assistant</h1>
        <p className={styles.subtitle}>Powered by GPT-4o — personalized insights for your Pokémon journey.</p>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Personalized Recommendations</h2>
          <p>Based on your current collection, get AI suggestions for which Pokémon to add next.</p>
        </div>
        <button
          onClick={handleGetRecommendations}
          className={styles.primaryBtn}
          disabled={recLoading}
        >
          {recLoading ? 'Analyzing your collection…' : 'Get Recommendations'}
        </button>
        {recError && <p className={styles.error}>{recError}</p>}
        {recommendations && (
          <div className={styles.recGrid}>
            {recommendations.map((r, i) => (
              <div key={i} className={styles.recCard}>
                <h3 className={styles.recName}>{r.name}</h3>
                <p className={styles.recReason}>{r.reason}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Pokémon Fun Facts</h2>
          <p>Enter any Pokémon name to get an AI-generated curiosity about it.</p>
        </div>
        <form onSubmit={handleGetFact} className={styles.form}>
          <input
            value={factPokemon}
            onChange={(e) => setFactPokemon(e.target.value)}
            placeholder="e.g. charizard, mewtwo, gengar…"
            className={styles.input}
          />
          <button
            type="submit"
            className={styles.primaryBtn}
            disabled={factLoading || !factPokemon.trim()}
          >
            {factLoading ? 'Thinking…' : 'Get Fun Fact'}
          </button>
        </form>
        {factError && <p className={styles.error}>{factError}</p>}
        {fact && <div className={styles.resultBox}>{fact}</div>}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Smart Comparison</h2>
          <p>Select two Pokémon from your collection for a detailed AI-powered battle analysis.</p>
        </div>
        {collection.length < 2 ? (
          <p className={styles.emptyNote}>
            You need at least 2 Pokémon in your collection to use this feature.
          </p>
        ) : (
          <form onSubmit={handleCompare} className={styles.form}>
            <select
              value={compare1}
              onChange={(e) => setCompare1(e.target.value)}
              className={styles.select}
            >
              <option value="">First Pokémon…</option>
              {collection.map((p) => (
                <option key={p.pokemon_id} value={p.pokemon_name}>
                  {p.pokemon_name}
                </option>
              ))}
            </select>
            <span className={styles.vsLabel}>vs</span>
            <select
              value={compare2}
              onChange={(e) => setCompare2(e.target.value)}
              className={styles.select}
            >
              <option value="">Second Pokémon…</option>
              {collection
                .filter((p) => p.pokemon_name !== compare1)
                .map((p) => (
                  <option key={p.pokemon_id} value={p.pokemon_name}>
                    {p.pokemon_name}
                  </option>
                ))}
            </select>
            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={compareLoading || !compare1 || !compare2}
            >
              {compareLoading ? 'Comparing…' : 'Compare'}
            </button>
          </form>
        )}
        {compareError && <p className={styles.error}>{compareError}</p>}
        {comparison && <div className={styles.resultBox}>{comparison}</div>}
      </section>
    </div>
  );
}
