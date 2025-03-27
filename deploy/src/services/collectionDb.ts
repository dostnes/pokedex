import { openDB } from 'idb';
import type { MyPokemon } from '../types/pokemon';

const dbPromise = openDB('pokemon-collection-db', 2, {
  upgrade(db, oldVersion, newVersion) {
    // Create the object store if it doesn't exist
    if (!db.objectStoreNames.contains('collection')) {
      db.createObjectStore('collection', { keyPath: 'collectionId' });
    }
    
    // Handle migration from version 1 to 2
    if (oldVersion < 2) {
      // No specific migrations needed for version 2
      // The store structure remains the same
    }
  },
});

export const collectionDb = {
  async getAll(): Promise<MyPokemon[]> {
    return (await dbPromise).getAll('collection');
  },
  
  async add(pokemon: MyPokemon): Promise<void> {
    // Ensure timestamp exists
    const pokemonWithTimestamp = {
      ...pokemon,
      timestamp: pokemon.timestamp || Date.now()
    };
    await (await dbPromise).put('collection', pokemonWithTimestamp);
  },
  
  async update(pokemon: MyPokemon): Promise<void> {
    // Preserve the timestamp when updating
    await (await dbPromise).put('collection', pokemon);
  },
  
  async delete(collectionId: string): Promise<void> {
    await (await dbPromise).delete('collection', collectionId);
  },
  
  async clear(): Promise<void> {
    await (await dbPromise).clear('collection');
  }
};