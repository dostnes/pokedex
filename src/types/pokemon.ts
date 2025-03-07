export interface Pokemon {
    id: number;
    name: string;
    types: PokemonType[];
    sprites: {
        front_default: string;
        other: {
            'official-artwork': {
                front_default: string;
            };
        };
    };
    stats: PokemonStat[];
}

export interface PokemonType {
    slot: number;
    type: {
        name: string;
        url: string;
    };
}

export interface PokemonStat {
    base_stat: number;
    effort: number;
    stat: {
        name: string;
        url: string;
    };
}

export interface MyPokemon extends Pokemon {
    nickname?: string;
    level: number;
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
    nature: string;
    moves: string[];
} 