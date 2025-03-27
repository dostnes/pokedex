// Import all move data files
const moveModules = import.meta.glob('/pokemon-data/data/api/v2/move/*/index.json', {
  eager: true,
  as: 'raw'
});

export interface Move {
  name: string;
  type: string;
  category: 'Physical' | 'Special' | 'Status';
  power: number;
  accuracy: number;
  pp: number;
  description: string;
  effect_chance?: number;
}

class MoveService {
  private moves: Move[] = [];
  private initialized = false;

  private loadMoves() {
    if (this.initialized) return;

    try {
      this.moves = Object.entries(moveModules).map(([_, moveData]) => {
        const data = JSON.parse(moveData as string);

        // Get the latest English flavor text
        const latestFlavorText = data.flavor_text_entries
          .filter((entry: any) => entry.language.name === 'en')
          .sort((a: any, b: any) => {
            const versionA = a.version_group.name;
            const versionB = b.version_group.name;
            return versionB.localeCompare(versionA);
          })[0]?.flavor_text || '';

        // Get the latest English effect
        const latestEffect = data.effect_entries
          .find((entry: any) => entry.language.name === 'en')
          ?.effect || '';

        return {
          name: data.name,
          type: data.type.name,
          category: this.mapDamageClassToCategory(data.damage_class.name),
          power: data.power || 0,
          accuracy: data.accuracy || 0,
          pp: data.pp || 0,
          description: latestFlavorText,
          effect_chance: data.effect_chance || undefined
        };
      });

      this.initialized = true;
    } catch (error) {
      console.error('Error loading moves:', error);
      throw error;
    }
  }

  private mapDamageClassToCategory(damageClass: string): 'Physical' | 'Special' | 'Status' {
    switch (damageClass.toLowerCase()) {
      case 'physical':
        return 'Physical';
      case 'special':
        return 'Special';
      case 'status':
        return 'Status';
      default:
        return 'Status';
    }
  }

  getAllMoves(): Move[] {
    this.loadMoves();
    return this.moves;
  }

  getMoveByName(name: string): Move | undefined {
    this.loadMoves();
    // Normalize the input name by converting to lowercase and replacing spaces with hyphens
    const normalizedInput = name.toLowerCase().replace(/\s+/g, '-');
    return this.moves.find(move => {
      // Normalize the move name in the same way
      const normalizedMoveName = move.name.toLowerCase().replace(/\s+/g, '-');
      return normalizedMoveName === normalizedInput;
    });
  }

  searchMoves(query: string): Move[] {
    this.loadMoves();
    const lowercaseQuery = query.toLowerCase();
    return this.moves.filter(move => 
      move.name.toLowerCase().includes(lowercaseQuery) ||
      move.type.toLowerCase().includes(lowercaseQuery) ||
      move.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  getMovesByType(type: string): Move[] {
    this.loadMoves();
    return this.moves.filter(move => move.type.toLowerCase() === type.toLowerCase());
  }

  getMovesByCategory(category: string): Move[] {
    this.loadMoves();
    return this.moves.filter(move => move.category.toLowerCase() === category.toLowerCase());
  }

  getMoveType(moveName: string): string | undefined {
    this.loadMoves();
    const move = this.getMoveByName(moveName);
    return move?.type;
  }
}

export const moveService = new MoveService(); 