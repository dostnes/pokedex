import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs, { Dayjs } from 'dayjs';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  FormControlLabel,
  Switch,
  RadioGroup,
  Radio,
} from '@mui/material';
import { RootState, AppDispatch } from '../store/store';
import { fetchAllPokemon, addToCollection } from '../store/pokemonSlice';
import type { Pokemon, MyPokemon } from '../types/pokemon';
import { capitalizeFirstLetter } from '../services/pokeApi';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import PokeballSelect from '../components/PokeballSelect';

const ITEMS_PER_PAGE = 12;
const NATURES = [
  'Hardy', 'Lonely', 'Brave', 'Adamant', 'Naughty',
  'Bold', 'Docile', 'Relaxed', 'Impish', 'Lax',
  'Timid', 'Hasty', 'Serious', 'Jolly', 'Naive',
  'Modest', 'Mild', 'Quiet', 'Bashful', 'Rash',
  'Calm', 'Gentle', 'Sassy', 'Careful', 'Quirky'
];

const AddPokemon = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { allPokemon, loading, error, isInitialized } = useSelector((state: RootState) => state.pokemon);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [location, setLocation] = useState('');
  const [caughtFrom, setCaughtFrom] = useState<'Main Series' | 'Pokemon GO' | 'Other'>('Main Series');
  const [pokeball, setPokeball] = useState('Poke Ball');
  const [gender, setGender] = useState<'male' | 'female' | 'N/A'>('N/A');
  const [ability, setAbility] = useState({ name: '', isHidden: false });
  const [originalTrainer, setOriginalTrainer] = useState('');
  const [trainerId, setTrainerId] = useState('');
  const [caughtDate, setCaughtDate] = useState<Dayjs | null>(dayjs());
  const [comment, setComment] = useState('');
  const [formData, setFormData] = useState({
    nickname: '',
    level: 1,
    nature: 'Hardy',
    shiny: false,
    ivs: {
      hp: 0, attack: 0, defense: 0,
      'special-attack': 0, 'special-defense': 0, speed: 0
    },
    evs: {
      hp: 0, attack: 0, defense: 0,
      'special-attack': 0, 'special-defense': 0, speed: 0
    },
    moves: ['', '', '', '']
  });

  useEffect(() => {
    if (!isInitialized) {
      dispatch(fetchAllPokemon());
    }
  }, [dispatch, isInitialized]);

  const filteredPokemon = allPokemon.filter(pokemon =>
    pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedPokemon = filteredPokemon.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleAddPokemon = () => {
    if (selectedPokemon) {
      const collectionId = `${selectedPokemon.id}-${Date.now()}`;
      const newPokemon: MyPokemon = {
        ...selectedPokemon,
        ...formData,
        collectionId,
        moves: formData.moves.filter(move => move !== ''),
        location,
        caughtFrom,
        pokeball,
        gender,
        ability: ability.name,
        originalTrainer,
        trainerId,
        caughtDate: caughtDate?.toISOString() || dayjs().toISOString(),
        comments: comment
      };
      console.log('Adding Pokemon with collectionId:', collectionId);
      const formattedPokemon = {
        ...selectedPokemon,
        ...formData,
        collectionId,
        moves: formData.moves.filter(move => move !== ''),
        location,
        caughtFrom,
        pokeball,
        gender,
        ability: ability.name,
        originalTrainer,
        trainerId, 
        caughtDate: caughtDate?.toISOString() || dayjs().toISOString(),
        comments: comment
      };
      dispatch(addToCollection(formattedPokemon as any));
      setSelectedPokemon(null);
      setFormData({
        nickname: '',
        level: 1,
        nature: 'Hardy',
        shiny: false,
        ivs: {
          hp: 0, attack: 0, defense: 0,
          'special-attack': 0, 'special-defense': 0, speed: 0
        },
        evs: {
          hp: 0, attack: 0, defense: 0,
          'special-attack': 0, 'special-defense': 0, speed: 0
        },
        moves: ['', '', '', '']
      });
      setLocation('');
      setCaughtFrom('Main Series');
      setPokeball('Poke Ball');
      setGender('N/A');
      setAbility({ name: '', isHidden: false });
      setOriginalTrainer('');
      setTrainerId('');
      setCaughtDate(dayjs());
      setComment('');
    }
  };

  if (loading && !isInitialized) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Add Pokémon to Collection
      </Typography>
      
      <TextField
        fullWidth
        label="Search Pokémon"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Grid container spacing={3}>
        {paginatedPokemon.map((pokemon) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={pokemon.id}>
            <Card
              onClick={() => setSelectedPokemon(pokemon)}
              sx={{
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => theme.shadows[8],
                },
              }}
            >
              {selectedPokemon === pokemon && formData.shiny && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'warning.main',
                    color: 'warning.contrastText',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <span>✨</span>
                  <span>SHINY</span>
                </Box>
              )}
              
              <CardMedia
                component="img"
                image={selectedPokemon === pokemon && formData.shiny 
                  ? pokemon.sprites.other.home.front_shiny 
                  : pokemon.sprites.other.home.front_default}
                alt={pokemon.name}
                sx={{
                  objectFit: 'contain',
                  bgcolor: '#f5f5f5',
                  p: 2,
                  height: '200px',
                  width: '100%',
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography 
                  variant="h6"
                  sx={{
                    textAlign: 'center',
                    fontWeight: 500
                  }}
                >
                  {capitalizeFirstLetter(pokemon.name)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={Math.ceil(filteredPokemon.length / ITEMS_PER_PAGE)}
          page={page}
          onChange={(_, value) => setPage(value)}
        />
      </Box>

      <Dialog 
        open={!!selectedPokemon} 
        onClose={() => setSelectedPokemon(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          Add {selectedPokemon && capitalizeFirstLetter(selectedPokemon.name)} to Collection
          {formData.shiny && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                color: 'warning.main',
                fontSize: '0.8em',
                ml: 1,
              }}
            >
              ✨ SHINY
            </Box>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nickname"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.shiny}
                      onChange={(e) => setFormData({ ...formData, shiny: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="Shiny"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Level"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
                  inputProps={{ min: 1, max: 100 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Nature</InputLabel>
                  <Select
                    value={formData.nature}
                    label="Nature"
                    onChange={(e) => setFormData({ ...formData, nature: e.target.value })}
                  >
                    {NATURES.map((nature) => (
                      <MenuItem key={nature} value={nature}>{nature}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Caught From</InputLabel>
                  <Select
                    value={caughtFrom}
                    label="Caught From"
                    onChange={(e) => setCaughtFrom(e.target.value as typeof caughtFrom)}
                  >
                    <MenuItem value="Main Series">Main Series</MenuItem>
                    <MenuItem value="Pokemon GO">Pokémon GO</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <PokeballSelect
                  value={pokeball}
                  onChange={setPokeball}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Gender</Typography>
                <RadioGroup
                  row
                  value={gender}
                  onChange={(e) => setGender(e.target.value as typeof gender)}
                >
                  <FormControlLabel 
                    value="male" 
                    control={<Radio />} 
                    label={<MaleIcon sx={{ color: '#3273DC' }} />} 
                  />
                  <FormControlLabel 
                    value="female" 
                    control={<Radio />} 
                    label={<FemaleIcon sx={{ color: '#FF6B6B' }} />} 
                  />
                  <FormControlLabel 
                    value="N/A" 
                    control={<Radio />} 
                    label="N/A" 
                  />
                </RadioGroup>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Ability</InputLabel>
                  <Select
                    value={ability.name}
                    label="Ability"
                    onChange={(e) => {
                      const selectedAbility = selectedPokemon?.abilities.find(
                        a => a.ability.name === e.target.value
                      );
                      setAbility({
                        name: e.target.value,
                        isHidden: selectedAbility?.is_hidden || false
                      });
                    }}
                  >
                    {selectedPokemon?.abilities.map((ability) => (
                      <MenuItem key={ability.ability.name} value={ability.ability.name}>
                        {capitalizeFirstLetter(ability.ability.name)}
                        {ability.is_hidden && ' (Hidden)'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Original Trainer"
                  value={originalTrainer}
                  onChange={(e) => setOriginalTrainer(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Trainer ID"
                  value={trainerId}
                  onChange={(e) => setTrainerId(e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
              <DatePicker
                label="Caught Date"
                value={caughtDate}
                onChange={(newValue: Dayjs | null) => setCaughtDate(newValue)}
                sx={{ width: '100%' }}
              />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>IVs</Typography>
                <Grid container spacing={2}>
                  {Object.keys(formData.ivs).map((stat) => (
                    <Grid item xs={6} key={stat}>
                      <TextField
                        fullWidth
                        type="number"
                        label={capitalizeFirstLetter(stat)}
                        value={formData.ivs[stat as keyof typeof formData.ivs]}
                        onChange={(e) => setFormData({
                          ...formData,
                          ivs: {
                            ...formData.ivs,
                            [stat]: Number(e.target.value)
                          }
                        })}
                        inputProps={{ min: 0, max: 31 }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>EVs</Typography>
                <Grid container spacing={2}>
                  {Object.keys(formData.evs).map((stat) => (
                    <Grid item xs={6} key={stat}>
                      <TextField
                        fullWidth
                        type="number"
                        label={capitalizeFirstLetter(stat)}
                        value={formData.evs[stat as keyof typeof formData.evs]}
                        onChange={(e) => setFormData({
                          ...formData,
                          evs: {
                            ...formData.evs,
                            [stat]: Number(e.target.value)
                          }
                        })}
                        inputProps={{ min: 0, max: 252 }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Moves</Typography>
                <Grid container spacing={2}>
                  {formData.moves.map((move, index) => (
                    <Grid item xs={6} key={index}>
                      <TextField
                        fullWidth
                        label={`Move ${index + 1}`}
                        value={move}
                        onChange={(e) => {
                          const newMoves = [...formData.moves];
                          newMoves[index] = e.target.value;
                          setFormData({ ...formData, moves: newMoves });
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedPokemon(null)}>Cancel</Button>
          <Button onClick={handleAddPokemon} variant="contained">Add to Collection</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddPokemon;