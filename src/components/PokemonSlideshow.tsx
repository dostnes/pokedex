import React, { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import { RootState } from '../store/store';
import { MyPokemon } from '../types/pokemon';
import TypeBadge from './TypeBadge';
import { capitalizeFirstLetter } from '../services/pokeApi';
import { formatPokedexNumber, isVariantForm, getFormName, getBaseName } from '../utils/pokemonUtils';

interface PokemonSlideshowProps {
  interval?: number; // Time in milliseconds between slides
  fullscreen?: boolean; // Whether to show in fullscreen mode
}

const PokemonSlideshow: React.FC<PokemonSlideshowProps> = ({
  interval = 15000, // Default to 15 seconds
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
  }, [isPlaying, currentIndex, interval]);
  
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
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex === null) return 0;
      if (prevIndex <= 0) return shuffledIndices.length - 1;
      return prevIndex - 1;
    });
    setProgress(0);
  };
  
  // Reshuffle the collection
  const handleReshuffle = () => {
    setShuffledIndices(shuffleCollection());
    setCurrentIndex(0);
    setProgress(0);
  };
  
  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };
  
  // Navigate to the Pokémon's detail page
  const handlePokemonClick = () => {
    if (displayedPokemon) {
      navigate(`/pokemon/${displayedPokemon.collectionId}`);
    }
  };
  
  // Enter fullscreen mode
  const enterFullscreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    }
  };
  
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
  
  return (
    <Box
      sx={{
        width: '100%',
        height: fullscreen ? '100vh' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRadius: fullscreen ? 0 : 2,
        overflow: 'hidden',
        boxShadow: fullscreen ? 'none' : 3,
      }}
    >
      {/* Progress bar at the top */}
      <LinearProgress 
        variant="determinate" 
        value={progress} 
        sx={{ 
          height: 4,
          '& .MuiLinearProgress-bar': {
            transition: 'none', // Disable transition for smoother updates
          }
        }} 
      />
      
      {/* Main content */}
      <Fade in={fadeIn} timeout={500}>
        <Card 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            flexGrow: 1,
            border: 'none',
            boxShadow: 'none',
            borderRadius: 0,
            position: 'relative',
            cursor: 'pointer',
          }}
          onClick={handlePokemonClick}
        >
          {/* Pokémon image */}
          <CardMedia
            component="img"
            image={displayedPokemon.shiny 
              ? displayedPokemon.sprites.other.home.front_shiny 
              : displayedPokemon.sprites.other.home.front_default}
            alt={displayedPokemon.name}
            sx={{
              height: fullscreen ? '60vh' : 300,
              objectFit: 'contain',
              bgcolor: '#f5f5f5',
              p: 2,
            }}
          />
          
          {/* Pokédex number */}
          <Typography 
            variant="body2" 
            sx={{ 
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'rgba(0, 0, 0, 0.6)',
              fontFamily: 'cursive',
              fontSize: '1.1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 500,
              zIndex: 1,
            }}
          >
            {formatPokedexNumber(displayedPokemon.id)}
          </Typography>
          
          {/* Shiny badge */}
          {displayedPokemon.shiny && (
            <Chip
              label="✨ SHINY"
              size="small"
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                bgcolor: 'warning.main',
                color: 'warning.contrastText',
                fontWeight: 'bold',
                zIndex: 1,
              }}
            />
          )}
          
          {/* Variant form badge */}
          {isVariantForm(displayedPokemon.id) && (
            <Chip
              label={capitalizeFirstLetter(getFormName(displayedPokemon.name) || 'Form')}
              size="small"
              sx={{
                position: 'absolute',
                top: displayedPokemon.shiny ? 56 : 16,
                left: 16,
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                fontWeight: 'medium',
                zIndex: 1,
              }}
            />
          )}
          
          {/* Pokémon info */}
          <CardContent sx={{ flexGrow: 1, pb: 1 }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
              {displayedPokemon.nickname || capitalizeFirstLetter(displayedPokemon.name)}
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {displayedPokemon.types.map((type: { type: { name: string } }, index: number) => (
                <TypeBadge
                  key={`${displayedPokemon.collectionId}-type-${type.type.name}-${index}`}
                  type={type.type.name}
                />
              ))}
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 1 }}>
              <Typography variant="body1">
                <strong>Level:</strong> {displayedPokemon.level}
              </Typography>
              <Typography variant="body1">
                <strong>Nature:</strong> {displayedPokemon.nature}
              </Typography>
              <Typography variant="body1">
                <strong>Ability:</strong> {capitalizeFirstLetter(displayedPokemon.ability || '')}
              </Typography>
            </Box>
            
            {/* Additional details */}
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {displayedPokemon.location && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Location:</strong> {displayedPokemon.location}
                </Typography>
              )}
              {displayedPokemon.caughtDate && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Caught:</strong> {new Date(displayedPokemon.caughtDate).toLocaleDateString()}
                </Typography>
              )}
              {displayedPokemon.comments && (
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    mt: 1,
                    fontStyle: 'italic',
                    maxHeight: '3em',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  "{displayedPokemon.comments}"
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Fade>
      
      {/* Controls */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 1,
          bgcolor: theme.palette.grey[100],
          borderTop: `1px solid ${theme.palette.grey[300]}`,
        }}
      >
        <Box>
          <IconButton onClick={goToPrevious} color="primary">
            <NavigateBeforeIcon />
          </IconButton>
          <IconButton onClick={togglePlayPause} color="primary">
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <IconButton onClick={goToNext} color="primary">
            <NavigateNextIcon />
          </IconButton>
        </Box>
        
        <Box>
          <IconButton onClick={handleReshuffle} color="primary" title="Shuffle">
            <ShuffleIcon />
          </IconButton>
          <IconButton onClick={enterFullscreen} color="primary" title="Fullscreen">
            <FullscreenIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default PokemonSlideshow;