import { configureStore } from '@reduxjs/toolkit';
import pokemonReducer from './pokemonSlice';

export const store = configureStore({
  reducer: {
    pokemon: pokemonReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state
        ignoredPaths: ['pokemon.allPokemon'],
        // Or completely disable in development
        // serializableCheck: false,
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;