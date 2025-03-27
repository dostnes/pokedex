import React, { useState, useEffect, useMemo } from 'react';
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
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { RootState } from '../store/store';
import { MyPokemon } from '../types/pokemon';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { normalizePokedexNumber } from '../utils/pokemonUtils';
import { format, subMonths, eachMonthOfInterval, isWithinInterval } from 'date-fns';
import CatchingPokemonIcon from '@mui/icons-material/CatchingPokemon';

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

const NextMilestones = ({ stats }: { stats: {
  uniqueSpeciesCount: number;
  uniqueShinyCount: number;
  totalPokemon: number;
  generationStats: Array<{
    name: string;
    caught: number;
    shiny: number;
    total: number;
    caughtPercentage: number;
    shinyPercentage: number;
  }>;
} }) => {
  const theme = useTheme();
  
  // Calculate next overall completion milestone
  const nextOverallMilestone = Math.ceil(stats.uniqueSpeciesCount / 10) * 10;
  const remainingForOverall = nextOverallMilestone - stats.uniqueSpeciesCount;
  
  // Calculate next shiny completion milestone
  const nextShinyMilestone = Math.ceil(stats.uniqueShinyCount / 10) * 10;
  const remainingForShiny = nextShinyMilestone - stats.uniqueShinyCount;
  
  // Find next generation completion
  const nextGenCompletion = stats.generationStats
    .filter((gen) => gen.caughtPercentage < 100)
    .sort((a, b) => a.caughtPercentage - b.caughtPercentage)[0];
  
  // Find next generation shiny completion
  const nextGenShinyCompletion = stats.generationStats
    .filter((gen) => gen.shinyPercentage < 100)
    .sort((a, b) => a.shinyPercentage - b.shinyPercentage)[0];

  return (
    <Card sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Next Milestones
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {remainingForOverall > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CatchingPokemonIcon color="primary" />
            <Typography>
              {remainingForOverall} more unique Pokémon for {nextOverallMilestone}% completion
            </Typography>
          </Box>
        )}
        {remainingForShiny > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon color="warning" />
            <Typography>
              {remainingForShiny} more unique shiny Pokémon for {nextShinyMilestone}% completion
            </Typography>
          </Box>
        )}
        {nextGenCompletion && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CatchingPokemonIcon color="primary" />
            <Typography>
              {Math.ceil(nextGenCompletion.total - nextGenCompletion.caught)} more Pokémon to complete {nextGenCompletion.name} Pokédex
            </Typography>
          </Box>
        )}
        {nextGenShinyCompletion && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon color="warning" />
            <Typography>
              {Math.ceil(nextGenCompletion.total - nextGenShinyCompletion.shiny)} more unique shiny Pokémon to complete {nextGenShinyCompletion.name} Shiny Pokédex
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
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
    uniqueSpeciesCount: number;
    uniqueShinyCount: number;
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
    growthStats: {
      monthlyData: {
        date: string;
        total: number;
        new: number;
        shiny: number;
      }[];
      earliestDate: Date | null;
    };
  }>({
    totalPokemon: 0,
    totalCaught: 0,
    totalShiny: 0,
    uniqueSpeciesCount: 0,
    uniqueShinyCount: 0,
    generationStats: [],
    growthStats: {
      monthlyData: [],
      earliestDate: null,
    },
  });

  // Calculate stats when collection changes
  useEffect(() => {
    if (!myCollection) return;

    setIsLoading(true);
    
    // Calculate total Pokémon in the Pokédex (using the highest generation range)
    const lastGen = generations[generations.length - 1];
    const totalPokemon = lastGen.range[1];
    
    // Count all Pokémon entries (including duplicates)
    const totalCaught = myCollection.length;
    
    // Count all shiny Pokémon entries
    const totalShiny = myCollection.filter((p: MyPokemon) => p.shiny).length;

    // Count unique species for Pokédex completion
    const uniqueSpecies = new Set(myCollection.map(p => normalizePokedexNumber(p.id || 0)));
    const uniqueSpeciesCount = uniqueSpecies.size;

    // Count unique shiny species
    const uniqueShinySpecies = new Set(
      myCollection
        .filter(p => p.shiny)
        .map(p => normalizePokedexNumber(p.id || 0))
    );
    const uniqueShinyCount = uniqueShinySpecies.size;
    
    // Calculate generation stats
    const generationStats = generations.map(gen => {
      const [min, max] = gen.range;
      const total = max - min + 1;
      
      // Get all Pokémon in this generation
      const pokemonInGen = myCollection.filter(p => {
        const normalizedId = normalizePokedexNumber(p.id || 0);
        return normalizedId >= min && normalizedId <= max;
      });

      // Count unique species in this generation
      const uniqueSpeciesInGen = new Set(
        pokemonInGen.map(p => normalizePokedexNumber(p.id || 0))
      );
      const caught = uniqueSpeciesInGen.size;
      
      // Count unique shiny species in this generation
      const shinyInGen = pokemonInGen.filter(p => p.shiny);
      const uniqueShinyInGen = new Set(
        shinyInGen.map(p => normalizePokedexNumber(p.id || 0))
      );
      const shiny = uniqueShinyInGen.size;
      
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

    // Calculate growth stats
    const now = new Date();
    
    // Find the earliest caughtDate in the collection
    const earliestDate = myCollection.reduce((earliest, pokemon) => {
      if (!pokemon.caughtDate) return earliest;
      const caughtDate = new Date(pokemon.caughtDate);
      return earliest && caughtDate > earliest ? earliest : caughtDate;
    }, null as Date | null);

    // If no caughtDate found, default to 10 years ago
    const startDate = earliestDate || subMonths(now, 120);
    const monthlyDates = eachMonthOfInterval({ start: startDate, end: now });
    
    const monthlyData = monthlyDates.map(date => {
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      // Get all Pokémon caught in this month
      const pokemonInMonth = myCollection.filter(p => {
        const caughtDate = p.caughtDate ? new Date(p.caughtDate) : null;
        return caughtDate && isWithinInterval(caughtDate, { start: monthStart, end: monthEnd });
      });
      
      const newPokemon = pokemonInMonth.length;
      const newShiny = pokemonInMonth.filter(p => p.shiny).length;
      
      // Calculate total up to this month
      const totalUpToMonth = myCollection.filter(p => {
        const caughtDate = p.caughtDate ? new Date(p.caughtDate) : null;
        return caughtDate && caughtDate <= monthEnd;
      }).length;

      return {
        date: format(date, 'MMM yyyy'),
        total: totalUpToMonth,
        new: newPokemon,
        shiny: newShiny,
      };
    });
    
    setStats({
      totalPokemon,
      totalCaught,
      totalShiny,
      uniqueSpeciesCount,
      uniqueShinyCount,
      generationStats,
      growthStats: {
        monthlyData,
        earliestDate,
      },
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
        <Tab label="Growth Analysis" />
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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
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
                    <Typography variant="h3" color="warning.main" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      {stats.totalShiny}
                      <AutoAwesomeIcon sx={{ fontSize: '1.2em' }} />
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Shiny Pokémon
                    </Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem />
                  <Box sx={{ textAlign: 'center', flex: 1 }}>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      {((stats.uniqueSpeciesCount / stats.totalPokemon) * 100).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pokédex Completion
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="subtitle1" gutterBottom>
                  Overall Pokédex Progress
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ flex: 1, mr: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(stats.uniqueSpeciesCount / stats.totalPokemon) * 100} 
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {stats.uniqueSpeciesCount} / {stats.totalPokemon}
                  </Typography>
                </Box>
                
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                  Shiny Collection Progress
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ flex: 1, mr: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(stats.uniqueShinyCount / stats.totalPokemon) * 100} 
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
                    {stats.uniqueShinyCount} / {stats.totalPokemon}
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
                        data={[
                          { name: 'Caught (Non-Shiny)', value: stats.totalCaught - stats.totalShiny, color: theme.palette.primary.main },
                          { name: 'Shiny Species', value: stats.uniqueShinyCount, color: theme.palette.warning.main },
                          { name: 'Not Caught', value: stats.totalPokemon - stats.uniqueSpeciesCount, color: theme.palette.grey[300] },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                      >
                        {[
                          { name: 'Caught (Non-Shiny)', value: stats.totalCaught - stats.totalShiny, color: theme.palette.primary.main },
                          { name: 'Shiny Species', value: stats.uniqueShinyCount, color: theme.palette.warning.main },
                          { name: 'Not Caught', value: stats.totalPokemon - stats.uniqueSpeciesCount, color: theme.palette.grey[300] },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                  {[
                    { name: 'Caught (Non-Shiny)', value: stats.totalCaught - stats.totalShiny, color: theme.palette.primary.main },
                    { name: 'Shiny Species', value: stats.uniqueShinyCount, color: theme.palette.warning.main },
                    { name: 'Not Caught', value: stats.totalPokemon - stats.uniqueSpeciesCount, color: theme.palette.grey[300] },
                  ].map((entry, index) => (
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
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ mt: 4 }}>
                <NextMilestones stats={stats} />
              </Box>
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
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

      {/* Growth Analysis Tab */}
      {tabValue === 3 && (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Collection Growth Over Time
                  {stats.growthStats.earliestDate && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      From {format(stats.growthStats.earliestDate, 'MMMM yyyy')} to Present
                    </Typography>
                  )}
                </Typography>
                <Box sx={{ height: 400, mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.growthStats.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval="preserveStartEnd"
                      />
                      <YAxis />
                      <RechartsTooltip />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke={theme.palette.primary.main}
                        name="Total Collection"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="new"
                        stroke={theme.palette.secondary.main}
                        name="New Pokémon"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Collection Statistics
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Total Pokémon
                  </Typography>
                  <Typography variant="h4" color="primary" sx={{ mb: 3 }}>
                    {stats.totalCaught}
                  </Typography>

                  <Typography variant="subtitle1" gutterBottom>
                    Shiny Pokémon
                  </Typography>
                  <Typography variant="h4" color="warning.main" sx={{ mb: 3 }}>
                    {stats.totalShiny}
                  </Typography>

                  <Typography variant="subtitle1" gutterBottom>
                    Pokédex Completion
                  </Typography>
                  <Typography variant="h4" sx={{ mb: 3 }}>
                    {((stats.totalCaught / stats.totalPokemon) * 100).toFixed(1)}%
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default PokedexTracker;