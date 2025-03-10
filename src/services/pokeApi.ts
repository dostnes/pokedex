import axios from 'axios';
import { Pokemon } from '../types/pokemon';

const API_URL = 'http://localhost:3002/api/v2';

// Utility function to capitalize the first letter of a string
export const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Add this method to fetch Pokemon by ID
export const getPokemonById = async (id: number | string): Promise<Pokemon> => {
  console.log(`Client: Fetching details for Pokemon ID: ${id}`);
  try {
    const response = await axios.get(`${API_URL}/pokemon/${id}`);
    console.log(`Client: Successfully fetched Pokemon ID ${id}: ${response.data.name}`);
    return response.data;
  } catch (error) {
    console.error(`Client: Error fetching Pokemon ID ${id}:`, error);
    throw error;
  }
};

export const pokeApi = {
  getAllPokemon: async (limit = 2000, offset = 0) => {
    console.log(`Client: Fetching Pokemon list (limit: ${limit}, offset: ${offset})`);
    try {
      const response = await axios.get(`${API_URL}/pokemon?limit=${limit}&offset=${offset}`);
      console.log(`Client: Received ${response.data.results.length} Pokemon from API`);
      console.log(`Client: API response metadata - count: ${response.data.count}, next: ${response.data.next}, previous: ${response.data.previous}`);
      return response.data;
    } catch (error) {
      console.error('Client: Error fetching Pokemon list:', error);
      throw error;
    }
  },

  searchPokemon: async (searchTerm: string) => {
    console.log(`Client: Searching for Pokemon with term: "${searchTerm}"`);
    try {
      // First get all Pokemon (this could be optimized further)
      const response = await axios.get(`${API_URL}/pokemon?limit=2000`);
      // Filter on the client side
      const filtered = response.data.results.filter((p: any) => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log(`Client: Found ${filtered.length} Pokemon matching "${searchTerm}"`);
      return { ...response.data, results: filtered };
    } catch (error) {
      console.error(`Client: Error searching for Pokemon with term "${searchTerm}":`, error);
      throw error;
    }
  },

  getPokemonByName: async (name: string) => {
    console.log(`Client: Fetching details for Pokemon name: ${name}`);
    try {
      const response = await axios.get(`${API_URL}/pokemon/${name}`);
      console.log(`Client: Successfully fetched Pokemon ${name} (ID: ${response.data.id})`);
      return response.data;
    } catch (error) {
      console.error(`Client: Error fetching Pokemon ${name}:`, error);
      throw error;
    }
  },
  
  // Add the getPokemonById method to the exported object
  getPokemonById
};