import axios from 'axios';

// Use the local server URL instead of the public API
const API_URL = 'http://localhost:3002/api/v2';


export const capitalizeFirstLetter = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

export const pokeApi = {
  getAllPokemon: async () => {
    try {
      // Try to load from cache first
      const cachedData = loadFromCache();
      if (cachedData?.pokemon) {
        return cachedData.pokemon;
      }

      // Fetch from local server
      const response = await axios.get(`${API_URL}/pokemon?limit=151`);
      return response.data.results;
    } catch (error) {
      console.error('Error fetching Pokemon:', error);
      throw error;
    }
  },

  getPokemonByName: async (name: string) => {
    try {
      // Try to load from cache first
      const cachedData = loadFromCache();
      if (cachedData?.pokemonDetails?.[name]) {
        return cachedData.pokemonDetails[name];
      }

      // Fetch from local server
      const response = await axios.get(`${API_URL}/pokemon/${name}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching Pokemon ${name}:`, error);
      throw error;
    }
  }
};

// Your existing cache functions
function loadFromCache() {
  try {
    const cached = localStorage.getItem('pokemon_cache');
    return cached ? JSON.parse(cached) : null;
  } catch (e) {
    console.error('Error loading from cache:', e);
    return null;
  }
}

function saveToCache(data: any) {
  try {
    localStorage.setItem('pokemon_cache', JSON.stringify({ pokemon: data }));
  } catch (e) {
    console.error('Error saving to cache:', e);
  }
}