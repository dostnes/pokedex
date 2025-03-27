// Basic Pokemon type from the API
export interface Pokemon {
  id?: number;  // Optional for list view
  name: string;
  url?: string; // For list view
  base_experience?: number;  // Optional for list view
  height?: number;  // Optional for list view
  is_default?: boolean;  // Optional for list view
  order?: number;  // Optional for list view
  weight?: number;  // Optional for list view
  abilities?: Array<{
    ability: {
      name: string;
      url: string;
    };
    is_hidden: boolean;
    slot: number;
  }>;
  forms: Array<{
    name: string;
    url: string;
  }>;
  game_indices: Array<{
    game_index: number;
    version: {
      name: string;
      url: string;
    };
  }>;
  held_items: Array<{
    item: {
      name: string;
      url: string;
    };
    version_details: Array<{
      rarity: number;
      version: {
        name: string;
        url: string;
      };
    }>;
  }>;
  location_area_encounters: string;
  moves: Array<{
    move: {
      name: string;
      url: string;
    };
    version_group_details: Array<{
      level_learned_at: number;
      version_group: {
        name: string;
        url: string;
      };
      move_learn_method: {
        name: string;
        url: string;
      };
    }>;
  }>;
  species: {
    name: string;
    url: string;
  };
  sprites: {
    back_default: string | null;
    back_female: string | null;
    back_shiny: string | null;
    back_shiny_female: string | null;
    front_default: string | null;
    front_female: string | null;
    front_shiny: string | null;
    front_shiny_female: string | null;
    other: {
      'official-artwork': {
        front_default: string;
      };
      home: {
        front_default: string;
        front_shiny: string;
      };
      showdown?: {
        front_default: string | null;
        front_shiny: string | null;
        back_default: string | null;
        back_shiny: string | null;
      };
    };
  };
  stats: Array<{
    base_stat: number;
    effort: number;
    stat: {
      name: string;
      url: string;
    };
  }>;
  types: Array<{
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }>;
  past_types: Array<{
    generation: {
      name: string;
      url: string;
    };
    types: Array<{
      slot: number;
      type: {
        name: string;
        url: string;
      };
    }>;
  }>;
}

// Pokemon in user's collection with additional properties
export interface MyPokemon extends Omit<Pokemon, 'moves'> {
  collectionId: string;
  nickname?: string;
  level: number;
  nature: string;
  gender?: string;
  ability?: string;
  shiny: boolean;
  location?: string;
  caughtFrom?: string;
  originalTrainer?: string;
  trainerId?: string;
  caughtDate?: string;
  pokeball: string;
  comments?: string;
  ivs: {
    hp: number;
    attack: number;
    defense: number;
    'special-attack'?: number;
    'special-defense'?: number;
    specialAttack?: number;
    specialDefense?: number;
    speed: number;
  };
  evs: {
    hp: number;
    attack: number;
    defense: number;
    'special-attack'?: number;
    'special-defense'?: number;
    specialAttack?: number;
    specialDefense?: number;
    speed: number;
  };
  moves: string[];
  project?: 'Competitive' | 'Shiny Living Dex' | 'Living Dex' | 'Trophy' | 'Other';
  timestamp: number;
  favorite?: boolean;
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
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  evs: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
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