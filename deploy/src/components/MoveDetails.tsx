import React from 'react';
import {
  Box,
  Typography,
  Chip,
} from '@mui/material';
import { showdownTheme } from '../theme/showdownTheme';
import TypeBadge from './TypeBadge';

interface Move {
  name: string;
  type: string;
}

interface MoveDetailsProps {
  move: Move;
}

const MoveDetails: React.FC<MoveDetailsProps> = ({ move }) => {
  const formatMoveName = (name: string) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      width: '100%',
      pr: 1
    }}>
      <Typography
        sx={{
          fontFamily: showdownTheme.fontFamily,
          fontWeight: 'bold',
          fontSize: '0.9rem',
        }}
      >
        {formatMoveName(move.name)}
      </Typography>
      <TypeBadge type={move.type} />
    </Box>
  );
};

export default MoveDetails; 