const express = require('express');
const auth = require('../middleware/auth');
const { getRecommendations, getFunFact, comparePokemon } = require('../controllers/aiController');

const router = express.Router();

router.use(auth);

router.post('/recommendations', getRecommendations);
router.get('/funfact/:pokemonName', getFunFact);
router.post('/compare', comparePokemon);

module.exports = router;
