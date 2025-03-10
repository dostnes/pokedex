// Basic Pokemon type from the API
export interface Pokemon {
  id: number;
  name: string;
  url?: string;
  timestamp?: number;
  types: Array<{ type: { name: string } }>;
  stats: Array<{ base_stat: number; stat: { name: string } }>;
  sprites: {
    front_default: string;
    front_shiny: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
      home: {
        front_default: string;
        front_shiny: string;
      };
    };
  };
  moves: Array<{ move: { name: string } }>;
  height: number;
  weight: number;
  abilities: Array<{ 
    ability: { name: string }; 
    is_hidden: boolean;  // Add this property
  }>;
}

// Pokemon in user's collection with additional properties
export interface MyPokemon {
  // Copy from Pokemon
  id: number;
  name: string;
  timestamp?: number;
  types: Array<{ type: { name: string } }>;
  stats: Array<{ base_stat: number; stat: { name: string } }>;
  sprites: {
    front_default: string;
    front_shiny: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
      home: {
        front_default: string;
        front_shiny: string;
      };
    };
  };
  height: number;
  weight: number;
  abilities: Array<{ ability: { name: string } }>;
  
  // Custom properties
  collectionId: string;
  nickname?: string;
  level: number;
  nature: string;
  shiny: boolean;
  moves: string[]; // Different type than Pokemon.moves
  ivs: {
    hp: number;
    attack: number;
    defense: number;
    'special-attack': number;
    'special-defense': number;
    speed: number;
  };
  evs: {
    hp: number;
    attack: number;
    defense: number;
    'special-attack': number;
    'special-defense': number;
    speed: number;
  };
  // Additional fields
  gender?: string;
  ability?: string;
  heldItem?: string;
  location?: string;
  caughtFrom?: string;
  pokeball?: string;
  originalTrainer?: string;
  trainerId?: string;
  caughtDate?: string;
  comments?: string;
}

// For the form when adding a new Pokemon
export interface AddPokemonFormData {
  pokemonId: number;
  nickname: string;
  level: number;
  nature: string;
  shiny: boolean;
  moves: string[];
  ivs: {
    hp: number;
    attack: number;
    defense: number;
    'special-attack': number;
    'special-defense': number;
    speed: number;
  };
  evs: {
    hp: number;
    attack: number;
    defense: number;
    'special-attack': number;
    'special-defense': number;
    speed: number;
  };
  gender?: string;
  ability?: string;
  heldItem?: string;
  location?: string;
  caughtFrom?: string;
  pokeball?: string;
  originalTrainer?: string;
  trainerId?: string;
  caughtDate?: string;
  comments?: string;
}