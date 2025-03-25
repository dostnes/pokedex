import { configureStore } from '@reduxjs/toolkit';
import pokemonReducer from './pokemonSlice';

export const store = configureStore({
  reducer: {
    pokemon: pokemonReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: [
          'pokemon.allPokemon.results',
          'pokemon.allPokemon.results.*.sprites',
          'pokemon.allPokemon.results.*.moves'
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;