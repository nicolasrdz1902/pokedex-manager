const express = require('express');
const { searchPokemon, getPokemonList } = require('../controllers/pokemonController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/search', auth, searchPokemon);
router.get('/list', auth, getPokemonList);

module.exports = router;
