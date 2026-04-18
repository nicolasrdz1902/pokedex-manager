const OpenAI = require('openai');
const fetch = require('node-fetch');
const db = require('../models/db');

const POKEAPI = 'https://pokeapi.co/api/v2';

function makeClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

async function getRecommendations(req, res) {
  const items = db
    .prepare('SELECT pokemon_name FROM collection WHERE user_id = ?')
    .all(req.user.id);
  const names = items.map((i) => i.pokemon_name);

  const client = makeClient();

  let prompt;
  if (names.length === 0) {
    prompt =
      'A new Pokémon trainer has an empty collection. Suggest 3 great starter Pokémon and explain why each is a good pick. Respond with valid JSON: {"recommendations": [{"name": "lowercase_pokemon_name", "reason": "explanation"}, ...]}';
  } else {
    prompt = `A Pokémon trainer has these Pokémon in their collection: ${names.join(', ')}. Suggest 3 Pokémon they should add next. Consider type coverage, evolution chains, and team synergy. Respond with valid JSON: {"recommendations": [{"name": "lowercase_pokemon_name", "reason": "explanation"}, ...]}`;
  }

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 500,
    });
    const result = JSON.parse(response.choices[0].message.content);
    res.json(result);
  } catch {
    res.status(502).json({ error: 'Failed to get recommendations from OpenAI' });
  }
}

async function getFunFact(req, res) {
  const { pokemonName } = req.params;
  const client = makeClient();

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: `Tell me one interesting and surprising fun fact about the Pokémon ${pokemonName}. Keep it to 2-3 sentences. Be specific and informative.`,
        },
      ],
      max_tokens: 200,
    });
    res.json({ fact: response.choices[0].message.content.trim() });
  } catch {
    res.status(502).json({ error: 'Failed to get fun fact from OpenAI' });
  }
}

async function comparePokemon(req, res) {
  const { pokemon1, pokemon2 } = req.body;
  if (!pokemon1 || !pokemon2) {
    return res.status(400).json({ error: 'pokemon1 and pokemon2 are required' });
  }
  if (pokemon1.toLowerCase() === pokemon2.toLowerCase()) {
    return res.status(400).json({ error: 'Select two different Pokémon to compare' });
  }

  let d1, d2;
  try {
    const [r1, r2] = await Promise.all([
      fetch(`${POKEAPI}/pokemon/${pokemon1.toLowerCase()}`),
      fetch(`${POKEAPI}/pokemon/${pokemon2.toLowerCase()}`),
    ]);
    if (!r1.ok || !r2.ok) {
      return res.status(404).json({ error: 'One or both Pokémon not found in PokéAPI' });
    }
    [d1, d2] = await Promise.all([r1.json(), r2.json()]);
  } catch {
    return res.status(502).json({ error: 'Failed to fetch Pokémon data from PokéAPI' });
  }

  const fmt = (d) =>
    d.stats.map((s) => `${s.stat.name}: ${s.base_stat}`).join(', ');
  const types = (d) => d.types.map((t) => t.type.name).join(', ');

  const prompt = `Compare these two Pokémon in a detailed battle analysis:

${pokemon1} — Types: ${types(d1)} | Stats: ${fmt(d1)}
${pokemon2} — Types: ${types(d2)} | Stats: ${fmt(d2)}

Cover: type matchups, stat comparison, strengths, weaknesses, and an overall verdict on which excels in competitive play. Write in clear readable paragraphs.`;

  const client = makeClient();
  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600,
    });
    res.json({ comparison: response.choices[0].message.content.trim() });
  } catch {
    res.status(502).json({ error: 'Failed to get comparison from OpenAI' });
  }
}

module.exports = { getRecommendations, getFunFact, comparePokemon };
