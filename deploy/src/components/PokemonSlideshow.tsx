import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Chip,
  Paper,
  Fade,
  LinearProgress,
  useTheme,
  Grid,
  Divider,
  Link,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import CommentIcon from '@mui/icons-material/Comment';
import NatureIcon from '@mui/icons-material/Nature';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SpeedIcon from '@mui/icons-material/Speed';
import SchoolIcon from '@mui/icons-material/School';
import { RootState } from '../store/store';
import { MyPokemon } from '../types/pokemon';
import TypeBadge from './TypeBadge';
import { capitalizeFirstLetter } from '../services/pokeApi';
import { formatPokedexNumber, isVariantForm, getFormName, getBaseName, getAnimatedSpriteUrl, getNatureMultiplier, mapStatNameToProperty, calculateTotalStat } from '../utils/pokemonUtils';
import { showdownTheme } from '../theme/showdownTheme';
import { format } from 'date-fns';
import MoveDetails from './MoveDetails';
import { moveService } from '../services/moveService';

interface PokemonSlideshowProps {
  interval?: number; // Time in milliseconds between slides
  fullscreen?: boolean; // Whether to show in fullscreen mode
}

// Progress bar component
const SlideshowProgress = React.memo(({ progress }: { progress: number }) => (
  <LinearProgress 
    variant="determinate" 
    value={progress} 
    sx={{ 
      height: 3,
      '& .MuiLinearProgress-bar': {
        transition: 'none', // Disable transition for smoother updates
      }
    }} 
  />
));

// Memoized Pokemon Card Component
const PokemonCard = React.memo(({ 
  pokemon, 
  formName, 
  onPokemonClick, 
  fadeIn 
}: { 
  pokemon: MyPokemon; 
  formName: string | null;
  onPokemonClick: () => void;
  fadeIn: boolean;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imageRef.current) {
      imageRef.current.src = getAnimatedSpriteUrl(pokemon);
    }
  }, [pokemon]);

  // Format the caught date for display
  const formattedCaughtDate = pokemon.caughtDate 
    ? format(new Date(pokemon.caughtDate), 'MMMM d, yyyy')
    : 'Unknown';

  return (
    <Fade in={fadeIn} timeout={500}>
      <Box sx={{ 
        bgcolor: showdownTheme.background,
        minHeight: 'auto',
        p: 1,
        fontFamily: showdownTheme.fontFamily
      }}>
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
                    ref={imageRef}
                    alt={pokemon.name}
                    sx={{
                      height: 120,
                      width: 120,
                      objectFit: 'contain',
                      imageRendering: 'pixelated',
                      bgcolor: 'transparent'
                    }}
                    onLoad={() => setImageLoaded(true)}
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
                  height: '100%'
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
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card sx={{ 
                  bgcolor: showdownTheme.cardBackground,
                  border: `1px solid ${showdownTheme.border}`,
                  boxShadow: 'none',
                  height: '100%'
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
                      {pokemon.moves?.map((move, index) => {
                        const moveData = moveService.getMoveByName(move);
                        return (
                          <Grid item xs={12} key={index}>
                            {move ? (
                              <MoveDetails
                                move={{
                                  name: move,
                                  type: moveData?.type || 'Normal'
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
                        );
                      })}
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
                  height: '100%'
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
                                    const effectiveStat = baseStat + (ev / 4);
                                    return (effectiveStat / 255) * 100;
                                  })()}
                                  sx={{ 
                                    height: 6,
                                    borderRadius: 3,
                                    bgcolor: '#E0E0E0',
                                    '& .MuiLinearProgress-bar': {
                                      bgcolor: (() => {
                                        const effectiveStat = baseStat + (ev / 4);
                                        
                                        if (statName === 'hp') {
                                          if (effectiveStat >= 100) return '#00C853';
                                          if (effectiveStat >= 85) return '#64DD17';
                                          if (effectiveStat >= 70) return '#FFD600';
                                          if (effectiveStat >= 55) return '#FFA000';
                                          if (effectiveStat >= 40) return '#FF6D00';
                                          return '#F44336';
                                        } else if (statName === 'attack' || statName === 'defense') {
                                          if (effectiveStat >= 90) return '#00C853';
                                          if (effectiveStat >= 75) return '#64DD17';
                                          if (effectiveStat >= 60) return '#FFD600';
                                          if (effectiveStat >= 45) return '#FFA000';
                                          if (effectiveStat >= 30) return '#FF6D00';
                                          return '#F44336';
                                        } else if (statName === 'special-attack' || statName === 'special-defense') {
                                          if (effectiveStat >= 90) return '#00C853';
                                          if (effectiveStat >= 75) return '#64DD17';
                                          if (effectiveStat >= 60) return '#FFD600';
                                          if (effectiveStat >= 45) return '#FFA000';
                                          if (effectiveStat >= 30) return '#FF6D00';
                                          return '#F44336';
                                        } else if (statName === 'speed') {
                                          if (effectiveStat >= 85) return '#00C853';
                                          if (effectiveStat >= 70) return '#64DD17';
                                          if (effectiveStat >= 55) return '#FFD600';
                                          if (effectiveStat >= 40) return '#FFA000';
                                          if (effectiveStat >= 25) return '#FF6D00';
                                          return '#F44336';
                                        }
                                        return '#F44336';
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
                  height: '100%'
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
      </Box>
    </Fade>
  );
});

const PokemonSlideshow: React.FC<PokemonSlideshowProps> = ({
  interval = 15000,
  fullscreen = false,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const myCollection = useSelector((state: RootState) => state.pokemon.myCollection);
  
  // State for the slideshow
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [displayedPokemon, setDisplayedPokemon] = useState<MyPokemon | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [fadeIn, setFadeIn] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const nextImageRef = useRef<HTMLImageElement>(null);
  
  // Function to shuffle the collection indices
  const shuffleCollection = useCallback(() => {
    if (!myCollection.length) return [];
    
    // Create an array of indices and shuffle it
    const indices = Array.from({ length: myCollection.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]]; // Swap elements
    }
    
    return indices;
  }, [myCollection.length]);

  // Go to the next Pokémon
  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex === null) return 0;
      
      // If we've reached the end, reshuffle and start over
      if (prevIndex >= shuffledIndices.length - 1) {
        setShuffledIndices(shuffleCollection());
        return 0;
      }
      
      return prevIndex + 1;
    });
    setProgress(0);
  }, [shuffleCollection, shuffledIndices.length]);
  
  // Go to the previous Pokémon
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex === null) return 0;
      if (prevIndex <= 0) return shuffledIndices.length - 1;
      return prevIndex - 1;
    });
    setProgress(0);
  }, [shuffledIndices.length]);
  
  // Reshuffle the collection
  const handleReshuffle = useCallback(() => {
    setShuffledIndices(shuffleCollection());
    setCurrentIndex(0);
    setProgress(0);
  }, [shuffleCollection]);
  
  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);
  
  // Navigate to the Pokémon's detail page
  const handlePokemonClick = useCallback(() => {
    if (displayedPokemon) {
      navigate(`/pokemon/${displayedPokemon.collectionId}`);
    }
  }, [displayedPokemon, navigate]);
  
  // Enter fullscreen mode
  const enterFullscreen = useCallback(() => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    }
  }, []);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStart && touchEnd) {
      const diff = touchStart - touchEnd;
      if (Math.abs(diff) > 50) { // Minimum swipe distance
        if (diff > 0) {
          goToNext();
        } else {
          goToPrevious();
        }
      }
      setTouchStart(null);
      setTouchEnd(null);
    }
  }, [touchStart, touchEnd, goToNext, goToPrevious]);

  // Initialize or reset the shuffled indices
  useEffect(() => {
    if (myCollection.length && shuffledIndices.length === 0) {
      const newIndices = shuffleCollection();
      setShuffledIndices(newIndices);
      setCurrentIndex(0); // Start with the first shuffled index
    }
  }, [myCollection, shuffleCollection, shuffledIndices.length]);
  
  // Update the displayed Pokémon when the current index changes
  useEffect(() => {
    if (currentIndex !== null && shuffledIndices.length > 0) {
      const pokemonIndex = shuffledIndices[currentIndex];
      setDisplayedPokemon(myCollection[pokemonIndex]);
      setFadeIn(true);
    }
  }, [currentIndex, shuffledIndices, myCollection]);
  
  // Handle the progress bar and automatic advancement
  useEffect(() => {
    if (!isPlaying || currentIndex === null) return;
    
    let startTime = Date.now();
    let animationFrameId: number;
    let timeoutId: NodeJS.Timeout;
    
    // Update progress bar
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / interval) * 100;
      
      if (newProgress <= 100) {
        setProgress(newProgress);
        animationFrameId = requestAnimationFrame(updateProgress);
      }
    };
    
    // Start progress animation
    animationFrameId = requestAnimationFrame(updateProgress);
    
    // Set timeout for next slide
    timeoutId = setTimeout(() => {
      setFadeIn(false);
      
      // Short delay before changing to allow fade out animation
      setTimeout(() => {
        goToNext();
      }, 500);
    }, interval);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutId);
    };
  }, [isPlaying, currentIndex, interval, goToNext]);
  
  // Preload next image
  useEffect(() => {
    if (currentIndex !== null && shuffledIndices.length > 0) {
      const nextIndex = (currentIndex + 1) % shuffledIndices.length;
      const nextPokemon = myCollection[shuffledIndices[nextIndex]];
      if (nextPokemon && nextImageRef.current) {
        nextImageRef.current.src = getAnimatedSpriteUrl(nextPokemon);
      }
    }
  }, [currentIndex, shuffledIndices, myCollection]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case ' ':
          togglePlayPause();
          break;
        case 'f':
          enterFullscreen();
          break;
        case 's':
          handleReshuffle();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [goToNext, goToPrevious, togglePlayPause, enterFullscreen, handleReshuffle]);
  
  // If there's no collection or it's empty, show a message
  if (!myCollection || myCollection.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">No Pokémon in your collection yet</Typography>
        <Typography variant="body2" color="text.secondary">
          Add some Pokémon to start the slideshow!
        </Typography>
      </Paper>
    );
  }
  
  // If no Pokémon is selected yet, show loading
  if (!displayedPokemon) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Loading slideshow...</Typography>
        <LinearProgress sx={{ mt: 2 }} />
      </Paper>
    );
  }

  // Format the form name if applicable
  const formName = isVariantForm(displayedPokemon.id ?? 0) 
    ? capitalizeFirstLetter(getFormName(displayedPokemon.name) || 'Form')
    : null;
  
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRadius: 0,
        overflow: 'hidden',
        boxShadow: 0,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Hidden image for preloading */}
      <img
        ref={nextImageRef}
        style={{ display: 'none' }}
        alt="preload"
      />
      
      {/* Progress bar at the top */}
      <SlideshowProgress progress={progress} />
      
      {/* Main content */}
      {displayedPokemon && (
        <PokemonCard
          pokemon={displayedPokemon}
          formName={formName}
          onPokemonClick={handlePokemonClick}
          fadeIn={fadeIn}
        />
      )}
      
      {/* Controls */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 0.5,
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          backdropFilter: 'blur(4px)',
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          borderTop: `1px solid ${showdownTheme.border}`,
        }}
      >
        <Box>
          <IconButton 
            onClick={goToPrevious} 
            color="primary"
            size="small"
            sx={{ mr: 0.5 }}
          >
            <NavigateBeforeIcon />
          </IconButton>
          <IconButton 
            onClick={togglePlayPause} 
            color="primary"
            size="small"
            sx={{ 
              bgcolor: isPlaying ? 'primary.main' : 'transparent',
              color: isPlaying ? 'white' : 'primary.main',
              '&:hover': { bgcolor: isPlaying ? 'primary.dark' : 'primary.light', color: 'white' }
            }}
          >
            {isPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
          </IconButton>
          <IconButton 
            onClick={goToNext} 
            color="primary"
            size="small"
            sx={{ ml: 0.5 }}
          >
            <NavigateNextIcon />
          </IconButton>
        </Box>
        
        <Box>
          <IconButton 
            onClick={handleReshuffle} 
            color="primary" 
            title="Shuffle"
            size="small"
          >
            <ShuffleIcon fontSize="small" />
          </IconButton>
          <IconButton 
            onClick={enterFullscreen} 
            color="primary" 
            title="Fullscreen"
            size="small"
          >
            <FullscreenIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default PokemonSlideshow;