require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./models/db');

const authRoutes = require('./routes/auth');
const pokemonRoutes = require('./routes/pokemon');
const collectionRoutes = require('./routes/collection');
const aiRoutes = require('./routes/ai');

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/pokemon', pokemonRoutes);
app.use('/api/collection', collectionRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
