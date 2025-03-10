import React, { useState, useEffect } from 'react';
import {
  Box,
  Slider,
  TextField,
  Typography,
  Grid,
  Paper,
} from '@mui/material';
import { capitalizeFirstLetter } from '../services/pokeApi';

interface EVSliderProps {
  stat: string;
  value: number;
  onChange: (stat: string, value: number) => void;
  color?: string;
  totalEVs: number;
  maxTotal?: number;
}

const EVSlider: React.FC<EVSliderProps> = ({ 
  stat, 
  value, 
  onChange,
  color = '#1976d2', // Default primary blue color
  totalEVs,
  maxTotal = 510
}) => {
  const [localValue, setLocalValue] = useState<number>(value);
  
  // Calculate remaining EVs (excluding current stat)
  const otherEVs = totalEVs - value;
  const remainingEVs = maxTotal - otherEVs;
  
  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    const numValue = newValue as number;
    
    // Check if the new value would exceed the total EV limit
    const potentialTotal = otherEVs + numValue;
    
    if (potentialTotal <= maxTotal) {
      // If we're within limits, use the slider value directly
      setLocalValue(numValue);
      onChange(stat, numValue);
    } else {
      // If we would exceed the limit, cap at the remaining EVs
      const cappedValue = remainingEVs;
      setLocalValue(cappedValue);
      onChange(stat, cappedValue);
    }
  };
  
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value);
    if (isNaN(newValue)) {
      setLocalValue(0);
      onChange(stat, 0);
    } else {
      // First cap at 0-252 range
      const inRangeValue = Math.min(252, Math.max(0, newValue));
      
      // Then check if it would exceed total EV limit
      const potentialTotal = otherEVs + inRangeValue;
      
      if (potentialTotal <= maxTotal) {
        // If we're within limits, use the value
        setLocalValue(inRangeValue);
        onChange(stat, inRangeValue);
      } else {
        // If we would exceed the limit, cap at the remaining EVs
        const cappedValue = remainingEVs;
        setLocalValue(cappedValue);
        onChange(stat, cappedValue);
      }
    }
  };
  
  // Format the stat name for display
  const formatStatName = (statName: string): string => {
    switch (statName.toLowerCase()) {
      case 'hp': return 'HP';
      case 'special-attack': return 'Sp. Atk';
      case 'special-defense': return 'Sp. Def';
      default: return capitalizeFirstLetter(statName);
    }
  };
  
  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 1.5, 
        borderLeft: `4px solid ${color}`, // Use the single color for all stats
        mb: 1,
      }}
    >
      <Grid container alignItems="center" spacing={2}>
        <Grid item xs={3} sm={2}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 'medium',
              color: 'text.secondary',
            }}
          >
            {formatStatName(stat)}
          </Typography>
        </Grid>
        <Grid item xs={6} sm={8}>
          <Slider
            value={localValue}
            onChange={handleSliderChange}
            min={0}
            max={252}
            step={4}
            valueLabelDisplay="auto"
            disabled={remainingEVs <= 0 && value === 0}
            sx={{
              '& .MuiSlider-thumb': {
                backgroundColor: color, // Use the single color
              },
              '& .MuiSlider-track': {
                backgroundColor: color, // Use the single color
              },
              '& .MuiSlider-rail': {
                backgroundColor: `${color}40`, // Transparent version of the color
              },
            }}
          />
        </Grid>
        <Grid item xs={3} sm={2}>
          <TextField
            value={localValue}
            onChange={handleInputChange}
            type="number"
            size="small"
            inputProps={{
              min: 0,
              max: 252,
              step: 4,
              style: { textAlign: 'center' }
            }}
            sx={{ width: '100%' }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default EVSlider;