import { createSlice, createAsyncThunk, PayloadAction, createAction } from '@reduxjs/toolkit';
import { Pokemon, MyPokemon } from '../types/pokemon';
import { pokeApi } from '../services/pokeApi';
import { collectionDb } from '../services/collectionDb';

// Initialize collection from IndexedDB
export const initializeCollection = createAsyncThunk(
  'pokemon/initializeCollection',
  async () => {
    const collection = await collectionDb.getAll();
    return collection;
  }
);

interface PokemonState {
  allPokemon: {
    results: Pokemon[];
    count: number;
    next: string | null;
    previous: string | null;
  };
  myCollection: MyPokemon[];
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

const initialState: PokemonState = {
  allPokemon: {
    results: [],
    count: 0,
    next: null,
    previous: null
  },
  myCollection: [],
  loading: false,
  error: null,
  isInitialized: false,
};

export const fetchAllPokemon = createAsyncThunk(
  'pokemon/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { pokemon: PokemonState };
    
    try {
      // If already initialized, return current state
      if (state.pokemon.isInitialized) {
        return state.pokemon.allPokemon;
      }

      // Get the first page of Pokemon
      console.log('Fetching from local server at http://localhost:3002/api/v2');
      const response = await pokeApi.getAllPokemon(2000, 0);
      
      return {
        results: response.results,
        count: response.count,
        next: response.next,
        previous: response.previous
      };
    } catch (error) {
      console.error('Error fetching Pokemon:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Add a new thunk for loading more Pokemon
export const fetchMorePokemon = createAsyncThunk(
  'pokemon/fetchMore',
  async (params: { limit: number, offset: number }, { rejectWithValue }) => {
    try {
      const response = await pokeApi.getAllPokemon(params.limit, params.offset);
      return {
        results: response.results,
        count: response.count,
        next: response.next,
        previous: response.previous
      };
    } catch (error) {
      console.error('Error fetching more Pokemon:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Add a thunk for searching
export const searchPokemon = createAsyncThunk(
  'pokemon/search',
  async (searchTerm: string, { rejectWithValue }) => {
    try {
      const response = await pokeApi.searchPokemon(searchTerm);
      return {
        results: response.results,
        count: response.count,
        next: null,
        previous: null
      };
    } catch (error) {
      console.error('Error searching Pokemon:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
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
        // Save to IndexedDB instead of localStorage
        collectionDb.add(newPokemon);
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
          // Update in IndexedDB instead of localStorage
          collectionDb.update(action.payload);
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
        // Clear in IndexedDB instead of localStorage
        collectionDb.clear();
        console.log('✅ Collection cleared successfully');
      } catch (error) {
        console.error('❌ Error clearing collection:', error);
      }
    },
    importCollection: (state, action: PayloadAction<MyPokemon[]>) => {
      state.myCollection = action.payload;
      // Save to local storage
      localStorage.setItem('myCollection', JSON.stringify(action.payload));
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
          count: action.payload.count
        });
      })
      .addCase(fetchAllPokemon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch Pokemon';
        console.error('❌ Pokémon fetch failed', {
          error: action.error.message
        });
      })
      .addCase(fetchMorePokemon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMorePokemon.fulfilled, (state, action) => {
        state.loading = false;
        // Append new results to existing ones
        state.allPokemon = {
          ...action.payload,
          results: [...state.allPokemon.results, ...action.payload.results]
        };
      })
      .addCase(fetchMorePokemon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch more Pokemon';
      })
      .addCase(searchPokemon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchPokemon.fulfilled, (state, action) => {
        state.loading = false;
        state.allPokemon = action.payload;
      })
      .addCase(searchPokemon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to search Pokemon';
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
          
          // Delete from IndexedDB instead of localStorage
          collectionDb.delete(action.payload);
          console.log('✅ Collection updated. New size:', state.myCollection.length);
        } catch (error) {
          console.error('❌ Error removing Pokémon:', error);
        }
      })
      .addCase(initializeCollection.fulfilled, (state, action) => {
        state.myCollection = action.payload;
        console.log('✅ Collection initialized from IndexedDB', {
          size: action.payload.length
        });
      });
  }
});

export const { addToCollection, updatePokemon, clearCollection, importCollection } = pokemonSlice.actions;
export default pokemonSlice.reducer;