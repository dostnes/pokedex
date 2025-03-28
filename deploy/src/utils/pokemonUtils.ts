import { Pokemon, MyPokemon } from '../types/pokemon';
import { showdownTheme } from '../theme/showdownTheme';

// Map for variant forms to their base Pokémon numbers
// This maps the API ID to the National Dex number
export const variantFormMap: Record<number, number> = {
    // Alolan Forms
    10026: 26,  // Raichu-Alola -> Raichu
    10027: 27,  // Sandshrew-Alola -> Sandshrew
    10028: 28,  // Sandslash-Alola -> Sandslash
    10037: 37,  // Vulpix-Alola -> Vulpix
    10038: 38,  // Ninetales-Alola -> Ninetales
    10050: 50,  // Diglett-Alola -> Diglett
    10051: 51,  // Dugtrio-Alola -> Dugtrio
    10052: 52,  // Meowth-Alola -> Meowth
    10053: 53,  // Persian-Alola -> Persian
    10074: 74,  // Geodude-Alola -> Geodude
    10075: 75,  // Graveler-Alola -> Graveler
    10076: 76,  // Golem-Alola -> Golem
    10088: 88,  // Grimer-Alola -> Grimer
    10089: 89,  // Muk-Alola -> Muk
    10100: 26,  // Raichu-Alola -> Raichu (duplicate, keeping for clarity)
    10103: 103, // Exeggutor-Alola -> Exeggutor
    10105: 105, // Marowak-Alola -> Marowak
    
    // Galarian Forms
    10077: 77,  // Ponyta-Galar -> Ponyta
    10078: 78,  // Rapidash-Galar -> Rapidash
    10079: 79,  // Slowpoke-Galar -> Slowpoke
    10080: 80,  // Slowbro-Galar -> Slowbro
    10083: 83,  // Farfetch'd-Galar -> Farfetch'd
    10110: 110, // Weezing-Galar -> Weezing
    10122: 122, // Mr. Mime-Galar -> Mr. Mime
    10144: 144, // Articuno-Galar -> Articuno
    10145: 145, // Zapdos-Galar -> Zapdos
    10146: 146, // Moltres-Galar -> Moltres
    10199: 199, // Slowking-Galar -> Slowking
    10222: 222, // Corsola-Galar -> Corsola
    10263: 263, // Zigzagoon-Galar -> Zigzagoon
    10264: 264, // Linoone-Galar -> Linoone
    10554: 554, // Darumaka-Galar -> Darumaka
    10177: 555, // Darmanitan-Galar-standard -> Darmanitan
    10178: 555, // Darmanitan-Galar-zen -> Darmanitan
    10562: 562, // Yamask-Galar -> Yamask
    10618: 618, // Stunfisk-Galar -> Stunfisk
    
    // Hisuian Forms
    10058: 58,  // Growlithe-Hisui -> Growlithe
    10059: 59,  // Arcanine-Hisui -> Arcanine
    10231: 100, // Voltorb-Hisui -> Voltorb
    10101: 101, // Electrode-Hisui -> Electrode
    10157: 157, // Typhlosion-Hisui -> Typhlosion
    10211: 211, // Qwilfish-Hisui -> Qwilfish
    10215: 215, // Sneasel-Hisui -> Sneasel
    10503: 503, // Samurott-Hisui -> Samurott
    10549: 549, // Lilligant-Hisui -> Lilligant
    10570: 570, // Zorua-Hisui -> Zorua
    10571: 571, // Zoroark-Hisui -> Zoroark
    10628: 628, // Braviary-Hisui -> Braviary
    10705: 705, // Sliggoo-Hisui -> Sliggoo
    10706: 706, // Goodra-Hisui -> Goodra
    10713: 713, // Avalugg-Hisui -> Avalugg
    10724: 724, // Decidueye-Hisui -> Decidueye
    
    // Paldean Forms
    10128: 128, // Tauros-Paldea -> Tauros
    10194: 194, // Wooper-Paldea -> Wooper
    
    // Other notable form variants
    10032: 32,  // Nidoran-M -> Nidoran♂
    10413: 413, // Wormadam forms -> Wormadam
    10487: 487, // Giratina forms -> Giratina
    10492: 492, // Shaymin forms -> Shaymin
    10550: 550, // Basculin forms -> Basculin
    10017: 555, // Darmanitan Zen -> Darmanitan
    10585: 585, // Deerling forms -> Deerling
    10586: 586, // Sawsbuck forms -> Sawsbuck
    10641: 641, // Tornadus forms -> Tornadus
    10642: 642, // Thundurus forms -> Thundurus
    10645: 645, // Landorus forms -> Landorus
    10646: 646, // Kyurem forms -> Kyurem
    10647: 647, // Keldeo forms -> Keldeo
    10648: 648, // Meloetta forms -> Meloetta
    10658: 658, // Greninja forms -> Greninja
    10666: 666, // Vivillon forms -> Vivillon
    10669: 669, // Flabébé forms -> Flabébé
    10670: 670, // Floette forms -> Floette
    10671: 671, // Florges forms -> Florges
    10676: 676, // Furfrou forms -> Furfrou
    10681: 681, // Aegislash forms -> Aegislash
    10710: 710, // Pumpkaboo forms -> Pumpkaboo
    10711: 711, // Gourgeist forms -> Gourgeist
    10718: 718, // Zygarde forms -> Zygarde
    10720: 720, // Hoopa forms -> Hoopa
    10741: 741, // Oricorio forms -> Oricorio
    10745: 745, // Lycanroc forms -> Lycanroc
    10746: 746, // Wishiwashi forms -> Wishiwashi
    10773: 773, // Silvally forms -> Silvally
    10774: 774, // Minior forms -> Minior
    10778: 778, // Mimikyu forms -> Mimikyu
    10800: 800, // Necrozma forms -> Necrozma
    10801: 801, // Magearna forms -> Magearna
    10845: 845, // Cramorant forms -> Cramorant
    10849: 849, // Toxtricity forms -> Toxtricity
    10854: 854, // Sinistea forms -> Sinistea
    10855: 855, // Polteageist forms -> Polteageist
    10869: 869, // Alcremie forms -> Alcremie
    10875: 875, // Eiscue forms -> Eiscue
    10876: 876, // Indeedee forms -> Indeedee
    10877: 877, // Morpeko forms -> Morpeko
    10888: 888, // Zacian forms -> Zacian
    10889: 889, // Zamazenta forms -> Zamazenta
    10892: 892, // Urshifu forms -> Urshifu
    10893: 893, // Zarude forms -> Zarude
    10898: 898, // Calyrex forms -> Calyrex
    10902: 902, // Basculegion forms -> Basculegion
    10905: 905, // Enamorus forms -> Enamorus
    10916: 916, // Oinkologne forms -> Oinkologne
    10927: 927, // Maushold forms -> Maushold
    10931: 931, // Squawkabilly forms -> Squawkabilly
    10942: 942, // Palafin forms -> Palafin
    10947: 947, // Tatsugiri forms -> Tatsugiri
    10964: 964, // Palafin forms -> Palafin (duplicate)
    10976: 976, // Veluza forms -> Veluza
    10982: 982, // Dudunsparce forms -> Dudunsparce
    10987: 987, // Gimmighoul forms -> Gimmighoul
    10988: 988, // Gholdengo forms -> Gholdengo
    10994: 994, // Terapagos forms -> Terapagos
    10999: 999, // Gimmighoul forms -> Gimmighoul (duplicate)
  };
  
  /**
   * Normalizes a Pokémon ID by mapping variant forms to their base National Dex number
   * For example, Alolan Raichu (10100) will be normalized to Raichu (26)
   */
  export const normalizePokedexNumber = (id: number): number => {
    return variantFormMap[id] || id;
  };
  
  /**
   * Formats a Pokémon ID as a Pokédex number (e.g., #001, #025, #150)
   * Uses the normalized ID for variant forms
   */
  export const formatPokedexNumber = (id: number): string => {
    const normalizedId = normalizePokedexNumber(id);
    return `#${normalizedId.toString().padStart(3, '0')}`;
  };
  
  /**
   * Determines if a Pokémon is a variant form (regional, special form, etc.)
   */
  export const isVariantForm = (id: number): boolean => {
    return id > 10000;
  };
  
  /**
   * Gets the form name from a Pokémon name if it contains a hyphen
   * e.g., "Raichu-Alola" returns "Alola"
   */
  export const getFormName = (name: string): string | null => {
    const parts = name.split('-');
    return parts.length > 1 ? parts[1] : null;
  };
  
  /**
   * Gets the base name from a Pokémon name if it contains a hyphen
   * e.g., "Raichu-Alola" returns "Raichu"
   */
  export const getBaseName = (name: string): string => {
    const parts = name.split('-');
    return parts[0];
  };

export const getAnimatedSpriteUrl = (pokemon: Pokemon | MyPokemon): string => {
  // Handle MyPokemon type
  if ('sprites' in pokemon && typeof pokemon.sprites === 'string') {
    return pokemon.sprites;
  }
  
  // Handle Pokemon type
  if ('sprites' in pokemon && typeof pokemon.sprites === 'object') {
    const isShiny = 'shiny' in pokemon && pokemon.shiny;
    const sprites = pokemon.sprites as {
      other?: {
        showdown?: {
          front_shiny: string | null;
          front_default: string | null;
        };
        home?: {
          front_shiny: string | null;
          front_default: string | null;
        };
      };
      front_shiny: string | null;
      front_default: string | null;
    };
    
    // First try to get the Showdown sprite
    if (sprites.other?.showdown) {
      return isShiny 
        ? sprites.other.showdown.front_shiny || sprites.other.showdown.front_default || ''
        : sprites.other.showdown.front_default || '';
    }
    
    // If no Showdown sprite, try to get the HOME sprite
    if (sprites.other?.home) {
      return isShiny 
        ? sprites.other.home.front_shiny || sprites.other.home.front_default || ''
        : sprites.other.home.front_default || '';
    }
    
    // If no HOME sprite, fall back to the default sprite
    if (sprites.front_default) {
      return isShiny 
        ? sprites.front_shiny || sprites.front_default || ''
        : sprites.front_default || '';
    }
  }
  
  // If no sprites available, return placeholder
  return '/placeholder-pokemon.png';
};

// Add these new functions
export const getNatureMultiplier = (nature: string, statName: string): number => {
  // Convert statName to the format used in nature names
  const statMap: Record<string, string> = {
    'hp': 'HP',
    'attack': 'Attack',
    'defense': 'Defense',
    'special-attack': 'Sp. Atk',
    'specialAttack': 'Sp. Atk',
    'special-defense': 'Sp. Def',
    'specialDefense': 'Sp. Def',
    'speed': 'Speed'
  };

  const mappedStatName = statMap[statName] || statName;

  // Map of natures to their stat changes
  const natureMap: Record<string, { increased: string; decreased: string }> = {
    'Hardy': { increased: 'Attack', decreased: 'Attack' },
    'Lonely': { increased: 'Attack', decreased: 'Defense' },
    'Brave': { increased: 'Attack', decreased: 'Speed' },
    'Adamant': { increased: 'Attack', decreased: 'Sp. Atk' },
    'Naughty': { increased: 'Attack', decreased: 'Sp. Def' },
    'Bold': { increased: 'Defense', decreased: 'Attack' },
    'Docile': { increased: 'Defense', decreased: 'Defense' },
    'Relaxed': { increased: 'Defense', decreased: 'Speed' },
    'Impish': { increased: 'Defense', decreased: 'Sp. Atk' },
    'Lax': { increased: 'Defense', decreased: 'Sp. Def' },
    'Timid': { increased: 'Speed', decreased: 'Attack' },
    'Hasty': { increased: 'Speed', decreased: 'Defense' },
    'Serious': { increased: 'Speed', decreased: 'Speed' },
    'Jolly': { increased: 'Speed', decreased: 'Sp. Atk' },
    'Naive': { increased: 'Speed', decreased: 'Sp. Def' },
    'Modest': { increased: 'Sp. Atk', decreased: 'Attack' },
    'Mild': { increased: 'Sp. Atk', decreased: 'Defense' },
    'Quiet': { increased: 'Sp. Atk', decreased: 'Speed' },
    'Bashful': { increased: 'Sp. Atk', decreased: 'Sp. Atk' },
    'Rash': { increased: 'Sp. Atk', decreased: 'Sp. Def' },
    'Calm': { increased: 'Sp. Def', decreased: 'Attack' },
    'Gentle': { increased: 'Sp. Def', decreased: 'Defense' },
    'Sassy': { increased: 'Sp. Def', decreased: 'Speed' },
    'Careful': { increased: 'Sp. Def', decreased: 'Sp. Atk' },
    'Quirky': { increased: 'Sp. Def', decreased: 'Sp. Def' }
  };

  const statChanges = natureMap[nature];
  if (!statChanges) return 1.0;

  if (statChanges.increased === mappedStatName) return 1.1;
  if (statChanges.decreased === mappedStatName) return 0.9;
  return 1.0;
};

export const calculateTotalStat = (baseStat: number, ev: number, iv: number, level: number, nature: string, statName: string): number => {
  // HP calculation is different
  if (statName === 'hp') {
    return Math.floor((2 * baseStat + iv + Math.floor(ev / 4)) * level / 100) + level + 10;
  }
  
  // Other stats
  const natureMultiplier = getNatureMultiplier(nature, statName);
  return Math.floor((Math.floor((2 * baseStat + iv + Math.floor(ev / 4)) * level / 100) + 5) * natureMultiplier);
};

export const getStatColor = (statName: string): string => {
  return showdownTheme.statColors[statName as keyof typeof showdownTheme.statColors] || showdownTheme.secondaryText;
};

export const mapStatNameToProperty = (statName: string): string => {
  switch (statName) {
    case 'hp':
      return 'hp';
    case 'attack':
      return 'attack';
    case 'defense':
      return 'defense';
    case 'special-attack':
    case 'specialAttack':
      return 'specialAttack';
    case 'special-defense':
    case 'specialDefense':
      return 'specialDefense';
    case 'speed':
      return 'speed';
    default:
      return statName;
  }
};

export const formatStatName = (statName: string): string => {
  switch (statName) {
    case 'hp':
      return 'HP';
    case 'attack':
      return 'Atk';
    case 'defense':
      return 'Def';
    case 'special-attack':
      return 'SpA';
    case 'special-defense':
      return 'SpD';
    case 'speed':
      return 'Spe';
    default:
      return statName;
  }
};

export const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};