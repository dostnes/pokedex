import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { RootState, AppDispatch } from '../store/store';
import { removeFromCollection } from '../store/pokemonSlice';
import { capitalizeFirstLetter } from '../services/pokeApi';
import { MyPokemon } from '../types/pokemon';
import TypeBadge from '../components/TypeBadge';
import StatBar from '../components/StatBar';

const PokemonDetails = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Enhanced debugging logs
  console.log('Debug URL info:', {
    params: useParams(),
    pathname: location.pathname,
    fullUrl: window.location.href,
    id
  });

  const myCollection = useSelector((state: RootState) => state.pokemon.myCollection);

  // Find pokemon using collectionId
  const pokemon = id 
    ? myCollection.find((p: MyPokemon) => p.collectionId === id)
    : null;

  console.log('Debug Pokemon info:', {
    foundPokemon: pokemon?.name,
    id,
    totalInCollection: myCollection.length,
    availableIds: myCollection.map(p => p.collectionId)
  });

  const handleRemove = () => {
    if (!id) {
      console.log('No collectionId available for removal', {
        currentUrl: window.location.href,
        availableIds: myCollection.map(p => p.collectionId)
      });
      return;
    }

    try {
      console.log('Attempting to remove Pokémon:', {
        id,
        pokemonName: pokemon?.name
      });

      dispatch(removeFromCollection(id));
      navigate('/');
      
      console.log('Pokemon removed successfully');
    } catch (error) {
      console.error('Error removing Pokémon:', error);
    }
  };

  // Show loading state if we don't have the collection data yet
  if (!myCollection) {
    return <Typography>Loading...</Typography>;
  }

  // Show not found state if we can't find the Pokémon
  if (!pokemon) {
    return (
      <Box>
        <Typography>Pokémon not found</Typography>
        <Typography variant="caption" display="block">
          Debug info: Collection size: {myCollection.length}, 
          Looking for ID: {id}
        </Typography>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
        >
          Back to Collection
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
        >
          Back to Collection
        </Button>
        
        <Button
          color="error"
          variant="contained"
          onClick={handleRemove}
        >
          Remove from Collection
        </Button>
      </Box>

      <Card sx={{ position: 'relative' }}>
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
          #{pokemon.id.toString().padStart(3, '0')}
        </Typography>

        {pokemon.shiny && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 70,
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
            height: 300,
            objectFit: 'contain',
            bgcolor: '#f5f5f5',
            p: 2,
          }}
        />

        <CardContent>
          <Typography variant="h4" gutterBottom>
            {pokemon.nickname || capitalizeFirstLetter(pokemon.name)}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {pokemon.types.map((type: { type: { name: string } }, index: number) => (
              <TypeBadge
                key={`${pokemon.collectionId}-type-${type.type.name}-${index}`}
                type={type.type.name}
              />
            ))}
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>Basic Info</Typography>
                <Typography>Level: {pokemon.level}</Typography>
                <Typography>Nature: {pokemon.nature}</Typography>
              </Paper>

              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>Moves</Typography>
                {pokemon.moves.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {pokemon.moves.map((move: string, index: number) => (
                      <Typography key={`${pokemon.collectionId}-move-${index}`}>
                        {capitalizeFirstLetter(move)}
                      </Typography>
                    ))}
                  </Box>
                ) : (
                  <Typography color="text.secondary">No moves</Typography>
                )}
              </Paper>

              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Base Stats</Typography>
                <Box sx={{ mt: 2 }}>
                  {pokemon.stats.map((stat) => (
                    <StatBar
                      key={stat.stat.name}
                      statName={stat.stat.name}
                      value={stat.base_stat}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>IVs</Typography>
                {Object.entries(pokemon.ivs).map(([stat, value]: [string, number], index: number) => (
                  <Box 
                    key={`${pokemon.collectionId}-iv-${stat}-${index}`} 
                    sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
                  >
                    <Typography>{capitalizeFirstLetter(stat)}:</Typography>
                    <Typography>{value}</Typography>
                  </Box>
                ))}
              </Paper>

              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>EVs</Typography>
                {Object.entries(pokemon.evs).map(([stat, value]: [string, number], index: number) => (
                  <Box 
                    key={`${pokemon.collectionId}-ev-${stat}-${index}`} 
                    sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
                  >
                    <Typography>{capitalizeFirstLetter(stat)}:</Typography>
                    <Typography>{value.toString()}</Typography>
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PokemonDetails;