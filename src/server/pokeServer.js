import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const app = express();
app.use(cors());

// Get the directory path in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the cloned api-data repository
const POKEMON_DATA_PATH = path.join(__dirname, '../../pokemon-data/data/api/v2');

// Log the path to verify it's correct
console.log('PokeAPI data path:', POKEMON_DATA_PATH);

// Route to get all Pokemon
app.get('/api/v2/pokemon', (req, res) => {
  try {
    console.log('Received request for Pokemon list with query params:', req.query);
    
    const limit = parseInt(req.query.limit) || 2000;
    const offset = parseInt(req.query.offset) || 0;
    
    console.log(`Processing request with limit: ${limit}, offset: ${offset}`);
    
    // Read the pokemon index file
    const indexPath = path.join(POKEMON_DATA_PATH, 'pokemon/index.json');
    console.log(`Reading Pokemon index from: ${indexPath}`);
    
    const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    console.log(`Total Pokemon in index: ${indexData.results.length}`);
    
    // Format the response to match the API
    const results = indexData.results
      .slice(offset, offset + limit)
      .map(entry => ({
        name: entry.name,
        url: `http://localhost:3002/api/v2/pokemon/${entry.url.split('/').filter(Boolean).pop()}`
      }));
    
    console.log(`Returning ${results.length} Pokemon (from ${offset} to ${offset + results.length})`);
    
    res.json({
      count: indexData.count,
      next: offset + limit < indexData.count ? 
        `http://localhost:3002/api/v2/pokemon?offset=${offset + limit}&limit=${limit}` : null,
      previous: offset > 0 ? 
        `http://localhost:3002/api/v2/pokemon?offset=${Math.max(0, offset - limit)}&limit=${limit}` : null,
      results
    });
  } catch (error) {
    console.error('Error reading Pokemon list:', error);
    res.status(500).json({ error: 'Failed to load Pokemon list', details: error.message });
  }
});

// Route to get specific Pokemon
app.get('/api/v2/pokemon/:nameOrId', (req, res) => {
  const { nameOrId } = req.params;
  console.log(`Received request for Pokemon details: ${nameOrId}`);
  
  try {
    let filePath;
    
    // If it's a number, use it directly
    if (!isNaN(Number(nameOrId))) {
      filePath = path.join(POKEMON_DATA_PATH, `pokemon/${nameOrId}/index.json`);
      console.log(`Looking for Pokemon by ID at: ${filePath}`);
    } else {
      // If it's a name, we need to find the corresponding ID
      console.log(`Looking for Pokemon by name: ${nameOrId}`);
      const indexPath = path.join(POKEMON_DATA_PATH, 'pokemon/index.json');
      const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      const entry = indexData.results.find(p => p.name === nameOrId);
      
      if (entry) {
        const id = entry.url.split('/').filter(Boolean).pop();
        filePath = path.join(POKEMON_DATA_PATH, `pokemon/${id}/index.json`);
        console.log(`Found Pokemon ID ${id} for name ${nameOrId}, looking at: ${filePath}`);
      } else {
        console.log(`No Pokemon found with name: ${nameOrId}`);
      }
    }

    if (!filePath || !fs.existsSync(filePath)) {
      console.log(`Pokemon file not found: ${filePath}`);
      return res.status(404).json({ error: `Pokemon ${nameOrId} not found` });
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`Successfully loaded data for Pokemon: ${data.name} (ID: ${data.id})`);
    res.json(data);
  } catch (error) {
    console.error('Error reading Pokemon data:', error);
    res.status(500).json({ error: 'Failed to load Pokemon data', details: error.message });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Local Pokemon API running on port ${PORT}`);
});