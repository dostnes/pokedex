import axios from 'axios';
import { Pokemon } from '../types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

export const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export const pokeApi = {
    getAllPokemon: async (limit: number = 1025, offset: number = 0) => {
        const response = await axios.get(`${BASE_URL}/pokemon`, {
            params: { limit, offset }
        });
        return response.data;
    },

    getPokemonByName: async (name: string): Promise<Pokemon> => {
        const response = await axios.get(`${BASE_URL}/pokemon/${name.toLowerCase()}`);
        return response.data;
    },

    getPokemonById: async (id: number): Promise<Pokemon> => {
        const response = await axios.get(`${BASE_URL}/pokemon/${id}`);
        return response.data;
    }
}; 