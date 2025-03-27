import React, { useState } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  Chip,
  CircularProgress,
} from '@mui/material';
import { showdownTheme } from '../theme/showdownTheme';
import { moveService, Move } from '../services/moveService';

interface MoveSelectorProps {
  value: Move | null;
  onChange: (move: Move | null) => void;
  label: string;
}

const MoveSelector: React.FC<MoveSelectorProps> = ({ value, onChange, label }) => {
  const [moves, setMoves] = useState<Move[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatMoveName = (name: string) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      Normal: '#A8A878',
      Fire: '#F08030',
      Water: '#6890F0',
      Electric: '#F8D030',
      Grass: '#78C850',
      Ice: '#98D8D8',
      Fighting: '#C03028',
      Poison: '#A040A0',
      Ground: '#E0C068',
      Flying: '#A890F0',
      Psychic: '#F85888',
      Bug: '#A8B820',
      Rock: '#B8A038',
      Ghost: '#705898',
      Dragon: '#7038F8',
      Dark: '#705848',
      Steel: '#B8B8D0',
      Fairy: '#EE99AC',
    };
    return typeColors[type] || '#777777';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Physical':
        return '#C92112';
      case 'Special':
        return '#4F5879';
      case 'Status':
        return '#8C888C';
      default:
        return '#777777';
    }
  };

  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    if (query.length < 2) {
      setMoves([]);
      return;
    }

    try {
      setLoading(true);
      const searchResults = moveService.searchMoves(query);
      setMoves(searchResults);
    } catch (err) {
      setError('Failed to load moves');
      console.error('Error loading moves:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Autocomplete
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      options={moves}
      getOptionLabel={(option) => formatMoveName(option.name)}
      loading={loading}
      onInputChange={(_, value) => {
        if (value.length >= 2) {
          handleInputChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          fullWidth
          error={!!error}
          helperText={error}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontFamily: showdownTheme.fontFamily,
            },
            '& .MuiInputLabel-root': {
              fontFamily: showdownTheme.fontFamily,
            },
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <Typography
              sx={{
                fontFamily: showdownTheme.fontFamily,
                fontWeight: 'bold',
                flexGrow: 1,
              }}
            >
              {formatMoveName(option.name)}
            </Typography>
            <Chip
              label={option.type}
              size="small"
              sx={{
                bgcolor: getTypeColor(option.type),
                color: 'white',
                fontFamily: showdownTheme.fontFamily,
                '& .MuiChip-label': {
                  px: 1,
                },
              }}
            />
            <Chip
              label={option.category}
              size="small"
              sx={{
                bgcolor: getCategoryColor(option.category),
                color: 'white',
                fontFamily: showdownTheme.fontFamily,
                '& .MuiChip-label': {
                  px: 1,
                },
              }}
            />
          </Box>
        </Box>
      )}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={option.name}
            label={formatMoveName(option.name)}
            sx={{
              fontFamily: showdownTheme.fontFamily,
            }}
          />
        ))
      }
      isOptionEqualToValue={(option, value) => option.name === value?.name}
      renderGroup={(params) => (
        <li key={params.key}>
          <Box sx={{ p: 1 }}>
            <Typography
              sx={{
                fontFamily: showdownTheme.fontFamily,
                color: showdownTheme.secondaryText,
                fontSize: '0.8rem',
              }}
            >
              {params.group}
            </Typography>
          </Box>
          <Box component="ul" sx={{ p: 0 }}>
            {params.children}
          </Box>
        </li>
      )}
      groupBy={(option) => option.type}
    />
  );
};

export default MoveSelector; 