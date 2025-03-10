import React, { useState } from 'react';
import { Container, Box, Paper, Typography, Switch, FormControlLabel } from '@mui/material';
import PokemonSlideshow from '../components/PokemonSlideshow';

const SlideshowPage = () => {
  const [fullscreen, setFullscreen] = useState(false);
  const [interval, setInterval] = useState(15000); // 15 seconds default
  
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Pokémon Collection Slideshow
        </Typography>
        
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="body1" paragraph>
            This slideshow randomly cycles through your Pokémon collection. Click on any Pokémon to view its details.
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={fullscreen}
                  onChange={(e) => setFullscreen(e.target.checked)}
                />
              }
              label="Fullscreen Mode"
            />
            
            <FormControlLabel
              control={
                <select
                  value={interval}
                  onChange={(e) => setInterval(Number(e.target.value))}
                  style={{ padding: '8px', borderRadius: '4px' }}
                >
                  <option value={5000}>5 seconds</option>
                  <option value={10000}>10 seconds</option>
                  <option value={15000}>15 seconds</option>
                  <option value={30000}>30 seconds</option>
                  <option value={60000}>1 minute</option>
                </select>
              }
              label="Slide Duration:"
              labelPlacement="start"
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            Tip: Press the fullscreen button in the slideshow controls for a better viewing experience.
          </Typography>
        </Paper>
        
        <PokemonSlideshow interval={interval} fullscreen={fullscreen} />
      </Box>
    </Container>
  );
};

export default SlideshowPage;