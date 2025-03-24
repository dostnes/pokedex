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
  LinearProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  Link,
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
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SpeedIcon from '@mui/icons-material/Speed';
import SchoolIcon from '@mui/icons-material/School';
import { RootState, AppDispatch } from '../store/store';
import { removeFromCollection, updatePokemon } from '../store/pokemonSlice';
import { capitalizeFirstLetter } from '../services/pokeApi';
import { MyPokemon } from '../types/pokemon';
import TypeBadge from '../components/TypeBadge';
import StatBar from '../components/StatBar';
import { format } from 'date-fns';
import { 
  formatPokedexNumber, 
  isVariantForm, 
  getFormName, 
  getAnimatedSpriteUrl, 
  getNatureMultiplier,
  mapStatNameToProperty,
  calculateTotalStat
} from '../utils/pokemonUtils';
import EVDistributor from '../components/EVDistributor';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Snackbar from '@mui/material/Snackbar';
import { showdownTheme } from '../theme/showdownTheme';
import MoveSelector from '../components/MoveSelector';
import MoveDetails from '../components/MoveDetails';
import { moveService } from '../services/moveService';

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

// Fix the pokeball colors type
const pokeballColors = showdownTheme.pokeballColors as Record<string, { main: string }>;

// Remove the duplicate showdownTheme object
// Remove the duplicate getStatColor function
// Remove the duplicate mapStatNameToProperty function
// Remove the duplicate formatStatName function
// Remove the duplicate capitalizeFirstLetter function

const PokemonDetails = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editedPokemon, setEditedPokemon] = useState<MyPokemon | null>(null);
  const [imageError, setImageError] = useState(false);
  const [showCopySnackbar, setShowCopySnackbar] = useState(false);
  const [moveData, setMoveData] = useState<Record<string, any>>({});

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

  // Check for edit query parameter and open dialog if present
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('edit') === 'true' && pokemon) {
      handleEditClick();
    }
  }, [location.search, pokemon]);

  // Update editedPokemon when pokemon changes
  useEffect(() => {
    if (pokemon) {
      setEditedPokemon(pokemon);
      setImageError(false); // Reset image error state when pokemon changes
    }
  }, [pokemon]);

  // Load move data when pokemon changes
  useEffect(() => {
    if (pokemon?.moves) {
      const loadMoveData = async () => {
        const data: Record<string, any> = {};
        for (const move of pokemon.moves) {
          if (move) {
            const moveInfo = moveService.getMoveByName(move);
            if (moveInfo) {
              data[move] = moveInfo;
            }
          }
        }
        setMoveData(data);
      };
      loadMoveData();
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

  const handleRemoveClick = () => {
    setIsDeleteDialogOpen(true);
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
      const moves = [...pokemon.moves];
      // If no moves are set, set Tackle as the first move
      if (!moves[0]) {
        moves[0] = 'tackle';
      }
      setEditedPokemon({
        ...pokemon,
        moves,
        project: pokemon.project || 'Other'
      });
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

  // Add this function inside your PokemonDetails component
  const generateShowdownImport = (pokemon: MyPokemon): string => {
    // Start with the Pokémon name or nickname
    let showdownText = pokemon.nickname || capitalizeFirstLetter(pokemon.name);
    
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
    const evs = pokemon.evs || {};
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
    const ivs = pokemon.ivs || {};
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

  return (
    <Box sx={{ 
      bgcolor: showdownTheme.background,
      minHeight: 'auto',
      p: 1,
      fontFamily: showdownTheme.fontFamily
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          variant="outlined"
          sx={{ fontFamily: showdownTheme.fontFamily }}
        >
          Back to Collection
        </Button>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ContentCopyIcon />}
            onClick={handleCopyToShowdown}
            sx={{ mr: 1, fontFamily: showdownTheme.fontFamily }}
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
            onClick={handleRemoveClick}
            sx={{ fontFamily: showdownTheme.fontFamily }}
          >
            Remove
          </Button>
        </Box>
      </Box>

      <Snackbar
  open={showCopySnackbar}
  autoHideDuration={3000}
  onClose={() => setShowCopySnackbar(false)}
  message="Copied to clipboard for Pokémon Showdown!"
/>

      <Grid container spacing={1}>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            bgcolor: showdownTheme.cardBackground,
            border: `1px solid ${showdownTheme.border}`,
            boxShadow: 'none'
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <Typography 
          variant="body2" 
          sx={{ 
                    color: showdownTheme.secondaryText,
                    fontFamily: showdownTheme.fontFamily,
                    fontSize: '0.9rem',
                    mb: 0.5
                  }}
                >
                  {formatPokedexNumber(pokemon.id ?? 0)}
                  {isVariantForm(pokemon.id ?? 0) && (
            <Typography
              component="span"
              sx={{
                fontSize: '0.8rem',
                display: 'block',
                textAlign: 'center',
                        color: showdownTheme.secondaryText,
                        fontFamily: showdownTheme.fontFamily
              }}
              >
                {getFormName(pokemon.name) || 'Form'}
            </Typography>
          )}
        </Typography>
                <CardMedia
                  component="img"
                  image={getAnimatedSpriteUrl(pokemon)}
                  alt={pokemon.name}
                  sx={{
                    height: 120,
                    width: 120,
                    objectFit: 'contain',
                    imageRendering: 'pixelated',
                    bgcolor: 'transparent'
                  }}
                />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold',
                    fontFamily: showdownTheme.fontFamily,
                    fontSize: '1.1rem'
                  }}
                >
                  {pokemon.nickname || capitalizeFirstLetter(pokemon.name)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {pokemon.types.map((type: { type: { name: string } }, index: number) => (
                    <TypeBadge
                      key={`${pokemon.collectionId}-type-${type.type.name}-${index}`}
                      type={type.type.name}
                    />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Status Indicators Box */}
          <Card sx={{ 
            bgcolor: showdownTheme.cardBackground,
            border: `1px solid ${showdownTheme.border}`,
            boxShadow: 'none',
            mt: 1
          }}>
            <CardContent sx={{ p: 1.5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {Object.values(pokemon.ivs).every(iv => iv === 31) && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmojiEventsIcon sx={{ color: '#FFD700', fontSize: '1.2rem' }} />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#FFD700',
                        fontFamily: showdownTheme.fontFamily,
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}
                    >
                      Perfect IVs
                    </Typography>
                  </Box>
                )}
                {pokemon.abilities?.find(a => a.ability.name === pokemon.ability)?.is_hidden && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoFixHighIcon sx={{ color: '#9C27B0', fontSize: '1.2rem' }} />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#9C27B0',
                        fontFamily: showdownTheme.fontFamily,
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}
                    >
                      Hidden Ability
                    </Typography>
                  </Box>
                )}
                {pokemon.level === 100 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoAwesomeIcon sx={{ color: '#2196F3', fontSize: '1.2rem' }} />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#2196F3',
                        fontFamily: showdownTheme.fontFamily,
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}
                    >
                      Level 100
                    </Typography>
                  </Box>
                )}
        {pokemon.shiny && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon sx={{ color: '#FFD700', fontSize: '1.2rem' }} />
                    <Typography 
                      variant="body2" 
            sx={{
                        color: '#FFD700',
                        fontFamily: showdownTheme.fontFamily,
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}
                    >
                      Shiny
                    </Typography>
                  </Box>
                )}
                {Object.values(pokemon.evs).every(ev => ev === 252) && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SpeedIcon sx={{ color: '#4CAF50', fontSize: '1.2rem' }} />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#4CAF50',
                        fontFamily: showdownTheme.fontFamily,
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}
                    >
                      Max EVs
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Link 
                    href={`https://www.smogon.com/dex/sv/pokemon/${pokemon.name.toLowerCase()}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
              display: 'flex',
              alignItems: 'center',
                      gap: 1,
                      textDecoration: 'none',
                      color: showdownTheme.accent,
                      '&:hover': {
                        color: showdownTheme.header
                      }
                    }}
                  >
                    <SchoolIcon sx={{ fontSize: '1.2rem' }} />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: showdownTheme.fontFamily,
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}
                    >
                      Smogon Strategy
                    </Typography>
                  </Link>
          </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Grid container spacing={1}>
            {/* First row: Details and Moves side by side */}
            <Grid item xs={12} sm={6}>
              <Card sx={{ 
                bgcolor: showdownTheme.cardBackground,
                border: `1px solid ${showdownTheme.border}`,
                boxShadow: 'none',
                height: '100%' // Make the card take full height
              }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Typography 
                    variant="h6" 
          sx={{
                      color: showdownTheme.header,
                      fontFamily: showdownTheme.fontFamily,
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      mb: 1
                    }}
                  >
                    Details
            </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: showdownTheme.secondaryText,
                            fontFamily: showdownTheme.fontFamily,
                            fontSize: '0.8rem'
                          }}
                        >
                          Level: {pokemon.level}
                        </Typography>
                        {pokemon.gender === 'male' ? (
                          <MaleIcon sx={{ color: '#3273DC', fontSize: '1rem' }} />
                        ) : pokemon.gender === 'female' ? (
                          <FemaleIcon sx={{ color: '#FF6B6B', fontSize: '1rem' }} />
                        ) : (
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>N/A</Typography>
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: showdownTheme.secondaryText,
                          fontFamily: showdownTheme.fontFamily,
                          fontSize: '0.8rem',
                          mb: 0.5
                        }}
                      >
                        Nature: {pokemon.nature}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: showdownTheme.secondaryText,
                            fontFamily: showdownTheme.fontFamily,
                            fontSize: '0.8rem'
                          }}
                        >
                          Ability: {capitalizeFirstLetter(pokemon.ability || '')}
                        </Typography>
                        {pokemon.abilities?.find(a => a.ability.name === pokemon.ability)?.is_hidden && (
                          <Typography 
                            component="span" 
                            sx={{ 
                              color: showdownTheme.accent,
                              fontSize: '0.7rem',
                              fontStyle: 'italic'
                            }}
                          >
                            (Hidden)
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: showdownTheme.secondaryText,
                            fontFamily: showdownTheme.fontFamily,
                            fontSize: '0.8rem'
                          }}
                        >
                Caught with:
              </Typography>
                  {!imageError ? (
                    <Avatar 
                      src={pokeballImageUrl} 
                      alt={pokeballName}
                            sx={{ width: 16, height: 16 }}
                      onError={handleImageError}
                    />
                  ) : (
                          <SportsBaseballIcon sx={{ fontSize: '1rem', color: pokeballColor.main }} />
                        )}
                        <Typography 
                          variant="body2" 
                      sx={{
                            color: showdownTheme.secondaryText,
                            fontFamily: showdownTheme.fontFamily,
                            fontSize: '0.8rem'
                          }}
                        >
                          {pokeballName}
                        </Typography>
                </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card sx={{ 
                bgcolor: showdownTheme.cardBackground,
                border: `1px solid ${showdownTheme.border}`,
                boxShadow: 'none',
                height: '100%' // Make the card take full height
              }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: showdownTheme.header,
                      fontFamily: showdownTheme.fontFamily,
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      mb: 1
                    }}
                  >
                    Moves
                  </Typography>
                  <Grid container spacing={1}>
                    {pokemon.moves?.map((move, index) => (
                      <Grid item xs={12} key={index}>
                        {move ? (
                          <MoveDetails
                            move={moveData[move] ? {
                              name: moveData[move].name,
                              type: moveData[move].type
                            } : {
                              name: move,
                              type: 'Normal'
                            }}
                          />
                        ) : (
                          <Typography 
                            variant="body2"
                            sx={{ 
                              fontFamily: showdownTheme.fontFamily,
                              fontSize: '0.8rem',
                              color: showdownTheme.secondaryText,
                              fontStyle: 'italic',
                            }}
                          >
                            No move
                          </Typography>
                        )}
                      </Grid>
                    ))}
                  </Grid>
        </CardContent>
      </Card>
            </Grid>

            {/* Spread section with combined stats */}
            <Grid item xs={12} sm={6}>
              <Card sx={{ 
                bgcolor: showdownTheme.cardBackground,
                border: `1px solid ${showdownTheme.border}`,
                boxShadow: 'none',
                height: '100%' // Make the card take full height
              }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: showdownTheme.header,
                        fontFamily: showdownTheme.fontFamily,
                        fontSize: '1rem',
                        fontWeight: 'bold'
                      }}
                    >
                      Spread
                    </Typography>
            </Box>
                  <Grid container spacing={0.5}>
                    {pokemon.stats?.map((stat) => {
                      const statName = stat.stat.name;
                      const baseStat = Number(pokemon.stats.find(s => s.stat.name === statName)?.base_stat ?? 0);
                      const propertyName = mapStatNameToProperty(statName) as keyof typeof pokemon.evs;
                      const ev = Number(pokemon.evs[propertyName] ?? pokemon.evs[statName as keyof typeof pokemon.evs] ?? 0);
                      const iv = Number(pokemon.ivs[propertyName] ?? pokemon.ivs[statName as keyof typeof pokemon.ivs] ?? 31);
                      const level = pokemon.level ?? 100;
                      
                      // Calculate total stat using the imported function
                      const total = calculateTotalStat(baseStat, ev, iv, level, pokemon.nature, statName);
                      const natureMultiplier = getNatureMultiplier(pokemon.nature, statName);

                      return (
                        <Grid item xs={12} key={statName}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                width: 60,
                                fontFamily: showdownTheme.fontFamily,
                                fontSize: '0.8rem',
                                color: natureMultiplier === 1.1 ? '#4CAF50' : 
                                       natureMultiplier === 0.9 ? '#F44336' : 
                                       showdownTheme.text
                              }}
                            >
                              {statName === 'hp' ? 'HP' :
                               statName === 'attack' ? 'Attack' :
                               statName === 'defense' ? 'Defense' :
                               statName === 'special-attack' ? 'Sp. Atk.' :
                               statName === 'special-defense' ? 'Sp. Def.' :
                               statName === 'speed' ? 'Speed' : statName}
                  </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                width: 30,
                                textAlign: 'right',
                                fontFamily: showdownTheme.fontFamily,
                                fontSize: '0.8rem'
                              }}
                            >
                              {baseStat}
                            </Typography>
                            <Box sx={{ flexGrow: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={(() => {
                                  // Calculate the effective stat value (base + EVs)
                                  const effectiveStat = baseStat + (ev / 4);
                                  // Scale to a percentage (max stat in gen 9 is 255)
                                  return (effectiveStat / 255) * 100;
                                })()}
                                sx={{ 
                                  height: 6,
                                  borderRadius: 3,
                                  bgcolor: '#E0E0E0',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: (() => {
                                      // Calculate the effective stat value (base + EVs)
                                      const effectiveStat = baseStat + (ev / 4);
                                      
                                      // Different thresholds for different stat types
                                      if (statName === 'hp') {
                                        if (effectiveStat >= 100) return '#00C853';      // Green for very high HP
                                        if (effectiveStat >= 85) return '#64DD17';       // Light green for high HP
                                        if (effectiveStat >= 70) return '#FFD600';       // Yellow for good HP
                                        if (effectiveStat >= 55) return '#FFA000';       // Orange for average HP
                                        if (effectiveStat >= 40) return '#FF6D00';       // Dark orange for below average HP
                                        return '#F44336';                                // Red for low HP
                                      } else if (statName === 'attack' || statName === 'defense') {
                                        if (effectiveStat >= 90) return '#00C853';       // Green for very high Atk/Def
                                        if (effectiveStat >= 75) return '#64DD17';       // Light green for high Atk/Def
                                        if (effectiveStat >= 60) return '#FFD600';       // Yellow for good Atk/Def
                                        if (effectiveStat >= 45) return '#FFA000';       // Orange for average Atk/Def
                                        if (effectiveStat >= 30) return '#FF6D00';       // Dark orange for below average Atk/Def
                                        return '#F44336';                                // Red for low Atk/Def
                                      } else if (statName === 'special-attack' || statName === 'special-defense') {
                                        if (effectiveStat >= 90) return '#00C853';       // Green for very high SpA/SpD
                                        if (effectiveStat >= 75) return '#64DD17';       // Light green for high SpA/SpD
                                        if (effectiveStat >= 60) return '#FFD600';       // Yellow for good SpA/SpD
                                        if (effectiveStat >= 45) return '#FFA000';       // Orange for average SpA/SpD
                                        if (effectiveStat >= 30) return '#FF6D00';       // Dark orange for below average SpA/SpD
                                        return '#F44336';                                // Red for low SpA/SpD
                                      } else if (statName === 'speed') {
                                        if (effectiveStat >= 85) return '#00C853';       // Green for very high Speed
                                        if (effectiveStat >= 70) return '#64DD17';       // Light green for high Speed
                                        if (effectiveStat >= 55) return '#FFD600';       // Yellow for good Speed
                                        if (effectiveStat >= 40) return '#FFA000';       // Orange for average Speed
                                        if (effectiveStat >= 25) return '#FF6D00';       // Dark orange for below average Speed
                                        return '#F44336';                                // Red for low Speed
                                      }
                                      return '#F44336';                                  // Default to red for unknown stats
                                    })()
                                  }
                                }}
                              />
                </Box>
                            {ev > 0 && (
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  minWidth: 45,
                                  textAlign: 'right',
                                  fontFamily: showdownTheme.fontFamily,
                                  fontSize: '0.8rem',
                                  color: showdownTheme.secondaryText
                                }}
                              >
                                {ev} EV
                  </Typography>
                            )}
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                width: 40,
                                textAlign: 'right',
                                fontFamily: showdownTheme.fontFamily,
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                              }}
                            >
                              {total}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                width: 40,
                                textAlign: 'right',
                                fontFamily: showdownTheme.fontFamily,
                                fontSize: '0.8rem',
                                color: iv < 31 ? '#F44336' : showdownTheme.secondaryText
                              }}
                            >
                              {iv}
                            </Typography>
            </Box>
        </Grid>
                      );
                    })}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: showdownTheme.secondaryText,
                            fontFamily: showdownTheme.fontFamily,
                            fontSize: '0.8rem'
                          }}
                        >
                          {pokemon.nature} Nature
                        </Typography>
            </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Additional Details Card */}
            <Grid item xs={12} sm={6}>
              <Card sx={{ 
                bgcolor: showdownTheme.cardBackground,
                border: `1px solid ${showdownTheme.border}`,
                boxShadow: 'none',
                height: '100%' // Make the card take full height
              }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: showdownTheme.header,
                      fontFamily: showdownTheme.fontFamily,
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      mb: 1
                    }}
                  >
                    Additional Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon sx={{ color: showdownTheme.secondaryText, fontSize: '1rem' }} />
                        <Typography 
                          variant="body2"
                          sx={{ 
                            fontFamily: showdownTheme.fontFamily,
                            fontSize: '0.8rem',
                            color: showdownTheme.text
                          }}
                        >
                          {pokemon.location || 'Unknown Location'}
                        </Typography>
            </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <VideogameAssetIcon sx={{ color: showdownTheme.secondaryText, fontSize: '1rem' }} />
                        <Typography 
                          variant="body2"
                          sx={{ 
                            fontFamily: showdownTheme.fontFamily,
                            fontSize: '0.8rem',
                            color: showdownTheme.text
                          }}
                        >
                          {pokemon.caughtFrom || 'Main Series'}
                  </Typography>
            </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarMonthIcon sx={{ color: showdownTheme.secondaryText, fontSize: '1rem' }} />
                        <Typography 
                          variant="body2"
                          sx={{ 
                            fontFamily: showdownTheme.fontFamily,
                            fontSize: '0.8rem',
                            color: showdownTheme.text
                          }}
                        >
                          {formattedCaughtDate}
                  </Typography>
            </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmojiEventsIcon sx={{ color: showdownTheme.secondaryText, fontSize: '1rem' }} />
                        <Typography 
                          variant="body2"
                          sx={{ 
                            fontFamily: showdownTheme.fontFamily,
                            fontSize: '0.8rem',
                            color: showdownTheme.text
                          }}
                        >
                          {pokemon.project || 'Other'}
                        </Typography>
                      </Box>
                    </Grid>
                    {pokemon.comments && (
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <CommentIcon sx={{ color: showdownTheme.secondaryText, fontSize: '1rem', mt: 0.5 }} />
                          <Typography 
                            variant="body2"
                            sx={{ 
                              fontFamily: showdownTheme.fontFamily,
                              fontSize: '0.8rem',
                              color: showdownTheme.text
                            }}
                          >
                            {pokemon.comments}
                          </Typography>
              </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog 
        open={isEditDialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
      >
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
                    <Typography variant="subtitle2" gutterBottom>Gender</Typography>
                    <RadioGroup
                      row
                value={editedPokemon.gender || 'N/A'}
                      onChange={(e) => {
                        setEditedPokemon((prev: MyPokemon | null) => 
                          prev ? { ...prev, gender: e.target.value } : prev
                        );
                      }}
                    >
                      <FormControlLabel 
                        value="male" 
                        control={<Radio />} 
                        label={<MaleIcon sx={{ color: '#3273DC' }} />} 
                      />
                      <FormControlLabel 
                        value="female" 
                        control={<Radio />} 
                        label={<FemaleIcon sx={{ color: '#FF6B6B' }} />} 
                      />
                      <FormControlLabel 
                        value="N/A" 
                        control={<Radio />} 
                        label="N/A" 
                      />
                    </RadioGroup>
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
                evs={{
                  hp: editedPokemon.evs.hp || 0,
                  attack: editedPokemon.evs.attack || 0,
                  defense: editedPokemon.evs.defense || 0,
                  specialAttack: editedPokemon.evs.specialAttack || 0,
                  specialDefense: editedPokemon.evs.specialDefense || 0,
                  speed: editedPokemon.evs.speed || 0
                }}
  onChange={(newEVs) => {
    setEditedPokemon((prev: MyPokemon | null) => 
                    prev ? { 
                      ...prev, 
                      evs: {
                        hp: newEVs.hp,
                        attack: newEVs.attack,
                        defense: newEVs.defense,
                        specialAttack: newEVs.specialAttack,
                        specialDefense: newEVs.specialDefense,
                        speed: newEVs.speed
                      }
                    } : prev
    );
  }}
/>

        <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>Moves</Typography>
        <Grid container spacing={2}>
          {[0, 1, 2, 3].map((index) => (
            <Grid item xs={12} sm={6} key={`move-${index}`}>
              <MoveSelector
                value={editedPokemon.moves[index] ? {
                  name: editedPokemon.moves[index],
                  type: 'Normal', // This will be updated when a move is selected
                  category: 'Physical',
                  power: 40,
                  accuracy: 100,
                  pp: 35,
                  description: 'A physical attack.',
                } : null}
                onChange={(move) => {
                  const newMoves = [...editedPokemon.moves];
                  newMoves[index] = move?.name || '';
                  setEditedPokemon((prev: MyPokemon | null) => 
                    prev ? { ...prev, moves: newMoves } : prev
                  );
                }}
                label={`Move ${index + 1}`}
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

        <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>Project</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Project</InputLabel>
              <Select
                name="project"
                value={editedPokemon.project || 'Other'}
                onChange={handleSelectChange}
                label="Project"
              >
                <MenuItem value="Competitive">Competitive</MenuItem>
                <MenuItem value="Shiny Living Dex">Shiny Living Dex</MenuItem>
                <MenuItem value="Living Dex">Living Dex</MenuItem>
                <MenuItem value="Trophy">Trophy</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: showdownTheme.cardBackground,
            border: `1px solid ${showdownTheme.border}`,
            color: showdownTheme.text
          }
        }}
      >
        <DialogTitle sx={{ 
          fontFamily: showdownTheme.fontFamily,
          color: showdownTheme.header
        }}>
          Remove Pokémon
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ 
            fontFamily: showdownTheme.fontFamily,
            color: showdownTheme.text
          }}>
            Are you sure you want to remove {pokemon?.nickname || capitalizeFirstLetter(pokemon?.name || '')} from your collection?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsDeleteDialogOpen(false)}
            sx={{ fontFamily: showdownTheme.fontFamily }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              setIsDeleteDialogOpen(false);
              handleRemove();
            }}
            color="error"
            variant="contained"
            sx={{ fontFamily: showdownTheme.fontFamily }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PokemonDetails;