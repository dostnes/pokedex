import { Box, Typography } from '@mui/material';

type StatBarProps = {
  statName: string;
  value: number;
  maxValue?: number;
}

export function StatBar({ statName, value, maxValue = 255 }: StatBarProps) {
  const getStatColor = (value: number) => {
    if (value >= 151) return '#78C850';
    if (value >= 121) return '#A7DB8D';
    if (value >= 91) return '#9DB7F5';
    if (value >= 61) return '#FAE078';
    if (value >= 31) return '#F5AC78';
    return '#FF5959';
  };

  const percentage = (value / maxValue) * 100;
  
  return (
    <Box sx={{ mb: 1, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" sx={{ textTransform: 'capitalize', minWidth: '120px' }}>
          {statName.replace('-', ' ')}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 2 }}>
          {value}
        </Typography>
      </Box>
      <Box
        sx={{
          width: '100%',
          height: '8px',
          bgcolor: 'rgba(0, 0, 0, 0.1)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: `${percentage}%`,
            height: '100%',
            bgcolor: getStatColor(value),
            transition: 'width 0.5s ease-out',
          }}
        />
      </Box>
    </Box>
  );
}

export default StatBar;