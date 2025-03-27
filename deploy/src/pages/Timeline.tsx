import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import { RootState } from '../store/store';
import { capitalizeFirstLetter } from '../services/pokeApi';
import TypeBadge from '../components/TypeBadge';
import { formatPokedexNumber, isVariantForm, getFormName, getBaseName, getAnimatedSpriteUrl } from '../utils/pokemonUtils';
import { showdownTheme } from '../theme/showdownTheme';
import { format } from 'date-fns';
import { MyPokemon } from '../types/pokemon';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DiamondIcon from '@mui/icons-material/Diamond';
import CategoryIcon from '@mui/icons-material/Category';
import FolderIcon from '@mui/icons-material/Folder';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PieChartIcon from '@mui/icons-material/PieChart';

// Define type for Pokémon types
type PokemonType = 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice' | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug' | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

// Define type for project names
type ProjectName = 'Competitive' | 'Shiny Living Dex' | 'Living Dex' | 'Trophy' | 'Other';

// Move constants to a separate file or keep them at the top level
const TYPE_COLORS: Record<PokemonType, string> = {
  normal: 'rgba(168, 168, 120, 0.1)',
  fire: 'rgba(240, 128, 48, 0.1)',
  water: 'rgba(104, 144, 240, 0.1)',
  electric: 'rgba(248, 208, 48, 0.1)',
  grass: 'rgba(120, 200, 80, 0.1)',
  ice: 'rgba(152, 216, 216, 0.1)',
  fighting: 'rgba(192, 48, 40, 0.1)',
  poison: 'rgba(160, 64, 160, 0.1)',
  ground: 'rgba(224, 192, 104, 0.1)',
  flying: 'rgba(168, 144, 240, 0.1)',
  psychic: 'rgba(248, 88, 136, 0.1)',
  bug: 'rgba(168, 184, 32, 0.1)',
  rock: 'rgba(184, 160, 56, 0.1)',
  ghost: 'rgba(112, 88, 152, 0.1)',
  dragon: 'rgba(112, 56, 248, 0.1)',
  dark: 'rgba(112, 88, 72, 0.1)',
  steel: 'rgba(184, 184, 208, 0.1)',
  fairy: 'rgba(238, 153, 172, 0.1)'
};

const PROJECT_COLORS: Record<ProjectName, string> = {
  'Competitive': '#FF6B6B',
  'Shiny Living Dex': '#4ECDC4',
  'Living Dex': '#45B7D1',
  'Trophy': '#96CEB4',
  'Other': '#FFEEAD'
};

// Helper functions to safely access colors
const getTypeColor = (typeName: string): string => {
  return TYPE_COLORS[typeName as PokemonType] || TYPE_COLORS.normal;
};

const getProjectColor = (projectName: string | undefined): string => {
  if (!projectName) return showdownTheme.accent;
  return PROJECT_COLORS[projectName as ProjectName] || PROJECT_COLORS.Other;
};

const POKEBALL_MAP = {
  'Poke Ball': 'poke-ball',
  'Great Ball': 'great-ball',
  'Ultra Ball': 'ultra-ball',
  'Master Ball': 'master-ball',
  'Safari Ball': 'safari-ball',
  'Level Ball': 'level-ball',
  'Lure Ball': 'lure-ball',
  'Moon Ball': 'moon-ball',
  'Friend Ball': 'friend-ball',
  'Love Ball': 'love-ball',
  'Heavy Ball': 'heavy-ball',
  'Fast Ball': 'fast-ball',
  'Sport Ball': 'sport-ball',
  'Premier Ball': 'premier-ball',
  'Repeat Ball': 'repeat-ball',
  'Timer Ball': 'timer-ball',
  'Nest Ball': 'nest-ball',
  'Net Ball': 'net-ball',
  'Dive Ball': 'dive-ball',
  'Luxury Ball': 'luxury-ball',
  'Heal Ball': 'heal-ball',
  'Quick Ball': 'quick-ball',
  'Dusk Ball': 'dusk-ball',
  'Cherish Ball': 'cherish-ball',
  'Dream Ball': 'dream-ball',
  'Beast Ball': 'beast-ball',
} as const;

// Memoize the Poké Ball image URL function
const getPokeballImageUrl = (pokeballName: string): string => {
  const filename = POKEBALL_MAP[pokeballName as keyof typeof POKEBALL_MAP] || 'poke-ball';
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${filename}.png`;
};

// Memoize the rare shiny check function
const isRareShiny = (pokemon: MyPokemon): boolean => {
  const pseudoLegendaries = [149, 248, 373, 380, 381, 445, 446, 483, 484, 487, 493];
  const starters = [3, 6, 9, 154, 157, 160, 253, 256, 259, 260, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 277, 278, 279, 282, 283, 284, 285, 286, 287, 288, 289, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 333, 334, 335, 336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346, 347, 348, 349, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359, 360, 361, 362, 363, 364, 365, 366, 367, 368, 369, 370, 371, 372, 373, 374, 375, 376, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 387, 388, 389, 390, 391, 392, 393, 394, 395, 396, 397, 398, 399, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 426, 427, 428, 429, 430, 431, 432, 433, 434, 435, 436, 437, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449, 450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460, 461, 462, 463, 464, 465, 466, 467, 468, 469, 470, 471, 472, 473, 474, 475, 476, 477, 478, 479, 480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493];
  return (pokemon.id ?? 0) > 890 || 
         isVariantForm(pokemon.id ?? 0) || 
         starters.includes(pokemon.id ?? 0) || 
         pseudoLegendaries.includes(pokemon.id ?? 0);
};

// Define milestone types
type MilestoneType = 'first' | 'type' | 'project' | 'rare' | 'year' | 'collection';
type MilestoneResult = { isMilestone: boolean; types: MilestoneType[] };
type MilestoneInfo = { icon: React.ReactElement; tooltip: string };

// Memoize the stats calculation
const calculateStats = (collection: MyPokemon[]) => {
  const stats = {
    totalShinies: 0,
    typeDistribution: {} as Record<string, number>,
    projectDistribution: {} as Record<string, number>,
    yearDistribution: {} as Record<string, number>,
    rareShinies: 0
  };

  // Single pass through the collection
  collection.forEach(pokemon => {
    if (pokemon.shiny) {
      stats.totalShinies++;
      
      // Type distribution
      const type = pokemon.types[0].type.name;
      stats.typeDistribution[type] = (stats.typeDistribution[type] || 0) + 1;
      
      // Project distribution
      if (pokemon.project) {
        stats.projectDistribution[pokemon.project] = (stats.projectDistribution[pokemon.project] || 0) + 1;
      }
      
      // Year distribution
      const year = new Date(pokemon.caughtDate || '').getFullYear().toString();
      stats.yearDistribution[year] = (stats.yearDistribution[year] || 0) + 1;
      
      // Rare shinies
      if (isRareShiny(pokemon)) {
        stats.rareShinies++;
      }
    }
  });

  // Calculate most common values
  const mostCommonType = Object.entries(stats.typeDistribution)
    .sort(([, a], [, b]) => b - a)[0] || ['normal', 0];

  const mostCommonProject = Object.entries(stats.projectDistribution)
    .sort(([, a], [, b]) => b - a)[0] || ['Other', 0];

  const mostProductiveYear = Object.entries(stats.yearDistribution)
    .sort(([, a], [, b]) => b - a)[0] || [new Date().getFullYear().toString(), 0];

  return {
    ...stats,
    mostCommonType,
    mostCommonProject,
    mostProductiveYear,
  };
};

const Timeline = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const myCollection = useSelector((state: RootState) => state.pokemon.myCollection);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [projectFilter, setProjectFilter] = useState<MyPokemon['project'] | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Memoize the filtered and sorted shiny Pokémon
  const shinyPokemon = useMemo(() => {
    return myCollection
      .filter(pokemon => pokemon.shiny)
      .filter(pokemon => {
        if (projectFilter === 'all') return true;
        const validProjects: MyPokemon['project'][] = ['Competitive', 'Shiny Living Dex', 'Living Dex', 'Trophy', 'Other'];
        return validProjects.includes(projectFilter as MyPokemon['project']) && pokemon.project === (projectFilter as MyPokemon['project']);
      })
      .filter(pokemon => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
          pokemon.name.toLowerCase().includes(searchLower) ||
          pokemon.nickname?.toLowerCase().includes(searchLower) ||
          pokemon.project?.toLowerCase().includes(searchLower)
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.caughtDate || '').getTime();
        const dateB = new Date(b.caughtDate || '').getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      });
  }, [myCollection, projectFilter, searchTerm, sortDirection]);

  // Memoize the chronological order of all shiny Pokémon for milestone calculations
  const allShinyPokemon = useMemo(() => {
    return myCollection
      .filter(pokemon => pokemon.shiny)
      .sort((a, b) => {
        const dateA = new Date(a.caughtDate || '').getTime();
        const dateB = new Date(b.caughtDate || '').getTime();
        return dateA - dateB;
      });
  }, [myCollection]);

  // Memoize the stats calculation
  const stats = useMemo(() => calculateStats(myCollection), [myCollection]);

  // Memoize the milestone check function
  const checkMilestone = useCallback((pokemon: MyPokemon, index: number): MilestoneResult => {
    const chronologicalIndex = allShinyPokemon.findIndex(p => p.collectionId === pokemon.collectionId);
    const position = chronologicalIndex + 1;

    const sizeMilestones = [1];
    for (let i = 25; i <= 1000; i += 25) {
      sizeMilestones.push(i);
    }
    
    const milestoneTypes: MilestoneType[] = [];

    if (position === 1) {
      milestoneTypes.push('first');
    } else {
      if (sizeMilestones.includes(position)) {
        milestoneTypes.push('collection');
      }

      if (!allShinyPokemon.slice(0, chronologicalIndex).some(p => p.types[0].type.name === pokemon.types[0].type.name)) {
        milestoneTypes.push('type');
      }

      if (pokemon.project && !allShinyPokemon.slice(0, chronologicalIndex).some(p => p.project === pokemon.project)) {
        milestoneTypes.push('project');
      }

      if (isRareShiny(pokemon) && !allShinyPokemon.slice(0, chronologicalIndex).some(p => isRareShiny(p))) {
        milestoneTypes.push('rare');
      }
      
      const currentYear = new Date(pokemon.caughtDate || '').getFullYear();
      if (!allShinyPokemon.slice(0, chronologicalIndex).some(p => 
        new Date(p.caughtDate || '').getFullYear() === currentYear
      )) {
        milestoneTypes.push('year');
      }
    }

    return {
      isMilestone: milestoneTypes.length > 0,
      types: milestoneTypes
    };
  }, [allShinyPokemon]);

  // Memoize the milestone info function
  const getMilestoneInfo = useCallback((pokemon: MyPokemon, index: number): MilestoneInfo[] => {
    const { isMilestone, types } = checkMilestone(pokemon, index);
    if (!isMilestone) return [];

    const position = allShinyPokemon.findIndex(p => p.collectionId === pokemon.collectionId) + 1;
    const currentYear = new Date(pokemon.caughtDate || '').getFullYear();

    return types.map(type => {
      switch (type) {
        case 'first':
          return {
            icon: <AutoAwesomeIcon sx={{ color: showdownTheme.accent, fontSize: { xs: 14, sm: 16 } }} />,
            tooltip: 'First Shiny Pokémon!'
          };
        case 'type':
          return {
            icon: <StarIcon sx={{ color: showdownTheme.accent, fontSize: { xs: 14, sm: 16 } }} />,
            tooltip: `First ${capitalizeFirstLetter(pokemon.types[0].type.name)}-type Shiny!`
          };
        case 'project':
          return {
            icon: <EmojiEventsIcon sx={{ color: showdownTheme.accent, fontSize: { xs: 14, sm: 16 } }} />,
            tooltip: `First ${pokemon.project} Shiny!`
          };
        case 'rare':
          return {
            icon: <StarIcon sx={{ color: showdownTheme.accent, fontSize: { xs: 14, sm: 16 } }} />,
            tooltip: 'First Rare Shiny!'
          };
        case 'year':
          return {
            icon: <EmojiEventsIcon sx={{ color: showdownTheme.accent, fontSize: { xs: 14, sm: 16 } }} />,
            tooltip: `First Shiny of ${currentYear}!`
          };
        case 'collection':
          return {
            icon: <EmojiEventsIcon sx={{ color: showdownTheme.accent, fontSize: { xs: 14, sm: 16 } }} />,
            tooltip: `${position}th Shiny Pokémon!`
          };
        default:
          return {
            icon: <EmojiEventsIcon sx={{ color: showdownTheme.accent, fontSize: { xs: 14, sm: 16 } }} />,
            tooltip: `${position}th Shiny Pokémon!`
          };
      }
    });
  }, [checkMilestone, allShinyPokemon]);

  // Memoize the project list
  const projects = useMemo(() => {
    return Array.from(new Set(myCollection
      .filter(pokemon => pokemon.shiny)
      .map(pokemon => pokemon.project)
      .filter((project): project is MyPokemon['project'] => 
        project === 'Competitive' || 
        project === 'Shiny Living Dex' || 
        project === 'Living Dex' || 
        project === 'Trophy' || 
        project === 'Other'
      )));
  }, [myCollection]);

  // Event handlers
  const handleSortChange = (event: any) => {
    setSortDirection(event.target.value);
  };

  const handleProjectFilterChange = (event: any) => {
    setProjectFilter(event.target.value);
  };

  return (
    <Box sx={{ 
      minHeight: '100%',
      bgcolor: showdownTheme.background,
      p: { xs: 2, sm: 4 },
      fontFamily: showdownTheme.fontFamily,
    }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ 
          fontWeight: 'bold', 
          mb: 3,
          color: showdownTheme.text,
        }}
      >
        Shiny Timeline
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {/* Total Shinies */}
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ 
            bgcolor: showdownTheme.cardBackground,
            border: `1px solid ${showdownTheme.border}`,
            height: '100%',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 4px 8px ${showdownTheme.accent}20`,
              borderColor: showdownTheme.accent,
            },
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AutoAwesomeIcon sx={{ color: showdownTheme.accent, fontSize: 20 }} />
                <Typography variant="caption" sx={{ color: showdownTheme.text, fontWeight: 'bold' }}>
                  Total Shinies
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: showdownTheme.accent, fontWeight: 'bold' }}>
                {stats?.totalShinies || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Rare Shinies */}
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ 
            bgcolor: showdownTheme.cardBackground,
            border: `1px solid ${showdownTheme.border}`,
            height: '100%',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 4px 8px ${showdownTheme.accent}20`,
              borderColor: showdownTheme.accent,
            },
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <DiamondIcon sx={{ color: showdownTheme.accent, fontSize: 20 }} />
                <Typography variant="caption" sx={{ color: showdownTheme.text, fontWeight: 'bold' }}>
                  Rare Shinies
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: showdownTheme.accent, fontWeight: 'bold' }}>
                {stats?.rareShinies || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Most Common Type */}
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ 
            bgcolor: showdownTheme.cardBackground,
            border: `1px solid ${showdownTheme.border}`,
            height: '100%',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 4px 8px ${showdownTheme.accent}20`,
              borderColor: showdownTheme.accent,
            },
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CategoryIcon sx={{ color: showdownTheme.accent, fontSize: 20 }} />
                <Typography variant="caption" sx={{ color: showdownTheme.text, fontWeight: 'bold' }}>
                  Most Common Type
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TypeBadge type={stats?.mostCommonType?.[0] || 'normal'} size="small" />
                <Typography variant="h4" sx={{ color: showdownTheme.accent, fontWeight: 'bold' }}>
                  {stats?.mostCommonType?.[1] || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Most Common Project */}
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ 
            bgcolor: showdownTheme.cardBackground,
            border: `1px solid ${showdownTheme.border}`,
            height: '100%',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 4px 8px ${showdownTheme.accent}20`,
              borderColor: showdownTheme.accent,
            },
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <FolderIcon sx={{ color: showdownTheme.accent, fontSize: 20 }} />
                <Typography variant="caption" sx={{ color: showdownTheme.text, fontWeight: 'bold' }}>
                  Most Common Project
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h4" sx={{ color: showdownTheme.accent, fontWeight: 'bold' }}>
                  {stats?.mostCommonProject?.[1] || 0}
                </Typography>
                <Typography variant="caption" sx={{ color: showdownTheme.text }}>
                  {stats?.mostCommonProject?.[0] || 'Other'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Most Productive Year */}
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ 
            bgcolor: showdownTheme.cardBackground,
            border: `1px solid ${showdownTheme.border}`,
            height: '100%',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 4px 8px ${showdownTheme.accent}20`,
              borderColor: showdownTheme.accent,
            },
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CalendarMonthIcon sx={{ color: showdownTheme.accent, fontSize: 20 }} />
                <Typography variant="caption" sx={{ color: showdownTheme.text, fontWeight: 'bold' }}>
                  Most Productive Year
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h4" sx={{ color: showdownTheme.accent, fontWeight: 'bold' }}>
                  {stats?.mostProductiveYear?.[1] || 0}
                </Typography>
                <Typography variant="caption" sx={{ color: showdownTheme.text }}>
                  {stats?.mostProductiveYear?.[0] || new Date().getFullYear().toString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Project Distribution */}
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ 
            bgcolor: showdownTheme.cardBackground,
            border: `1px solid ${showdownTheme.border}`,
            height: '100%',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 4px 8px ${showdownTheme.accent}20`,
              borderColor: showdownTheme.accent,
            },
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PieChartIcon sx={{ color: showdownTheme.accent, fontSize: 20 }} />
                <Typography variant="caption" sx={{ color: showdownTheme.text, fontWeight: 'bold' }}>
                  Project Distribution
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {Object.entries(stats?.projectDistribution || {})
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([project, count]) => (
                    <Box key={project} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Chip
                        label={project}
                        size="small"
                        sx={{ 
                          height: 20,
                          '& .MuiChip-label': { px: 1, fontSize: '0.75rem' },
                          bgcolor: getProjectColor(project),
                          color: showdownTheme.text,
                          fontFamily: showdownTheme.fontFamily,
                          border: `1px solid ${showdownTheme.border}`,
                        }}
                      />
                      <Typography variant="caption" sx={{ color: showdownTheme.text, fontSize: '0.75rem' }}>
                        {count}
                      </Typography>
                    </Box>
                  ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 4,
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
      }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by name, nickname, or project..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ 
            '& .MuiOutlinedInput-root': {
              fontFamily: showdownTheme.fontFamily
            }
          }}
        />
        
        <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
          <InputLabel id="sort-direction-label" sx={{ fontFamily: showdownTheme.fontFamily }}>Sort Direction</InputLabel>
          <Select
            labelId="sort-direction-label"
            id="sort-direction"
            value={sortDirection}
            label="Sort Direction"
            onChange={handleSortChange}
            sx={{ fontFamily: showdownTheme.fontFamily }}
          >
            <MenuItem value="desc">Newest First</MenuItem>
            <MenuItem value="asc">Oldest First</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
          <InputLabel id="project-filter-label" sx={{ fontFamily: showdownTheme.fontFamily }}>Project</InputLabel>
          <Select
            labelId="project-filter-label"
            id="project-filter"
            value={projectFilter}
            label="Project"
            onChange={handleProjectFilterChange}
            sx={{ fontFamily: showdownTheme.fontFamily }}
          >
            <MenuItem value="all">All Projects</MenuItem>
            {projects.map(project => (
              <MenuItem key={project} value={project}>{project}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Timeline */}
      <Box sx={{ position: 'relative', pl: { xs: 2, sm: 4 } }}>
        {/* Vertical line with gradient */}
        <Box
          sx={{
            position: 'absolute',
            left: { xs: 8, sm: 16 },
            top: 0,
            bottom: 0,
            width: 2,
            background: `linear-gradient(to bottom, ${showdownTheme.accent}, ${showdownTheme.border})`,
            opacity: 0.5,
          }}
        />

        {shinyPokemon.length === 0 ? (
          <Typography 
            variant="h6" 
            align="center" 
            sx={{ 
              color: showdownTheme.text,
              fontFamily: showdownTheme.fontFamily,
            }}
          >
            No shiny Pokémon found. Start hunting to build your timeline!
          </Typography>
        ) : (
          shinyPokemon.map((pokemon, index) => (
            <Box
              key={pokemon.collectionId}
              sx={{
                position: 'relative',
                mb: 2,
                '&:last-child': { mb: 0 },
              }}
            >
              {/* Timeline dot with project color */}
              <Box
                sx={{
                  position: 'absolute',
                  left: { xs: -6, sm: -12 },
                  top: 8,
                  width: { xs: 12, sm: 20 },
                  height: { xs: 12, sm: 20 },
                  borderRadius: '50%',
                  bgcolor: getProjectColor(pokemon.project),
                  border: `2px solid ${showdownTheme.background}`,
                  zIndex: 1,
                  boxShadow: isRareShiny(pokemon) ? `0 0 8px ${showdownTheme.accent}` : 'none',
                }}
              />

              {/* Milestone indicators */}
              {(() => {
                const milestoneInfos = getMilestoneInfo(pokemon, index);
                if (milestoneInfos.length === 0) return null;

                return (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: { xs: -45, sm: -60 },
                      top: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      zIndex: 1,
                      bgcolor: showdownTheme.background,
                      borderRadius: 1,
                      px: 0.5,
                      py: 0.25,
                      border: `1px solid ${showdownTheme.border}`,
                      maxWidth: { xs: '120px', sm: '160px' },
                      overflowX: 'auto',
                      '&::-webkit-scrollbar': {
                        height: '4px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: showdownTheme.background,
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: showdownTheme.border,
                        borderRadius: '2px',
                      },
                      transform: 'translateX(-100%)',
                      marginLeft: { xs: '-8px', sm: '-16px' },
                    }}
                  >
                    {milestoneInfos.map((info, i) => (
                      <Tooltip key={i} title={info.tooltip}>
                        {info.icon}
                      </Tooltip>
                    ))}
                  </Box>
                );
              })()}

              {/* Card */}
              <Card
                sx={{
                  ml: { xs: 2, sm: 4 },
                  bgcolor: showdownTheme.cardBackground,
                  border: `1px solid ${showdownTheme.border}`,
                  '&:hover': {
                    borderColor: showdownTheme.accent,
                    cursor: 'pointer',
                  },
                }}
                onClick={() => navigate(`/pokemon/${pokemon.collectionId}`)}
              >
                <CardContent sx={{ p: 1.5 }}>
                  <Grid container spacing={1} alignItems="center">
                    {/* Date with rare indicator */}
                    <Grid item xs={12} sm={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: showdownTheme.text,
                            fontFamily: showdownTheme.fontFamily,
                            display: 'block',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {format(new Date(pokemon.caughtDate || ''), 'MMM d, yyyy')}
                        </Typography>
                        {isRareShiny(pokemon) && (
                          <Tooltip title="Rare Shiny">
                            <StarIcon 
                              sx={{ 
                                color: showdownTheme.accent,
                                fontSize: 12,
                              }} 
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </Grid>

                    {/* Pokéball */}
                    <Grid item xs={1} sm={1}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                        }}
                      >
                        <Tooltip title={pokemon.pokeball}>
                          <img 
                            src={getPokeballImageUrl(pokemon.pokeball)} 
                            alt={pokemon.pokeball} 
                            style={{ 
                              width: 20, 
                              height: 20,
                              filter: 'drop-shadow(0px 0px 2px rgba(0,0,0,0.3))'
                            }} 
                          />
                        </Tooltip>
                      </Box>
                    </Grid>

                    {/* Sprite */}
                    <Grid item xs={2} sm={1}>
                      <Box
                        sx={{
                          position: 'relative',
                          width: '100%',
                          paddingTop: '100%',
                          borderRadius: 1,
                          overflow: 'hidden',
                          bgcolor: getTypeColor(pokemon.types[0].type.name),
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={getAnimatedSpriteUrl(pokemon)}
                          alt={pokemon.name}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            p: 0.5,
                          }}
                        />
                      </Box>
                    </Grid>

                    {/* Info */}
                    <Grid item xs={9} sm={8}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: showdownTheme.text,
                            fontFamily: showdownTheme.fontFamily,
                            fontWeight: 'bold',
                          }}
                        >
                          {pokemon.nickname || capitalizeFirstLetter(pokemon.name)}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: showdownTheme.text,
                            fontFamily: showdownTheme.fontFamily,
                          }}
                        >
                          {formatPokedexNumber(pokemon.id ?? 0)}
                        </Typography>
                        {isVariantForm(pokemon.id ?? 0) && (
                          <Chip
                            label={capitalizeFirstLetter(getFormName(pokemon.name) || 'Form')}
                            size="small"
                            sx={{ 
                              height: 20,
                              '& .MuiChip-label': { px: 1 },
                              bgcolor: getTypeColor(pokemon.types[0].type.name),
                              color: showdownTheme.text,
                              fontFamily: showdownTheme.fontFamily,
                            }}
                          />
                        )}
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {pokemon.types.map((type) => (
                            <TypeBadge key={type.type.name} type={type.type.name} size="small" />
                          ))}
                        </Box>
                        {pokemon.project && (
                          <Chip
                            label={pokemon.project}
                            size="small"
                            sx={{ 
                              height: 20,
                              '& .MuiChip-label': { px: 1 },
                              bgcolor: getTypeColor(pokemon.types[0].type.name),
                              color: showdownTheme.text,
                              fontFamily: showdownTheme.fontFamily,
                            }}
                          />
                        )}
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/pokemon/${pokemon.collectionId}/edit`);
                          }}
                          sx={{ 
                            ml: 'auto',
                            color: showdownTheme.text,
                            '&:hover': {
                              color: showdownTheme.accent,
                            },
                            p: 0.5,
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export default Timeline; 