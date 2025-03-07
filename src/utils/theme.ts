import { createTheme } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';

export const getTheme = (mode: PaletteMode) => {
  return createTheme({
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
    palette: {
      mode,
      primary: {
        main: '#DC0A2D',
        light: '#FF4D4D',
        dark: '#B00020',
      },
      secondary: {
        main: '#3B4CCA',
        light: '#5C6CE1',
        dark: '#2A3499',
      },
      background: {
        default: mode === 'light' ? '#F5F5F5' : '#121212',
        paper: mode === 'light' ? '#FFFFFF' : '#1E1E1E',
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#FFFFFF' : '#1E1E1E',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: 'linear-gradient(45deg, #DC0A2D 30%, #FF4D4D 90%)',
            boxShadow: '0 3px 5px 2px rgba(220, 10, 45, .3)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'light' ? '#FFFFFF' : '#1E1E1E',
          },
        },
      },
    },
  });
};