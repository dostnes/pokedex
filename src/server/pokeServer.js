import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(cors());

// Update this path to where your PokeAPI data is stored
const POKEMON_DATA_PATH = path.join(__dirname, '../../pokemon-data');

// Log the path to verify it's correct
console.log('Pokemon data path:', POKEMON_DATA_PATH);

// Route to get all Pokemon
app.get('/api/v2/pokemon', (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '151');  // Changed from TypeScript assertion
    const pokemonList = [];
    
    // Read the pokemon directory
    const files = fs.readdirSync(path.join(POKEMON_DATA_PATH, 'pokemon'));
    
    // Sort files numerically
    const sortedFiles = files
      .filter(file => file.endsWith('.json'))
      .sort((a, b) => {
        const numA = parseInt(a.replace('.json', ''));
        const numB = parseInt(b.replace('.json', ''));
        return numA - numB;
      });
    
    // Get the requested number of Pokemon
    for (let i = 0; i < limit && i < sortedFiles.length; i++) {
      const file = sortedFiles[i];
      const data = JSON.parse(
        fs.readFileSync(path.join(POKEMON_DATA_PATH, 'pokemon', file), 'utf8')
      );
      pokemonList.push({
        name: data.name,
        url: `http://localhost:3002/api/v2/pokemon/${data.id}`
      });
    }

    res.json({
      count: pokemonList.length,
      results: pokemonList
    });
  } catch (error) {
    console.error('Error reading Pokemon list:', error);
    res.status(500).json({ error: 'Failed to load Pokemon list', details: error });
  }
});

// Route to get specific Pokemon
app.get('/api/v2/pokemon/:nameOrId', (req, res) => {
  const { nameOrId } = req.params;
  try {
    // Try by ID first
    let filePath = path.join(POKEMON_DATA_PATH, 'pokemon', `${nameOrId}.json`);
    
    // If file doesn't exist, try to find by name
    if (!fs.existsSync(filePath) && isNaN(Number(nameOrId))) {
      const files = fs.readdirSync(path.join(POKEMON_DATA_PATH, 'pokemon'));
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        const data = JSON.parse(
          fs.readFileSync(path.join(POKEMON_DATA_PATH, 'pokemon', file), 'utf8')
        );
        if (data.name === nameOrId.toLowerCase()) {
          filePath = path.join(POKEMON_DATA_PATH, 'pokemon', file);
          break;
        }
      }
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: `Pokemon ${nameOrId} not found` });
    }

    const data = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading Pokemon data:', error);
    res.status(500).json({ error: 'Failed to load Pokemon data', details: error });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Local Pokemon API running on port ${PORT}`);
});