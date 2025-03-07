import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const pokeballs = [
  'Poke Ball',
  'Great Ball',
  'Ultra Ball',
  'Master Ball',
  'Premier Ball',
  'Luxury Ball',
  'Timer Ball',
  'Quick Ball',
  'Dusk Ball',
  'Heal Ball',
  'Net Ball',
  'Dive Ball',
  'Nest Ball',
  'Repeat Ball',
  'Safari Ball',
  'Level Ball',
  'Lure Ball',
  'Heavy Ball',
  'Fast Ball',
  'Friend Ball',
  'Love Ball',
  'Moon Ball',
  'Sport Ball',
  'Dream Ball',
  'Beast Ball'
];

interface PokeballSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const PokeballSelect = ({ value, onChange }: PokeballSelectProps) => {
  return (
    <FormControl fullWidth>
      <InputLabel>Pokéball</InputLabel>
      <Select
        value={value}
        label="Pokéball"
        onChange={(e) => onChange(e.target.value)}
      >
        {pokeballs.map((ball) => (
          <MenuItem key={ball} value={ball}>
            {ball}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default PokeballSelect;