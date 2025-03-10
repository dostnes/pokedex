import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  LinearProgress,
  Card,
  CardContent,
  Divider,
  Chip,
  useTheme,
  alpha,
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { RootState } from '../store/store';
import { MyPokemon } from '../types/pokemon';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { normalizePokedexNumber } from '../utils/pokemonUtils';

// Define generation ranges
const generations = [
  { id: 1, name: 'Kanto', region: 'Kanto', range: [1, 151] },
  { id: 2, name: 'Johto', region: 'Johto', range: [152, 251] },
  { id: 3, name: 'Hoenn', region: 'Hoenn', range: [252, 386] },
  { id: 4, name: 'Sinnoh', region: 'Sinnoh', range: [387, 493] },
  { id: 5, name: 'Unova', region: 'Unova', range: [494, 649] },
  { id: 6, name: 'Kalos', region: 'Kalos', range: [650, 721] },
  { id: 7, name: 'Alola', region: 'Alola', range: [722, 809] },
  { id: 8, name: 'Galar', region: 'Galar', range: [810, 898] },
  { id: 9, name: 'Paldea', region: 'Paldea', range: [899, 1008] },
];

// Custom tooltip for the pie chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 1.5,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="body2" color="text.primary">
          <strong>{payload[0].name}:</strong> {payload[0].value}
        </Typography>
      </Paper>
    );
  }
  return null;
};

const PokedexTracker = () => {
  const theme = useTheme();
  const myCollection = useSelector((state: RootState) => state.pokemon.myCollection);
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalPokemon: number;
    totalCaught: number;
    totalShiny: number;
    generationStats: {
      id: number;
      name: string;
      region: string;
      total: number;
      caught: number;
      shiny: number;
      caughtPercentage: number;
      shinyPercentage: number;
    }[];
  }>({
    totalPokemon: 0,
    totalCaught: 0,
    totalShiny: 0,
    generationStats: [],
  });

  // Calculate stats when collection changes
  useEffect(() => {
    if (!myCollection) return;

    setIsLoading(true);
    
    // Calculate total Pokémon in the Pokédex (using the highest generation range)
    const lastGen = generations[generations.length - 1];
    const totalPokemon = lastGen.range[1];
    
    // Get unique Pokémon IDs in collection (accounting for multiple of same species)
    // Normalize IDs to handle variant forms
    const normalizedIds = myCollection.map((p: MyPokemon) => normalizePokedexNumber(p.id));
    const uniquePokemonIds = new Set(normalizedIds);
    const totalCaught = uniquePokemonIds.size;
    
    // Count unique shiny Pokémon (also normalizing IDs)
    const shinyPokemon = myCollection.filter((p: MyPokemon) => p.shiny);
    const normalizedShinyIds = shinyPokemon.map((p: MyPokemon) => normalizePokedexNumber(p.id));
    const uniqueShinyIds = new Set(normalizedShinyIds);
    const totalShiny = uniqueShinyIds.size;
    
    // Calculate stats for each generation
    const generationStats = generations.map(gen => {
      const [min, max] = gen.range;
      const total = max - min + 1;
      
      // Count caught Pokémon in this generation
      const caughtInGen = Array.from(uniquePokemonIds).filter(id => id >= min && id <= max);
      const caught = caughtInGen.length;
      
      // Count shiny Pokémon in this generation
      const shinyInGen = Array.from(uniqueShinyIds).filter(id => id >= min && id <= max);
      const shiny = shinyInGen.length;
      
      return {
        id: gen.id,
        name: gen.name,
        region: gen.region,
        total,
        caught,
        shiny,
        caughtPercentage: (caught / total) * 100,
        shinyPercentage: (shiny / total) * 100,
      };
    });
    
    setStats({
      totalPokemon,
      totalCaught,
      totalShiny,
      generationStats,
    });
    
    setIsLoading(false);
  }, [myCollection]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Prepare data for the overall pie chart
  const overallPieData = [
    { name: 'Caught (Non-Shiny)', value: stats.totalCaught - stats.totalShiny, color: theme.palette.primary.main },
    { name: 'Shiny', value: stats.totalShiny, color: theme.palette.warning.main },
    { name: 'Not Caught', value: stats.totalPokemon - stats.totalCaught, color: theme.palette.grey[300] },
  ];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Pokédex Completion Tracker
      </Typography>
      
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Overall Progress" />
        <Tab label="Shiny Collection" />
        <Tab label="Regional Pokédex" />
      </Tabs>
      
      {/* Overall Progress Tab */}
      {tabValue === 0 && (
        <Box>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Collection Overview
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                  <Box sx={{ textAlign: 'center', flex: 1 }}>
                    <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                      {stats.totalCaught}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pokémon Caught
                    </Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem />
                  <Box sx={{ textAlign: 'center', flex: 1 }}>
                    <Typography variant="h3" color="warning.main" sx={{ fontWeight: 'bold' }}>
                      {stats.totalShiny}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Shiny Pokémon
                    </Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem />
                  <Box sx={{ textAlign: 'center', flex: 1 }}>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      {((stats.totalCaught / stats.totalPokemon) * 100).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pokédex Completion
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="subtitle1" gutterBottom>
                  Overall Pokédex Progress
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ flex: 1, mr: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(stats.totalCaught / stats.totalPokemon) * 100} 
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {stats.totalCaught} / {stats.totalPokemon}
                  </Typography>
                </Box>
                
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                  Shiny Collection Progress
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ flex: 1, mr: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(stats.totalShiny / stats.totalPokemon) * 100} 
                      sx={{ 
                        height: 10, 
                        borderRadius: 5,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: theme.palette.warning.main,
                        }
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {stats.totalShiny} / {stats.totalPokemon}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom>
                  Collection Breakdown
                </Typography>
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={overallPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                      >
                        {overallPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                  {overallPieData.map((entry, index) => (
                    <Chip
                      key={`legend-${index}`}
                      label={`${entry.name}: ${entry.value}`}
                      sx={{
                        backgroundColor: alpha(entry.color, 0.2),
                        color: entry.color === theme.palette.grey[300] ? 'text.primary' : entry.color,
                        fontWeight: 'medium',
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
      
      {/* Shiny Collection Tab */}
      {tabValue === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Shiny Collection Progress by Generation
          </Typography>
          
          <Grid container spacing={3}>
            {stats.generationStats.map((gen) => (
              <Grid item xs={12} sm={6} md={4} key={gen.id}>
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" component="div">
                        {gen.name}
                      </Typography>
                      <Chip 
                        icon={<AutoAwesomeIcon />} 
                        label={`${gen.shiny}/${gen.total}`}
                        size="small"
                        sx={{ 
                          bgcolor: alpha(theme.palette.warning.main, 0.1),
                          color: theme.palette.warning.main,
                          fontWeight: 'bold',
                        }}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Shiny Progress
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ flex: 1, mr: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={gen.shinyPercentage} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: theme.palette.warning.main,
                            }
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {gen.shinyPercentage.toFixed(1)}%
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Overall Caught
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ flex: 1, mr: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={gen.caughtPercentage} 
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {gen.caughtPercentage.toFixed(1)}%
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      
      {/* Regional Pokédex Tab */}
      {tabValue === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Regional Pokédex Completion
          </Typography>
          
          <Grid container spacing={3}>
            {stats.generationStats.map((gen) => (
              <Grid item xs={12} key={gen.id}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 2,
                    borderLeft: 6, 
                    borderColor: gen.caughtPercentage === 100 ? 'success.main' : 'primary.main',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6">
                      {gen.region} Region
                      {gen.caughtPercentage === 100 && (
                        <CheckCircleIcon 
                          color="success" 
                          fontSize="small" 
                          sx={{ ml: 1, verticalAlign: 'middle' }} 
                        />
                      )}
                    </Typography>
                    <Box>
                      <Chip 
                        label={`${gen.caught}/${gen.total} Caught`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mr: 1, fontWeight: 'medium' }}
                      />
                      <Chip 
                        icon={<AutoAwesomeIcon fontSize="small" />}
                        label={`${gen.shiny} Shiny`}
                        size="small"
                        sx={{ 
                          bgcolor: alpha(theme.palette.warning.main, 0.1),
                          color: theme.palette.warning.main,
                          fontWeight: 'medium',
                        }}
                      />
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ flex: 1, mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={gen.caughtPercentage} 
                        sx={{ 
                          height: 10, 
                          borderRadius: 5,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: gen.caughtPercentage === 100 
                              ? theme.palette.success.main 
                              : theme.palette.primary.main,
                          }
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 45 }}>
                      {gen.caughtPercentage.toFixed(1)}%
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default PokedexTracker;