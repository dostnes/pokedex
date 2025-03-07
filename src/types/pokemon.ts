interface PokemonAbility {
    ability: {
      name: string;
      url: string;
    };
    is_hidden: boolean;
    slot: number;
  }
  
  interface PokemonStat {
    base_stat: number;
    effort: number;
    stat: {
      name: string;
      url: string;
    };
  }
  
  export interface Pokemon {
    id: number;
    name: string;
    sprites: {
      front_default: string;
      front_shiny: string;
      other: {
        home: {
          front_default: string;
          front_shiny: string;
        };
      };
    };
    types: {
      slot: number;
      type: {
        name: string;
        url: string;
      };
    }[];
    abilities: PokemonAbility[];
    stats: PokemonStat[]; // Added stats property
  }
  
  export interface MyPokemon extends Pokemon {
    collectionId: string;
    nickname?: string;
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
    location: string;
    caughtFrom: 'Main Series' | 'Pokemon GO' | 'Other';
    pokeball: string;
    gender: 'male' | 'female' | 'N/A';
    ability: {
      name: string;
      isHidden: boolean;
    };
    originalTrainer: string;
    trainerId: string;
    caughtDate: string;
    comment?: string;
  }