import React, { useState } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Paper,
  Grid,
  Slider,
} from '@mui/material';
import EVSlider from './EVSlider';

// Define a specific type for EVs object
export interface EVStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
  [key: string]: number; // Allow additional properties if needed
}

interface EVDistributorProps {
  evs: EVStats;
  onChange: (newEVs: EVStats) => void;
  maxTotal?: number;
}

const EVDistributor: React.FC<EVDistributorProps> = ({
  evs,
  onChange,
  maxTotal = 510
}) => {
  const [totalEVs, setTotalEVs] = useState(
    Object.values(evs).reduce((sum, value) => sum + value, 0)
  );

  const remainingEVs = maxTotal - totalEVs;
  
  // Calculate progress percentage
  const progressPercentage = (totalEVs / maxTotal) * 100;
  
  const handleEVChange = (stat: keyof EVStats, value: number) => {
    const currentTotal = totalEVs - (evs[stat] || 0);
    const newValue = Math.min(252, Math.max(0, value));
    const newTotal = currentTotal + newValue;

    if (newTotal <= 510) {
      const newEVs = { ...evs, [stat]: newValue };
      setTotalEVs(newTotal);
      onChange(newEVs);
    }
  };
  
  // Determine progress color
  const getProgressColor = () => {
    if (progressPercentage < 70) return 'success';
    if (progressPercentage < 90) return 'warning';
    return 'error';
  };
  
  const formatStatName = (stat: string): string => {
    switch (stat) {
      case 'specialAttack': return 'Sp. Atk';
      case 'specialDefense': return 'Sp. Def';
      case 'hp': return 'HP';
      default: return stat.charAt(0).toUpperCase() + stat.slice(1);
    }
  };

  return (
    <Box>
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          mb: 2, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
          EV Points: {totalEVs} / {maxTotal} ({remainingEVs} remaining)
        </Typography>
        <Box sx={{ width: '100%', mb: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={progressPercentage} 
            color={getProgressColor()}
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>
        <Typography variant="caption" color="text.secondary">
          Maximum 252 EVs per stat, 510 EVs total
        </Typography>
      </Paper>
      
      <Grid container spacing={2}>
        {Object.entries(evs).map(([stat, value]) => (
          <Grid item xs={12} sm={6} key={stat}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ minWidth: 80 }}>
                {formatStatName(stat)}
              </Typography>
              <Slider
                value={value}
                min={0}
                max={252}
                step={4}
                onChange={(_, newValue) => handleEVChange(stat as keyof EVStats, newValue as number)}
                valueLabelDisplay="auto"
                sx={{ flexGrow: 1 }}
              />
              <Typography sx={{ minWidth: 30, textAlign: 'right' }}>
                {value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default EVDistributor;