import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Paper,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Avatar,
  Tooltip,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import NatureIcon from '@mui/icons-material/Nature';
import WcIcon from '@mui/icons-material/Wc';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import CommentIcon from '@mui/icons-material/Comment';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { RootState, AppDispatch } from '../store/store';
import { removeFromCollection, updatePokemon } from '../store/pokemonSlice';
import { capitalizeFirstLetter } from '../services/pokeApi';
import { MyPokemon } from '../types/pokemon';
import TypeBadge from '../components/TypeBadge';
import StatBar from '../components/StatBar';
import { format } from 'date-fns';
import { formatPokedexNumber, isVariantForm, getFormName } from '../utils/pokemonUtils';
import EVDistributor from '../components/EVDistributor';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Snackbar from '@mui/material/Snackbar';

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

// Fallback colors for Poké Balls (used if image fails to load)
const pokeballColors: Record<string, { main: string; text: string }> = {
  'Poke Ball': { main: '#f44336', text: 'white' },
  'Great Ball': { main: '#2196f3', text: 'white' },
  'Ultra Ball': { main: '#ffc107', text: 'black' },
  'Master Ball': { main: '#9c27b0', text: 'white' },
  'Safari Ball': { main: '#4caf50', text: 'white' },
  'Level Ball': { main: '#ff9800', text: 'black' },
  'Lure Ball': { main: '#03a9f4', text: 'white' },
  'Moon Ball': { main: '#673ab7', text: 'white' },
  'Friend Ball': { main: '#8bc34a', text: 'black' },
  'Love Ball': { main: '#e91e63', text: 'white' },
  'Heavy Ball': { main: '#607d8b', text: 'white' },
  'Fast Ball': { main: '#ff5722', text: 'white' },
  'Sport Ball': { main: '#795548', text: 'white' },
  'Premier Ball': { main: '#f5f5f5', text: 'black' },
  'Repeat Ball': { main: '#f44336', text: 'white' },
  'Timer Ball': { main: '#ffeb3b', text: 'black' },
  'Nest Ball': { main: '#8bc34a', text: 'black' },
  'Net Ball': { main: '#00bcd4', text: 'white' },
  'Dive Ball': { main: '#0288d1', text: 'white' },
  'Luxury Ball': { main: '#212121', text: 'white' },
  'Heal Ball': { main: '#f48fb1', text: 'black' },
  'Quick Ball': { main: '#ffc107', text: 'black' },
  'Dusk Ball': { main: '#424242', text: 'white' },
  'Cherish Ball': { main: '#d32f2f', text: 'white' },
  'Dream Ball': { main: '#9c27b0', text: 'white' },
  'Beast Ball': { main: '#3f51b5', text: 'white' },
};

const PokemonDetails = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedPokemon, setEditedPokemon] = useState<MyPokemon | null>(null);
  const [imageError, setImageError] = useState(false);

  // Enhanced debugging logs
  console.log('Debug URL info:', {
    params: useParams(),
    pathname: location.pathname,
    fullUrl: window.location.href,
    id
  });


  const [showCopySnackbar, setShowCopySnackbar] = useState(false);
// Add this function inside your PokemonDetails component
const generateShowdownImport = (pokemon: MyPokemon): string => {
  // Start with the Pokémon name or nickname
  let showdownText = pokemon.nickname || capitalizeFirstLetter(pokemon.name);
  
  // Add gender if specified
  if (pokemon.gender && pokemon.gender !== 'N/A') {
    showdownText += ` (${pokemon.gender})`;
  }
  
  // Add item if available (not in your current data model, but could be added)
  // if (pokemon.item) {
  //   showdownText += ` @ ${pokemon.item}`;
  // }
  
  showdownText += '\n';
  
  // Add ability
  showdownText += `Ability: ${capitalizeFirstLetter(pokemon.ability || 'Unknown')}\n`;
  
  // Add level if not 100
  if (pokemon.level && pokemon.level < 100) {
    showdownText += `Level: ${pokemon.level}\n`;
  }
  
  // Add shiny status if shiny
  if (pokemon.shiny) {
    showdownText += 'Shiny: Yes\n';
  }
  
  // Add Tera Type (default to Grass as requested)
  showdownText += 'Tera Type: Grass\n';
  
  // Add EVs if any are set
  const evs = pokemon.evs;
  const evEntries = Object.entries(evs).filter(([_, value]) => value > 0);
  
  if (evEntries.length > 0) {
    const evString = evEntries
      .map(([stat, value]) => {
        // Format the stat name for EVs
        let formattedStat;
        switch (stat.toLowerCase()) {
          case 'hp': formattedStat = 'HP'; break;
          case 'attack': formattedStat = 'Atk'; break;
          case 'defense': formattedStat = 'Def'; break;
          case 'special-attack': formattedStat = 'SpA'; break;
          case 'special-defense': formattedStat = 'SpD'; break;
          case 'speed': formattedStat = 'Spe'; break;
          default: formattedStat = stat;
        }
        return `${value} ${formattedStat}`;
      })
      .join(' / ');
    
    showdownText += `EVs: ${evString}\n`;
  }
  
  // Add IVs if any are not 31
  const ivs = pokemon.ivs;
  const ivEntries = Object.entries(ivs).filter(([_, value]) => value < 31);
  
  if (ivEntries.length > 0) {
    const ivString = ivEntries
      .map(([stat, value]) => {
        // Format the stat name for IVs (same as EVs)
        let formattedStat;
        switch (stat.toLowerCase()) {
          case 'hp': formattedStat = 'HP'; break;
          case 'attack': formattedStat = 'Atk'; break;
          case 'defense': formattedStat = 'Def'; break;
          case 'special-attack': formattedStat = 'SpA'; break;
          case 'special-defense': formattedStat = 'SpD'; break;
          case 'speed': formattedStat = 'Spe'; break;
          default: formattedStat = stat;
        }
        return `${value} ${formattedStat}`;
      })
      .join(' / ');
    
    showdownText += `IVs: ${ivString}\n`;
  }
  
  // Add nature
  showdownText += `${pokemon.nature} Nature\n`;
  
  // Add moves
  if (pokemon.moves && pokemon.moves.length > 0) {
    pokemon.moves.forEach(move => {
      if (move && move.trim()) {
        showdownText += `- ${capitalizeFirstLetter(move)}\n`;
      }
    });
  } else {
    // Add placeholder moves if none are specified
    showdownText += '- (No Moves)\n';
  }
  
  return showdownText;
};


  const myCollection = useSelector((state: RootState) => state.pokemon.myCollection);

  // Find pokemon using collectionId
  const pokemon = id 
    ? myCollection.find((p: MyPokemon) => p.collectionId === id)
    : null;

  // Update editedPokemon when pokemon changes
  useEffect(() => {
    if (pokemon) {
      setEditedPokemon(pokemon);
      setImageError(false); // Reset image error state when pokemon changes
    }
  }, [pokemon]);

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

  const handleCopyToShowdown = () => {
    // Add a type guard to check if pokemon exists
    if (!pokemon) {
      console.error('Cannot copy to Showdown: Pokemon is undefined');
      return;
    }
    
    const showdownText = generateShowdownImport(pokemon);
    navigator.clipboard.writeText(showdownText)
      .then(() => {
        setShowCopySnackbar(true);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };


  
  const handleEditClick = () => {
    if (pokemon) {
      setEditedPokemon(pokemon);
      setIsEditDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setIsEditDialogOpen(false);
  };

  const handleSaveChanges = () => {
    if (editedPokemon) {
      dispatch(updatePokemon(editedPokemon));
      setIsEditDialogOpen(false);
      
      // Reset image error state if Poké Ball changed
      if (editedPokemon.pokeball !== pokemon?.pokeball) {
        setImageError(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedPokemon((prev: MyPokemon | null) => prev ? { ...prev, [name]: value } : prev);
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setEditedPokemon((prev: MyPokemon | null) => prev ? { ...prev, [name]: value } : prev);
  };

  const handleImageError = () => {
    console.log('Poké Ball image failed to load');
    setImageError(true);
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

  // Format the caught date for display
  const formattedCaughtDate = pokemon.caughtDate 
    ? format(new Date(pokemon.caughtDate), 'MMMM d, yyyy')
    : 'Unknown';

  // Get Poké Ball info
  const pokeballName = pokemon.pokeball || 'Poke Ball';
  const pokeballImageUrl = getPokeballImageUrl(pokeballName);
  const pokeballColor = pokeballColors[pokeballName] || pokeballColors['Poke Ball'];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          variant="outlined"
        >
          Back to Collection
        </Button>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ContentCopyIcon />}
            onClick={handleCopyToShowdown}
            sx={{ mr: 1 }}
            variant="outlined"
            color="secondary"
          >
            Copy to Showdown
          </Button>
          <IconButton 
            color="primary" 
            onClick={handleEditClick} 
            sx={{ mr: 1 }}
          >
            <EditIcon />
          </IconButton>
          <Button
            color="error"
            variant="contained"
            onClick={handleRemove}
          >
            Remove from Collection
          </Button>
        </Box>
      </Box>

      <Snackbar
  open={showCopySnackbar}
  autoHideDuration={3000}
  onClose={() => setShowCopySnackbar(false)}
  message="Copied to clipboard for Pokémon Showdown!"
/>

      <Card sx={{ position: 'relative', mb: 3, overflow: 'visible', boxShadow: 3 }}>
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
          {isVariantForm(pokemon.id) && (
            <Typography
              component="span"
              sx={{
                fontSize: '0.8rem',
                display: 'block',
                textAlign: 'center',
                color: 'text.secondary'
              }}
              >
                {getFormName(pokemon.name) || 'Form'}
            </Typography>
          )}
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
            height: 300,
            objectFit: 'contain',
            bgcolor: '#f5f5f5',
            p: 2,
          }}
        />

        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" sx={{ flexGrow: 1, fontWeight: 600 }}>
              {pokemon.nickname || capitalizeFirstLetter(pokemon.name)}
            </Typography>
            
            {/* Poké Ball with "Caught with" label */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Caught with:
              </Typography>
              <Tooltip title={pokeballName}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {!imageError ? (
                    <Avatar 
                      src={pokeballImageUrl} 
                      alt={pokeballName}
                      sx={{ width: 32, height: 32 }}
                      onError={handleImageError}
                    />
                  ) : (
                    <Chip
                      icon={<SportsBaseballIcon />}
                      label={pokeballName}
                      size="small"
                      sx={{
                        bgcolor: pokeballColor.main,
                        color: pokeballColor.text,
                        fontWeight: 'bold',
                        '& .MuiChip-icon': {
                          color: pokeballColor.text,
                        },
                      }}
                    />
                  )}
                </Box>
              </Tooltip>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {pokemon.types.map((type: { type: { name: string } }, index: number) => (
              <TypeBadge
                key={`${pokemon.collectionId}-type-${type.type.name}-${index}`}
                type={type.type.name}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 0, mb: 3, borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: 1.5, px: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Basic Info</Typography>
            </Box>
            <List sx={{ py: 0 }}>
              <ListItem divider>
                <ListItemIcon>
                  <FitnessCenterIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Level" 
                  secondary={pokemon.level} 
                  primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
                  secondaryTypographyProps={{ color: 'text.primary', variant: 'body1', fontWeight: 500 }}
                />
              </ListItem>
              <ListItem divider>
                <ListItemIcon>
                  <NatureIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Nature" 
                  secondary={pokemon.nature} 
                  primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
                  secondaryTypographyProps={{ color: 'text.primary', variant: 'body1', fontWeight: 500 }}
                />
              </ListItem>
              <ListItem divider>
                <ListItemIcon>
                  <WcIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Gender" 
                  secondary={pokemon.gender || 'N/A'} 
                  primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
                  secondaryTypographyProps={{ color: 'text.primary', variant: 'body1', fontWeight: 500 }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AutoFixHighIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Ability" 
                  secondary={capitalizeFirstLetter(pokemon.ability || '')} 
                  primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
                  secondaryTypographyProps={{ color: 'text.primary', variant: 'body1', fontWeight: 500 }}
                />
              </ListItem>
            </List>
          </Paper>

          <Paper sx={{ p: 0, mb: 3, borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: 1.5, px: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Collection Details</Typography>
            </Box>
            <List sx={{ py: 0 }}>
              <ListItem divider>
                <ListItemIcon>
                  <CalendarMonthIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Caught Date" 
                  secondary={formattedCaughtDate} 
                  primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
                  secondaryTypographyProps={{ color: 'text.primary', variant: 'body1', fontWeight: 500 }}
                />
              </ListItem>
              <ListItem divider>
                <ListItemIcon>
                  <LocationOnIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Location" 
                  secondary={pokemon.location || 'Unknown'} 
                  primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
                  secondaryTypographyProps={{ color: 'text.primary', variant: 'body1', fontWeight: 500 }}
                />
              </ListItem>
              <ListItem divider>
                <ListItemIcon>
                  <VideogameAssetIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Caught From" 
                  secondary={pokemon.caughtFrom || 'Main Series'} 
                  primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
                  secondaryTypographyProps={{ color: 'text.primary', variant: 'body1', fontWeight: 500 }}
                />
              </ListItem>
              <ListItem divider>
                <ListItemIcon>
                  <PersonIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Original Trainer" 
                  secondary={pokemon.originalTrainer || 'You'} 
                  primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
                  secondaryTypographyProps={{ color: 'text.primary', variant: 'body1', fontWeight: 500 }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <BadgeIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Trainer ID" 
                  secondary={pokemon.trainerId || 'N/A'} 
                  primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
                  secondaryTypographyProps={{ color: 'text.primary', variant: 'body1', fontWeight: 500 }}
                />
              </ListItem>
            </List>
          </Paper>

          <Paper sx={{ p: 0, mb: 3, borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: 1.5, px: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Comments</Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              {pokemon.comments ? (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <CommentIcon color="primary" sx={{ mt: 0.5 }} />
                  <Typography sx={{ whiteSpace: 'pre-wrap', flex: 1 }}>
                    {pokemon.comments}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: 2, color: 'text.secondary' }}>
                  <CommentIcon sx={{ mt: 0.5 }} />
                  <Typography>No comments added.</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 0, mb: 3, borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: 1.5, px: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Base Stats</Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              {pokemon.stats.map((stat) => (
                <StatBar
                  key={stat.stat.name}
                  statName={stat.stat.name}
                  value={stat.base_stat}
                />
              ))}
            </Box>
          </Paper>

          <Paper sx={{ p: 0, mb: 3, borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: 1.5, px: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>IVs</Typography>
            </Box>
            <List sx={{ py: 0 }}>
              {Object.entries(pokemon.ivs).map(([stat, value]: [string, number], index: number) => (
                <ListItem 
                  key={`${pokemon.collectionId}-iv-${stat}-${index}`} 
                  divider={index < Object.keys(pokemon.ivs).length - 1}
                >
                  <ListItemText 
                    primary={capitalizeFirstLetter(stat)} 
                    primaryTypographyProps={{ color: 'text.secondary' }}
                  />
                  <Typography variant="body1" fontWeight={600} color="primary">
                    {value}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Paper>

          <Paper sx={{ p: 0, mb: 3, borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: 1.5, px: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>EVs</Typography>
            </Box>
            <List sx={{ py: 0 }}>
              {Object.entries(pokemon.evs).map(([stat, value]: [string, number], index: number) => (
                <ListItem 
                  key={`${pokemon.collectionId}-ev-${stat}-${index}`} 
                  divider={index < Object.keys(pokemon.evs).length - 1}
                >
                  <ListItemText 
                    primary={capitalizeFirstLetter(stat)} 
                    primaryTypographyProps={{ color: 'text.secondary' }}
                  />
                  <Typography variant="body1" fontWeight={600} color="primary">
                    {value.toString()}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Paper>

          <Paper sx={{ p: 0, borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: 1.5, px: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Moves</Typography>
            </Box>
            {pokemon.moves.length > 0 ? (
              <List sx={{ py: 0 }}>
                {pokemon.moves.map((move: string, index: number) => (
                  <ListItem 
                    key={`${pokemon.collectionId}-move-${index}`}
                    divider={index < pokemon.moves.length - 1}
                  >
                    <ListItemIcon>
                      <FlashOnIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={capitalizeFirstLetter(move)}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 2, display: 'flex', gap: 2, color: 'text.secondary' }}>
                <FlashOnIcon sx={{ mt: 0.5 }} />
                <Typography>No moves specified.</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
<Dialog open={isEditDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
  <DialogTitle>Edit {pokemon.name}</DialogTitle>
  <DialogContent dividers>
    {editedPokemon && (
      <Box sx={{ py: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>Basic Information</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nickname"
              name="nickname"
              value={editedPokemon.nickname || ''}
              onChange={handleInputChange}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Level"
              name="level"
              type="number"
              value={editedPokemon.level}
              onChange={handleInputChange}
              margin="normal"
              InputProps={{ inputProps: { min: 1, max: 100 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Nature</InputLabel>
              <Select
                name="nature"
                value={editedPokemon.nature}
                onChange={handleSelectChange}
                label="Nature"
              >
                {['Hardy', 'Lonely', 'Brave', 'Adamant', 'Naughty', 'Bold', 'Docile', 'Relaxed', 'Impish', 'Lax', 'Timid', 'Hasty', 'Serious', 'Jolly', 'Naive', 'Modest', 'Mild', 'Quiet', 'Bashful', 'Rash', 'Calm', 'Gentle', 'Sassy', 'Careful', 'Quirky'].map((nature) => (
                  <MenuItem key={nature} value={nature}>{nature}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Ability</InputLabel>
              <Select
                name="ability"
                value={editedPokemon.ability || ''}
                onChange={handleSelectChange}
                label="Ability"
              >
                {pokemon.abilities?.map((ability: any) => (
                  <MenuItem key={ability.ability.name} value={ability.ability.name}>
                    {capitalizeFirstLetter(ability.ability.name)}
                  </MenuItem>
                )) || (
                  <MenuItem value={editedPokemon.ability || ''}>
                    {capitalizeFirstLetter(editedPokemon.ability || '')}
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={editedPokemon.gender || 'N/A'}
                onChange={handleSelectChange}
                label="Gender"
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="N/A">N/A</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Shiny</InputLabel>
              <Select
                name="shiny"
                value={editedPokemon.shiny ? 'true' : 'false'}
                onChange={(e) => {
                  setEditedPokemon((prev: MyPokemon | null) => 
                    prev ? { ...prev, shiny: e.target.value === 'true' } : prev
                  );
                }}
                label="Shiny"
              >
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>Collection Details</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={editedPokemon.location || ''}
              onChange={handleInputChange}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Caught From"
              name="caughtFrom"
              value={editedPokemon.caughtFrom || ''}
              onChange={handleInputChange}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Poké Ball</InputLabel>
              <Select
                name="pokeball"
                value={editedPokemon.pokeball || 'Poke Ball'}
                onChange={handleSelectChange}
                label="Poké Ball"
              >
                {Object.keys(pokeballMap).map((ball) => (
                  <MenuItem key={ball} value={ball}>{ball}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Original Trainer"
              name="originalTrainer"
              value={editedPokemon.originalTrainer || ''}
              onChange={handleInputChange}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Trainer ID"
              name="trainerId"
              value={editedPokemon.trainerId || ''}
              onChange={handleInputChange}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Caught Date"
              name="caughtDate"
              type="date"
              value={editedPokemon.caughtDate ? new Date(editedPokemon.caughtDate).toISOString().split('T')[0] : ''}
              onChange={handleInputChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>IVs</Typography>
        <Grid container spacing={2}>
          {Object.entries(editedPokemon.ivs).map(([stat, value]) => (
            <Grid item xs={6} sm={4} md={2} key={`iv-${stat}`}>
              <TextField
                fullWidth
                label={capitalizeFirstLetter(stat)}
                type="number"
                value={value}
                onChange={(e) => {
                  const newValue = Math.min(31, Math.max(0, parseInt(e.target.value) || 0));
                  setEditedPokemon((prev: MyPokemon | null) => 
                    prev ? { 
                      ...prev, 
                      ivs: { ...prev.ivs, [stat]: newValue } 
                    } : prev
                  );
                }}
                margin="normal"
                InputProps={{ inputProps: { min: 0, max: 31 } }}
              />
            </Grid>
          ))}
        </Grid>

        <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>EVs</Typography>
        <EVDistributor
  evs={editedPokemon.evs as any}
  onChange={(newEVs) => {
    setEditedPokemon((prev: MyPokemon | null) => 
      prev ? { ...prev, evs: newEVs } : prev
    );
  }}
/>

        <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>Moves</Typography>
        <Grid container spacing={2}>
          {[0, 1, 2, 3].map((index) => (
            <Grid item xs={12} sm={6} key={`move-${index}`}>
              <TextField
                fullWidth
                label={`Move ${index + 1}`}
                value={editedPokemon.moves[index] || ''}
                onChange={(e) => {
                  const newMoves = [...editedPokemon.moves];
                  newMoves[index] = e.target.value;
                  setEditedPokemon((prev: MyPokemon | null) => 
                    prev ? { ...prev, moves: newMoves } : prev
                  );
                }}
                margin="normal"
              />
            </Grid>
          ))}
        </Grid>

        <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>Comments</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Comments"
              name="comments"
              value={editedPokemon.comments || ''}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={4}
            />
          </Grid>
        </Grid>
      </Box>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseDialog}>Cancel</Button>
    <Button onClick={handleSaveChanges} color="primary" variant="contained">
      Save Changes
    </Button>
  </DialogActions>
</Dialog>
                     </Box>
                   );
                 };
                 
                 export default PokemonDetails;