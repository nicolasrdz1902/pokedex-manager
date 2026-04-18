const fetch = require('node-fetch');

const POKEAPI = 'https://pokeapi.co/api/v2';

function normalizePokemon(data) {
  return {
    id: data.id,
    name: data.name,
    sprite:
      data.sprites.other['official-artwork'].front_default ||
      data.sprites.front_default,
    types: data.types.map((t) => t.type.name),
    stats: data.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
    height: data.height,
    weight: data.weight,
  };
}

async function searchPokemon(req, res) {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'name query param required' });

  try {
    const response = await fetch(`${POKEAPI}/pokemon/${name.toLowerCase().trim()}`);
    if (!response.ok) return res.status(404).json({ error: 'Pokémon not found' });
    const data = await response.json();
    res.json(normalizePokemon(data));
  } catch {
    res.status(500).json({ error: 'Failed to reach PokéAPI' });
  }
}

async function getPokemonList(req, res) {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const offset = parseInt(req.query.offset) || 0;

  try {
    const listRes = await fetch(`${POKEAPI}/pokemon?limit=${limit}&offset=${offset}`);
    const listData = await listRes.json();

    const pokemon = await Promise.all(
      listData.results.map(async (p) => {
        const r = await fetch(p.url);
        const d = await r.json();
        return normalizePokemon(d);
      })
    );

    res.json({ count: listData.count, pokemon });
  } catch {
    res.status(500).json({ error: 'Failed to reach PokéAPI' });
  }
}

module.exports = { searchPokemon, getPokemonList };
