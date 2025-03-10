import { openDB } from 'idb';
import type { MyPokemon } from '../types/pokemon';

const dbPromise = openDB('pokemon-collection-db', 1, {
  upgrade(db) {
    db.createObjectStore('collection', { keyPath: 'collectionId' });
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