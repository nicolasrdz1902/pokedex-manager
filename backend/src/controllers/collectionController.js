const db = require('../models/db');

function getCollection(req, res) {
  const items = db
    .prepare('SELECT * FROM collection WHERE user_id = ? ORDER BY added_at DESC')
    .all(req.user.id);
  res.json(items);
}

function addToCollection(req, res) {
  const { pokemon_id, pokemon_name, pokemon_sprite } = req.body;
  if (!pokemon_id || !pokemon_name) {
    return res.status(400).json({ error: 'pokemon_id and pokemon_name are required' });
  }
  try {
    const stmt = db.prepare(
      'INSERT INTO collection (user_id, pokemon_id, pokemon_name, pokemon_sprite) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(req.user.id, pokemon_id, pokemon_name, pokemon_sprite || null);
    res.status(201).json({ id: result.lastInsertRowid, pokemon_id, pokemon_name, pokemon_sprite });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Pokémon already in collection' });
    }
    res.status(500).json({ error: 'Failed to add Pokémon' });
  }
}

function removeFromCollection(req, res) {
  const { pokemonId } = req.params;
  const result = db
    .prepare('DELETE FROM collection WHERE user_id = ? AND pokemon_id = ?')
    .run(req.user.id, pokemonId);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Pokémon not in collection' });
  }
  res.json({ message: 'Removed from collection' });
}

module.exports = { getCollection, addToCollection, removeFromCollection };
