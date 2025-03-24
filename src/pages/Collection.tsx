import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  SelectChangeEvent,
  Chip,
  IconButton,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { RootState } from '../store/store';
import { fetchAllPokemon, clearCollection } from '../store/pokemonSlice';
import type { AppDispatch } from '../store/store';
import { capitalizeFirstLetter } from '../services/pokeApi';
import TypeBadge from '../components/TypeBadge';
import { formatPokedexNumber, isVariantForm, getFormName, getBaseName, getAnimatedSpriteUrl } from '../utils/pokemonUtils';
import { showdownTheme } from '../theme/showdownTheme';

// Add type color mapping
const typeColors: { [key: string]: string } = {
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

// Map of Poké Ball names to their image filenames
const pokeballMap: Record<string, string> = {
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
};

// Function to get the Poké Ball image URL from GitHub
const getPokeballImageUrl = (pokeball: string): string => {
  const pokeballFileName = pokeballMap[pokeball] || 'poke-ball'; // Default to Poke Ball if not found
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${pokeballFileName}.png`;
};

type SortOption = 'pokedexNumber' | 'recentlyAdded';

const Collection = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { myCollection, loading, error, isInitialized } = useSelector((state: RootState) => state.pokemon);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('pokedexNumber');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  // Add debugging to see collection data
  useEffect(() => {
    console.log('Collection data:', myCollection);
  }, [myCollection]);

  // Add debugging for sort changes
  useEffect(() => {
    console.log('Sort option changed to:', sortBy);
  }, [sortBy]);

  const handleSortChange = (event: SelectChangeEvent) => {
    console.log('Sort changed to:', event.target.value);
    setSortBy(event.target.value as SortOption);
  };

  const handleProjectFilterChange = (event: SelectChangeEvent) => {
    setProjectFilter(event.target.value);
  };

  // First filter by search term and project
  const filteredCollection = myCollection.filter(pokemon => {
    const matchesSearch = pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pokemon.nickname && pokemon.nickname.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesProject = projectFilter === 'all' || pokemon.project === projectFilter;
    return matchesSearch && matchesProject;
  });

  // Then sort the filtered collection with improved logging
  const sortedCollection = [...filteredCollection].sort((a, b) => {
    if (sortBy === 'pokedexNumber') {
      console.log(`Sorting by Pokédex: ${a.name}(${a.id || 0}) vs ${b.name}(${b.id || 0})`);
      return (a.id || 0) - (b.id || 0);
    } else { // recentlyAdded
      // Extract timestamp from collectionId
      const aTime = parseInt(a.collectionId.split('-')[1]) || 0;
      const bTime = parseInt(b.collectionId.split('-')[1]) || 0;
      console.log(`Using collectionId: ${a.name}(${aTime}) vs ${b.name}(${bTime})`);
      return bTime - aTime; // Higher timestamp means more recently added
    }
  });

  const handlePokemonClick = (pokemon: typeof filteredCollection[0]) => {
    const navigatePath = `/pokemon/${pokemon.collectionId}`;
    navigate(navigatePath);
  };

  const handleClearCollection = () => {
    if (window.confirm('Are you sure you want to clear your entire collection?')) {
      dispatch(clearCollection());
    }
  };

  // Force re-render when sort option changes
  const [renderKey, setRenderKey] = useState(0);
  useEffect(() => {
    setRenderKey(prev => prev + 1);
  }, [sortBy]);

  const handleQuickEdit = (event: React.MouseEvent, pokemon: typeof filteredCollection[0]) => {
    event.stopPropagation(); // Prevent card click
    navigate(`/pokemon/${pokemon.collectionId}?edit=true`);
  };

  const hasPerfectIVs = (pokemon: typeof filteredCollection[0]) => {
    return Object.values(pokemon.ivs).every(iv => iv === 31);
  };

  const hasHiddenAbility = (pokemon: typeof filteredCollection[0]) => {
    return pokemon.abilities?.find(a => a.ability.name === pokemon.ability)?.is_hidden;
  };

  const getTypeBackgroundColor = (pokemon: typeof filteredCollection[0]) => {
    const firstType = pokemon.types[0]?.type.name.toLowerCase() || 'normal';
    return typeColors[firstType] || typeColors.normal;
  };

  return (
    <Box sx={{ 
      bgcolor: showdownTheme.background,
      minHeight: 'auto',
      p: 1,
      fontFamily: showdownTheme.fontFamily
    }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: showdownTheme.header,
              fontFamily: showdownTheme.fontFamily
            }}
          >
            My Pokémon Collection
          </Typography>
          <Button
            color="error"
            variant="outlined"
            onClick={handleClearCollection}
            sx={{ fontFamily: showdownTheme.fontFamily }}
          >
            Clear Collection
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by name or nickname..."
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
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="sort-select-label" sx={{ fontFamily: showdownTheme.fontFamily }}>Sort By</InputLabel>
            <Select
              labelId="sort-select-label"
              id="sort-select"
              value={sortBy}
              label="Sort By"
              onChange={handleSortChange}
              sx={{ fontFamily: showdownTheme.fontFamily }}
            >
              <MenuItem value="pokedexNumber">Pokédex Number</MenuItem>
              <MenuItem value="recentlyAdded">Recent</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
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
              <MenuItem value="Competitive">Competitive</MenuItem>
              <MenuItem value="Shiny Living Dex">Shiny Living Dex</MenuItem>
              <MenuItem value="Living Dex">Living Dex</MenuItem>
              <MenuItem value="Trophy">Trophy</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : (
        <>
          <Grid container spacing={3} key={renderKey}>
            {sortedCollection.map((pokemon) => {
              const pokemonKey = `pokemon-${pokemon.collectionId}`;
              const formName = getFormName(pokemon.name)
                ? capitalizeFirstLetter(getFormName(pokemon.name) || '')
                : 'Form';
              
              return (
                <Grid item xs={12} sm={6} md={4} key={pokemonKey}>
                  <Card
                    onClick={() => handlePokemonClick(pokemon)}
                    sx={{
                      cursor: 'pointer',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                      bgcolor: showdownTheme.cardBackground,
                      border: `1px solid ${showdownTheme.border}`,
                      boxShadow: 'none',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: (theme) => theme.shadows[8],
                      },
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: showdownTheme.secondaryText,
                        fontFamily: showdownTheme.fontFamily,
                        zIndex: 2,
                        fontSize: '1.1rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 500,
                      }}
                    >
                      {formatPokedexNumber(pokemon.id || 0)}
                    </Typography>
                    
                    {isVariantForm(pokemon.id || 0) && (
                      <Chip
                        label={formName}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          zIndex: 2,
                          fontSize: '0.75rem',
                          height: 22,
                          backgroundColor: 'rgba(25, 118, 210, 0.1)',
                          border: '1px solid rgba(25, 118, 210, 0.3)',
                          color: showdownTheme.accent,
                          fontWeight: 'medium',
                          fontFamily: showdownTheme.fontFamily
                        }}
                      />
                    )}
                    
                    {pokemon.shiny && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: isVariantForm(pokemon.id || 0) ? 36 : 8,
                          left: 8,
                          bgcolor: 'warning.main',
                          color: 'warning.contrastText',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          zIndex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          boxShadow: 1,
                          fontFamily: showdownTheme.fontFamily
                        }}
                      >
                        <span>✨</span>
                        <span>SHINY</span>
                      </Box>
                    )}

                    {pokemon.pokeball && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: isVariantForm(pokemon.id || 0) ? (pokemon.shiny ? 64 : 36) : (pokemon.shiny ? 36 : 8),
                          left: 8,
                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          zIndex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          boxShadow: 1,
                          border: '1px solid rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <img
                          src={getPokeballImageUrl(pokemon.pokeball)}
                          alt={pokemon.pokeball}
                          style={{
                            width: '20px',
                            height: '20px',
                            objectFit: 'contain'
                          }}
                        />
                      </Box>
                    )}
                    
                    <Box
                      sx={{
                        position: 'relative',
                        bgcolor: getTypeBackgroundColor(pokemon),
                        borderRadius: '8px 8px 0 0',
                        overflow: 'hidden'
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={getAnimatedSpriteUrl(pokemon)}
                        alt={pokemon.name}
                        sx={{
                          height: 100,
                          objectFit: 'contain',
                          imageRendering: 'pixelated',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            transition: 'transform 0.2s ease-in-out'
                          },
                          bgcolor: 'transparent',
                          p: 2,
                          width: '100%',
                          backgroundSize: 'contain',
                          backgroundPosition: 'center'
                        }}
                      />
                    </Box>
                    
                    <CardContent sx={{ flexGrow: 1, p: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600,
                            fontFamily: showdownTheme.fontFamily,
                            color: showdownTheme.text
                          }}
                        >
                          {pokemon.nickname || (isVariantForm(pokemon.id || 0) 
                            ? `${capitalizeFirstLetter(getBaseName(pokemon.name))} (${formName})` 
                            : capitalizeFirstLetter(pokemon.name))}
                        </Typography>
                        <Tooltip title="Quick Edit">
                          <IconButton
                            size="small"
                            onClick={(e) => handleQuickEdit(e, pokemon)}
                            sx={{ 
                              color: showdownTheme.accent,
                              '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.1)' }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>

                      <Box sx={{ mb: 1 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: showdownTheme.secondaryText,
                            fontFamily: showdownTheme.fontFamily,
                            fontSize: '0.8rem'
                          }}
                        >
                          {pokemon.nature}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        {pokemon.types.map((type, index) => (
                          <TypeBadge
                            key={`${pokemon.collectionId}-type-${type.type.name}-${index}`}
                            type={type.type.name}
                            size="small"
                          />
                        ))}
                        <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                          {hasPerfectIVs(pokemon) && (
                            <Tooltip title="Perfect IVs">
                              <EmojiEventsIcon 
                                sx={{ 
                                  fontSize: '1rem',
                                  color: '#FFD700',
                                  filter: 'drop-shadow(0 0 2px rgba(255, 215, 0, 0.5))'
                                }} 
                              />
                            </Tooltip>
                          )}
                          {hasHiddenAbility(pokemon) && (
                            <Tooltip title="Hidden Ability">
                              <AutoFixHighIcon 
                                sx={{ 
                                  fontSize: '1rem',
                                  color: '#9C27B0',
                                  filter: 'drop-shadow(0 0 2px rgba(156, 39, 176, 0.5))'
                                }} 
                              />
                            </Tooltip>
                          )}
                          <Chip
                            label={pokemon.project}
                            size="small"
                            sx={{
                              bgcolor: (theme) => {
                                switch (pokemon.project) {
                                  case 'Competitive':
                                    return showdownTheme.accent;
                                  case 'Shiny Living Dex':
                                    return '#FFD700';
                                  case 'Living Dex':
                                    return '#4CAF50';
                                  case 'Trophy':
                                    return '#FF9800';
                                  default:
                                    return showdownTheme.secondaryText;
                                }
                              },
                              color: 'white',
                              fontFamily: showdownTheme.fontFamily,
                              '& .MuiChip-label': {
                                fontSize: '0.7rem',
                                fontWeight: 500,
                                px: 1
                              }
                            }}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {sortedCollection.length === 0 && (
            <Box sx={{ 
              textAlign: 'center', 
              mt: 8, 
              p: 4, 
              bgcolor: showdownTheme.cardBackground,
              border: `1px solid ${showdownTheme.border}`,
              borderRadius: 2,
              boxShadow: 'none'
            }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  color: showdownTheme.header,
                  fontFamily: showdownTheme.fontFamily
                }}
              >
                Your collection is empty
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: showdownTheme.secondaryText,
                  fontFamily: showdownTheme.fontFamily
                }}
              >
                Add some Pokémon to get started!
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Collection;