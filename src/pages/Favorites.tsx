import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { RootState, AppDispatch } from '../store/store';
import { toggleFavorite } from '../store/pokemonSlice';
import { capitalizeFirstLetter } from '../services/pokeApi';
import TypeBadge from '../components/TypeBadge';
import { formatPokedexNumber, isVariantForm, getFormName, getAnimatedSpriteUrl } from '../utils/pokemonUtils';
import { showdownTheme } from '../theme/showdownTheme';

const Favorites = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const myCollection = useSelector((state: RootState) => state.pokemon.myCollection);

  // Memoize favorite Pokemon
  const favoritePokemon = useMemo(() => {
    return myCollection.filter(pokemon => pokemon.favorite);
  }, [myCollection]);

  const handlePokemonClick = (collectionId: string) => {
    navigate(`/pokemon/${collectionId}`);
  };

  const handleToggleFavorite = (e: React.MouseEvent, collectionId: string) => {
    e.stopPropagation();
    dispatch(toggleFavorite(collectionId));
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
        Favorite Pokémon
      </Typography>

      {favoritePokemon.length === 0 ? (
        <Typography 
          variant="h6" 
          align="center" 
          sx={{ 
            color: showdownTheme.text,
            fontFamily: showdownTheme.fontFamily,
          }}
        >
          No favorite Pokémon yet. Click the star icon on any Pokémon's details page to add it to your favorites!
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {favoritePokemon.map((pokemon) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={pokemon.collectionId}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  bgcolor: showdownTheme.cardBackground,
                  border: `1px solid ${showdownTheme.border}`,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 8px ${showdownTheme.accent}20`,
                    borderColor: showdownTheme.accent,
                  },
                }}
              >
                <Box sx={{ 
                  position: 'relative',
                  width: '100%',
                  paddingTop: '100%', // This creates a 1:1 aspect ratio
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: showdownTheme.cardBackground,
                }}>
                  <img
                    src={getAnimatedSpriteUrl(pokemon)}
                    alt={pokemon.name}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '80%',
                      height: '80%',
                      objectFit: 'contain',
                      imageRendering: 'pixelated',
                    }}
                  />
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(toggleFavorite(pokemon.collectionId));
                    }}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      color: pokemon.favorite ? '#FFD700' : showdownTheme.text,
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      '&:hover': {
                        color: '#FFD700',
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                      },
                    }}
                  >
                    {pokemon.favorite ? <StarIcon /> : <StarBorderIcon />}
                  </IconButton>
                </Box>

                <CardContent sx={{ p: 1.5 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: showdownTheme.text,
                      fontFamily: showdownTheme.fontFamily,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      mb: 0.5,
                    }}
                  >
                    {pokemon.nickname || capitalizeFirstLetter(pokemon.name)}
                  </Typography>

                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: showdownTheme.text,
                      fontFamily: showdownTheme.fontFamily,
                      display: 'block',
                      textAlign: 'center',
                      mb: 0.5,
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

                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {pokemon.types.map((type) => (
                      <TypeBadge key={type.type.name} type={type.type.name} size="small" />
                    ))}
                  </Box>

                  {pokemon.project && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: showdownTheme.secondaryText,
                        fontFamily: showdownTheme.fontFamily,
                        display: 'block',
                        textAlign: 'center',
                        mt: 0.5,
                      }}
                    >
                      {pokemon.project}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Favorites; 