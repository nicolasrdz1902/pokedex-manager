const OpenAI = require('openai');
const fetch = require('node-fetch');
const db = require('../models/db');

const POKEAPI = 'https://pokeapi.co/api/v2';

async function identifyAndAdd(req, res) {
  if (!req.file) return res.status(400).json({ error: 'Image file required' });

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const base64 = req.file.buffer.toString('base64');
  const mimeType = req.file.mimetype;

  let pokemonName;
  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Look at this image of a Pokémon or Pokémon card. Return ONLY a valid JSON object with this shape: {"pokemon_name": "<lowercase name as used in PokéAPI, e.g. pikachu, charizard, bulbasaur>"}. If you cannot identify a Pokémon, return {"pokemon_name": null}. No markdown, no explanation.',
            },
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64}` },
            },
          ],
        },
      ],
      max_tokens: 100,
    });

    const content = response.choices[0].message.content.trim();
    const parsed = JSON.parse(content);
    pokemonName = parsed.pokemon_name;
  } catch {
    return res.status(502).json({ error: 'Failed to analyze image with OpenAI' });
  }

  if (!pokemonName) {
    return res.status(422).json({ error: 'Could not identify a Pokémon in the image' });
  }

  let pokemonData;
  try {
    const pokeRes = await fetch(`${POKEAPI}/pokemon/${pokemonName.toLowerCase().trim()}`);
    if (!pokeRes.ok) {
      return res.status(422).json({ error: `OpenAI identified "${pokemonName}" but it was not found in PokéAPI` });
    }
    const d = await pokeRes.json();
    pokemonData = {
      id: d.id,
      name: d.name,
      sprite: d.sprites.other['official-artwork'].front_default || d.sprites.front_default,
    };
  } catch {
    return res.status(500).json({ error: 'Failed to fetch Pokémon data from PokéAPI' });
  }

  try {
    db.prepare(
      'INSERT INTO collection (user_id, pokemon_id, pokemon_name, pokemon_sprite) VALUES (?, ?, ?, ?)'
    ).run(req.user.id, pokemonData.id, pokemonData.name, pokemonData.sprite);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({
        error: 'Pokémon already in collection',
        pokemon: pokemonData,
      });
    }
    return res.status(500).json({ error: 'Failed to save to collection' });
  }

  res.status(201).json({ identified: pokemonData.name, pokemon: pokemonData });
}

module.exports = { identifyAndAdd };
