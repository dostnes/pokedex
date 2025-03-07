import { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Box,
  Container,
  Link,
  Toolbar,
  Typography,
  Button,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import { styled, useTheme as useMuiTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
  children: ReactNode;
}

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(45deg, #DC0A2D 30%, #FF4D4D 90%)',
  boxShadow: '0 3px 5px 2px rgba(220, 10, 45, .3)',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(0, 2),
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: 'white',
  marginLeft: theme.spacing(2),
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

const Layout = ({ children }: LayoutProps) => {
  const muiTheme = useMuiTheme();
  const { toggleTheme, isDarkMode } = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        width: '100%',
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      <StyledAppBar position="static">
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 1,
                fontWeight: 700,
                fontSize: { xs: '1.2rem', sm: '1.5rem' },
                letterSpacing: '0.1em',
              }}
            >
              <Link
                component={RouterLink}
                to="/"
                color="inherit"
                sx={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                Pokédex
              </Link>
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
              {isMobile ? (
                <>
                  <Link component={RouterLink} to="/" sx={{ textDecoration: 'none' }}>
                    <NavButton size="small">Collection</NavButton>
                  </Link>
                  <Link component={RouterLink} to="/add" sx={{ textDecoration: 'none' }}>
                    <NavButton size="small">Add</NavButton>
                  </Link>
                </>
              ) : (
                <>
                  <Link component={RouterLink} to="/" sx={{ textDecoration: 'none' }}>
                    <NavButton>My Collection</NavButton>
                  </Link>
                  <Link component={RouterLink} to="/add" sx={{ textDecoration: 'none' }}>
                    <NavButton>Add Pokémon</NavButton>
                  </Link>
                </>
              )}
              <IconButton
                onClick={toggleTheme}
                color="inherit"
                sx={{ 
                  ml: 1,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                  }
                }}
              >
                {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </StyledAppBar>

      <Container
        component="main"
        maxWidth="lg"
        sx={{
          flex: 1,
          py: { xs: 2, sm: 4 },
          px: { xs: 2, sm: 3, md: 4 },
          width: '100%',
        }}
      >
        {children}
      </Container>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
          >
            © {new Date().getFullYear()} Pokédex App - gotta catch em all!
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;