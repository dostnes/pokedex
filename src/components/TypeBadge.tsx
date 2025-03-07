import { Chip, Box } from '@mui/material';
import { capitalizeFirstLetter } from '../services/pokeApi';

// Type colors mapping
const typeColors: { [key: string]: { main: string, text: string } } = {
  normal: { main: '#A8A878', text: '#FFFFFF' },
  fire: { main: '#F08030', text: '#FFFFFF' },
  water: { main: '#6890F0', text: '#FFFFFF' },
  electric: { main: '#F8D030', text: '#000000' },
  grass: { main: '#78C850', text: '#FFFFFF' },
  ice: { main: '#98D8D8', text: '#000000' },
  fighting: { main: '#C03028', text: '#FFFFFF' },
  poison: { main: '#A040A0', text: '#FFFFFF' },
  ground: { main: '#E0C068', text: '#000000' },
  flying: { main: '#A890F0', text: '#FFFFFF' },
  psychic: { main: '#F85888', text: '#FFFFFF' },
  bug: { main: '#A8B820', text: '#FFFFFF' },
  rock: { main: '#B8A038', text: '#FFFFFF' },
  ghost: { main: '#705898', text: '#FFFFFF' },
  dragon: { main: '#7038F8', text: '#FFFFFF' },
  dark: { main: '#705848', text: '#FFFFFF' },
  steel: { main: '#B8B8D0', text: '#000000' },
  fairy: { main: '#EE99AC', text: '#000000' },
};

interface TypeBadgeProps {
  type: string;
  size?: 'small' | 'medium';
}

const TypeBadge = ({ type, size = 'medium' }: TypeBadgeProps) => {
  const typeColor = typeColors[type.toLowerCase()] || { main: '#777777', text: '#FFFFFF' };
  const iconUrl = `/types/${type.toLowerCase()}.svg`;
  
  console.log('TypeBadge Debug:', {
    type,
    iconUrl,
    color: typeColor
  });

  return (
    <Chip
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <img 
            src={iconUrl} 
            alt={type}
            style={{ 
              width: size === 'small' ? '16px' : '20px',
              height: size === 'small' ? '16px' : '20px',
              filter: 'brightness(0) invert(1)' // This makes the SVG white
            }}
          />
          {capitalizeFirstLetter(type)}
        </Box>
      }
      sx={{
        bgcolor: typeColor.main,
        color: typeColor.text,
        fontWeight: 500,
        '& .MuiChip-label': {
          px: size === 'small' ? 1 : 1.5,
        },
      }}
      size={size}
    />
  );
};

export default TypeBadge;