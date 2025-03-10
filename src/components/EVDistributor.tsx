import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Paper,
} from '@mui/material';
import EVSlider from './EVSlider';

// Define a specific type for EVs object
interface EVStats {
  hp: number;
  attack: number;
  defense: number;
  'special-attack': number;
  'special-defense': number;
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
  // Calculate total EVs
  const totalEVs = Object.values(evs).reduce((sum, value) => sum + value, 0);
  const remainingEVs = maxTotal - totalEVs;
  
  // Calculate progress percentage
  const progressPercentage = (totalEVs / maxTotal) * 100;
  
  // Handle individual stat change
  const handleStatChange = (stat: string, value: number) => {
    const newEVs = { ...evs, [stat]: value } as EVStats;
    onChange(newEVs);
  };
  
  // Determine progress color
  const getProgressColor = () => {
    if (progressPercentage < 70) return 'success';
    if (progressPercentage < 90) return 'warning';
    return 'error';
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
      
      {Object.entries(evs).map(([stat, value]) => (
        <EVSlider
          key={`ev-${stat}`}
          stat={stat}
          value={value}
          onChange={handleStatChange}
          totalEVs={totalEVs}
          maxTotal={maxTotal}
        />
      ))}
    </Box>
  );
};

export default EVDistributor;