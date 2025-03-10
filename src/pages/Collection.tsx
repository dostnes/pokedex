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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { RootState } from '../store/store';
import { fetchAllPokemon, clearCollection } from '../store/pokemonSlice';
import type { AppDispatch } from '../store/store';
import { capitalizeFirstLetter } from '../services/pokeApi';
import TypeBadge from '../components/TypeBadge';
import { formatPokedexNumber, isVariantForm, getFormName, getBaseName } from '../utils/pokemonUtils';

type SortOption = 'pokedexNumber' | 'recentlyAdded';

const Collection = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { myCollection, loading, error, isInitialized } = useSelector((state: RootState) => state.pokemon);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('pokedexNumber');

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

  // First filter by search term
  const filteredCollection = myCollection.filter(pokemon =>
    pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pokemon.nickname && pokemon.nickname.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Then sort the filtered collection with improved logging
  const sortedCollection = [...filteredCollection].sort((a, b) => {
    if (sortBy === 'pokedexNumber') {
      console.log(`Sorting by Pokédex: ${a.name}(${a.id}) vs ${b.name}(${b.id})`);
      return a.id - b.id;
    } else { // recentlyAdded
      // Try multiple approaches to get timestamp information
      let aTime, bTime;
      
      // Method 1: Use timestamp property if available
      if (a.timestamp && b.timestamp) {
        aTime = a.timestamp;
        bTime = b.timestamp;
        console.log(`Using timestamp: ${a.name}(${aTime}) vs ${b.name}(${bTime})`);
      } 
      // Method 2: Extract from collectionId
      else if (a.collectionId && b.collectionId) {
        aTime = parseInt(a.collectionId.split('-')[1]) || 0;
        bTime = parseInt(b.collectionId.split('-')[1]) || 0;
        console.log(`Using collectionId: ${a.name}(${aTime}) vs ${b.name}(${bTime})`);
      }
      // Method 3: Fallback to using collectionId as a whole
      else {
        aTime = a.collectionId || '0';
        bTime = b.collectionId || '0';
        console.log(`Using collectionId string: ${a.name}(${aTime}) vs ${b.name}(${bTime})`);
        return bTime.localeCompare(aTime); // String comparison for collectionIds
      }
      
      // Numeric comparison for timestamps
      if (typeof aTime === 'number' && typeof bTime === 'number') {
        return bTime - aTime; // Higher timestamp means more recently added
      }
      
      // Default return if all else fails
      return 0;
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

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
            My Pokémon Collection
          </Typography>
          <Button
            color="error"
            variant="outlined"
            onClick={handleClearCollection}
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
          />
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="sort-select-label">Sort By</InputLabel>
            <Select
              labelId="sort-select-label"
              id="sort-select"
              value={sortBy}
              label="Sort By"
              onChange={handleSortChange}
            >
              <MenuItem value="pokedexNumber">Pokédex Number</MenuItem>
              <MenuItem value="recentlyAdded">Recent</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {loading && !isInitialized ? (
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
              // Capitalize name
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
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: (theme) => theme.shadows[8],
                      },
                    }}
                  >
                    {/* Normalized Pokédex number */}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: 'rgba(0, 0, 0, 0.6)',
                        fontFamily: 'cursive',
                        zIndex: 2,
                        fontSize: '1.1rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 500,
                      }}
                    >
                      {formatPokedexNumber(pokemon.id)}
                    </Typography>
                    
                    {/* Form indicator if applicable */}
                    {isVariantForm(pokemon.id) && (
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
                          color: 'primary.main',
                          fontWeight: 'medium',
                        }}
                      />
                    )}
                    
                    {pokemon.shiny && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: isVariantForm(pokemon.id) ? 36 : 8,
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
                        }}
                      >
                        <span>✨</span>
                        <span>SHINY</span>
                      </Box>
                    )}
                    
                    <CardMedia
                      component="img"
                      image={pokemon.shiny 
                        ? pokemon.sprites.other.home.front_shiny 
                        : pokemon.sprites.other.home.front_default}
                      alt={pokemon.name}
                      sx={{
                        objectFit: 'contain',
                        bgcolor: '#f5f5f5',
                        p: 2,
                        height: '200px',
                        width: '100%',
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                      }}
                    />
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        {pokemon.nickname || (isVariantForm(pokemon.id) 
                          ? `${capitalizeFirstLetter(getBaseName(pokemon.name))} (${formName})` 
                          : capitalizeFirstLetter(pokemon.name))}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 1 }}>
                        Level {pokemon.level} • {pokemon.nature}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {pokemon.types.map((type, index) => (
                          <TypeBadge
                            key={`${pokemon.collectionId}-type-${type.type.name}-${index}`}
                            type={type.type.name}
                            size="small"
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {sortedCollection.length === 0 && (
            <Box sx={{ textAlign: 'center', mt: 8, p: 4, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
              <Typography variant="h6" gutterBottom>
                Your collection is empty
              </Typography>
              <Typography variant="body1" color="text.secondary">
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