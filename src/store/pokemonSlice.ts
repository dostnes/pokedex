import { createSlice, createAsyncThunk, PayloadAction, createAction } from '@reduxjs/toolkit';
import { Pokemon, MyPokemon } from '../types/pokemon';
import { pokeApi } from '../services/pokeApi';

const CACHE_KEY = 'pokemon_cache';
const COLLECTION_KEY = 'pokemon_collection';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface CachedData {
  data: Pokemon[];
  timestamp: number;
}

interface PokemonState {
  allPokemon: Pokemon[];
  myCollection: MyPokemon[];
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

const loadFromCache = () => {
  const cached = localStorage.getItem(CACHE_KEY);
  const collection = localStorage.getItem(COLLECTION_KEY);
  
  let pokemonData = null;
  if (cached) {
    const parsedCache = JSON.parse(cached);
    const now = new Date().getTime();
    // Check if cache has expired
    if (now - parsedCache.timestamp < CACHE_EXPIRY) {
      console.log('🚀 Using cached Pokémon data', {
        cacheAge: `${Math.round((now - parsedCache.timestamp) / 1000 / 60)} minutes old`,
        pokemonCount: parsedCache.data.length
      });
      pokemonData = parsedCache.data;
    } else {
      console.log('⏰ Cache expired, will fetch fresh data');
      localStorage.removeItem(CACHE_KEY);
    }
  } else {
    console.log('📭 No cache found, will fetch fresh data');
  }

  return {
    pokemon: pokemonData,
    collection: collection ? JSON.parse(collection) : [],
    timestamp: cached ? JSON.parse(cached).timestamp : null,
  };
};

const saveToCache = (data: Pokemon[]) => {
  const cacheData: CachedData = {
    data,
    timestamp: new Date().getTime(),
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  console.log('💾 Saved new data to cache', {
    pokemonCount: data.length,
    timestamp: new Date().toLocaleTimeString()
  });
};

const cachedData = loadFromCache();
const initialState: PokemonState = {
  allPokemon: cachedData.pokemon || [],
  myCollection: cachedData.collection,
  loading: false,
  error: null,
  isInitialized: !!cachedData.pokemon,
};

interface PokemonResult {
  name: string;
  url: string;
}

export const fetchAllPokemon = createAsyncThunk(
  'pokemon/fetchAll',
  async (_, { getState }) => {
    const state = getState() as { pokemon: PokemonState };
    
    try {
      // If already initialized, return current state
      if (state.pokemon.isInitialized) {
        return state.pokemon.allPokemon;
      }

      // Try to load from cache first
      const cachedData = loadFromCache();
      if (cachedData?.pokemon) {
        return cachedData.pokemon;
      }

      // Fetch from API if no cache
      const response = await pokeApi.getAllPokemon();
      const pokemonDetails = await Promise.all(
        response.results.map((p: PokemonResult) => pokeApi.getPokemonByName(p.name))
      );
      
      saveToCache(pokemonDetails);
      return pokemonDetails;
    } catch (error) {
      console.error('Error fetching Pokemon:', error);
      throw error;
    }
  }
);

export const removeFromCollection = createAction<string>('pokemon/removeFromCollection');

const pokemonSlice = createSlice({
  name: 'pokemon',
  initialState,
  reducers: {
    addToCollection: (state, action: PayloadAction<Partial<Pokemon> & Partial<MyPokemon>>) => {
      try {
        const collectionId = `${action.payload.id}-${Date.now()}`;
        console.log('Generating collectionId:', collectionId);
        
        const newPokemon: MyPokemon = {
          ...action.payload as any,
          collectionId,
          level: action.payload.level || 1,
          nature: action.payload.nature || 'Hardy',
          shiny: action.payload.shiny || false,
          moves: action.payload.moves || [],
          ivs: action.payload.ivs || {
            hp: 0, attack: 0, defense: 0,
            'special-attack': 0, 'special-defense': 0, speed: 0
          },
          evs: action.payload.evs || {
            hp: 0, attack: 0, defense: 0,
            'special-attack': 0, 'special-defense': 0, speed: 0
          },
          location: action.payload.location || '',
          caughtFrom: action.payload.caughtFrom || 'Main Series',
          pokeball: action.payload.pokeball || 'Poke Ball',
          gender: action.payload.gender || 'N/A',
          ability: action.payload.ability || 
        (action.payload.abilities && action.payload.abilities[0]?.ability.name) || '',
          originalTrainer: action.payload.originalTrainer || '',
          trainerId: action.payload.trainerId || '',
          caughtDate: action.payload.caughtDate || new Date().toISOString(),
          comments: action.payload.comments || ''
        };

        state.myCollection.push(newPokemon);
        localStorage.setItem(COLLECTION_KEY, JSON.stringify(state.myCollection));
        console.log('➕ Added Pokémon to collection', {
          name: newPokemon.name,
          collectionId: newPokemon.collectionId,
          collectionSize: state.myCollection.length
        });
      } catch (error) {
        console.error('❌ Error adding Pokémon:', error);
      }
    },
    updatePokemon: (state, action: PayloadAction<MyPokemon>) => {
      try {
        const index = state.myCollection.findIndex(
          pokemon => pokemon.collectionId === action.payload.collectionId
        );
        if (index !== -1) {
          state.myCollection[index] = action.payload;
          localStorage.setItem(COLLECTION_KEY, JSON.stringify(state.myCollection));
          console.log('📝 Updated Pokémon in collection', {
            name: action.payload.name,
            collectionId: action.payload.collectionId
          });
        } else {
          console.warn('⚠️ Pokemon not found for update:', action.payload.collectionId);
        }
      } catch (error) {
        console.error('❌ Error updating Pokémon:', error);
      }
    },
    clearCollection: (state) => {
      try {
        console.log('🧹 Clearing collection...');
        state.myCollection = [];
        localStorage.setItem(COLLECTION_KEY, JSON.stringify([]));
        console.log('✅ Collection cleared successfully');
      } catch (error) {
        console.error('❌ Error clearing collection:', error);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPokemon.pending, (state) => {
        if (!state.isInitialized) {
          state.loading = true;
          state.error = null;
          console.log('⏳ Starting Pokémon fetch...');
        }
      })
      .addCase(fetchAllPokemon.fulfilled, (state, action) => {
        state.loading = false;
        state.allPokemon = action.payload;
        state.isInitialized = true;
        console.log('✅ Pokémon fetch completed', {
          count: action.payload.length
        });
      })
      .addCase(fetchAllPokemon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch Pokemon';
        console.error('❌ Pokémon fetch failed', {
          error: action.error.message
        });
      })
      .addCase(removeFromCollection, (state, action) => {
        try {
          console.log('🗑️ Attempting to remove Pokémon:', action.payload);
          const pokemonToRemove = state.myCollection.find(p => p.collectionId === action.payload);
          
          if (pokemonToRemove) {
            console.log('Found Pokémon to remove:', {
              name: pokemonToRemove.name,
              collectionId: pokemonToRemove.collectionId
            });
          } else {
            console.warn('⚠️ No Pokémon found with collectionId:', action.payload);
          }

          state.myCollection = state.myCollection.filter(
            pokemon => pokemon.collectionId !== action.payload
          );
          
          localStorage.setItem(COLLECTION_KEY, JSON.stringify(state.myCollection));
          console.log('✅ Collection updated. New size:', state.myCollection.length);
        } catch (error) {
          console.error('❌ Error removing Pokémon:', error);
        }
      });
  }
});

export const { addToCollection, updatePokemon, clearCollection } = pokemonSlice.actions;
export default pokemonSlice.reducer;