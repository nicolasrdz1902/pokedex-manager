# PokéDex Manager

A full-stack web app to search Pokémon, manage a personal collection, and identify Pokémon from card photos using AI.

## Features

- **Authentication** — register and login with JWT-based sessions
- **Pokémon search** — browse and search via PokéAPI
- **Collection management** — add/remove Pokémon to your personal list
- **Base stats** — every Pokémon card shows HP, Attack, Defense, and Speed bars
- **Card scanner** — upload a photo of a Pokémon card and GPT-4o identifies it automatically
- **AI Assistant** — GPT-4o powered recommendations, fun facts, and smart comparisons (see below)

## Stack

| Layer    | Technology                       |
|----------|----------------------------------|
| Frontend | React + Vite, CSS Modules        |
| Backend  | Node.js + Express                |
| Database | SQLite (via sql.js, zero setup)  |
| Auth     | JWT + bcrypt                     |
| AI       | OpenAI GPT-4o (vision)           |

## Local Setup

### Prerequisites

- Node.js v18+
- An OpenAI API key (for the card scanner feature)

### 1. Clone / enter the project

```bash
git clone https://github.com/nicolasrdz1902/pokedex-manager.git
cd pokedex-manager
```

### 2. Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and set your values:

```
PORT=3001
JWT_SECRET=some_long_random_string
OPENAI_API_KEY=sk-...
```

Install and start:

```bash
npm install
npm run dev      # development (nodemon)
# or
npm start        # production
```

The API will be available at `http://localhost:3001`.

### 3. Frontend

```bash
cd ../frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## AI Assistant

Navigate to **AI Assistant** in the top navbar (login required). The page has three sections:

### Personalized Recommendations
Click **Get Recommendations** to have GPT-4o analyse your current collection and suggest 3 Pokémon to add next, with a specific explanation for each — covering type coverage, evolution chains, and team synergy. Works even with an empty collection.

### Pokémon Fun Facts
Type any Pokémon name into the input field (e.g. `charizard`, `mewtwo`) and click **Get Fun Fact** to receive an AI-generated curiosity about that Pokémon.

### Smart Comparison
Select two Pokémon from your collection using the dropdowns and click **Compare**. GPT-4o fetches both Pokémon's full stats from PokéAPI and returns a detailed battle analysis covering type matchups, stat strengths, weaknesses, and an overall verdict.

> **Note:** All three features require a valid `OPENAI_API_KEY` in `backend/.env`. The key is only used server-side and is never exposed to the browser.

## API Reference

| Method | Path                        | Auth | Description                        |
|--------|-----------------------------|------|------------------------------------|
| POST   | /api/auth/register          | No   | Create account                     |
| POST   | /api/auth/login             | No   | Login, receive JWT                 |
| GET    | /api/pokemon/search?name=   | Yes  | Search a Pokémon by name           |
| GET    | /api/pokemon/list           | Yes  | Paginated list (limit, offset)     |
| GET    | /api/collection             | Yes  | Get user's collection              |
| POST   | /api/collection             | Yes  | Add Pokémon to collection          |
| DELETE | /api/collection/:pokemonId  | Yes  | Remove from collection             |
| POST   | /api/collection/identify    | Yes  | Upload image → identify + add      |
| POST   | /api/ai/recommendations     | Yes  | AI-suggested Pokémon based on collection |
| GET    | /api/ai/funfact/:name       | Yes  | AI fun fact about a Pokémon        |
| POST   | /api/ai/compare             | Yes  | AI battle comparison of two Pokémon |

## Project Structure

```
pokedex-manager/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Business logic (auth, pokemon, collection, image, ai)
│   │   ├── middleware/    # JWT auth guard
│   │   ├── models/        # Database initialization and query helpers
│   │   └── routes/        # Express route declarations (auth, pokemon, collection, ai)
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/    # Navbar, PokemonCard, UploadModal
    │   ├── context/       # AuthContext (JWT state)
    │   ├── pages/         # Home, Login, Register, Search, Collection, AIAssistant
    │   └── services/      # Axios instance with auth interceptor
    └── package.json
```

## Notes

- The SQLite database file (`backend/database.sqlite`) is created automatically on first run.
- The OpenAI API key is only used server-side; it is never exposed to the browser.
- The card scanner requires a valid `OPENAI_API_KEY`. Without it, the endpoint returns a 502 error.
