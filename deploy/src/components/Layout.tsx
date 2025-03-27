import React, { ReactNode } from 'react';
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
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import { styled, useTheme as useMuiTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '../context/ThemeContext';
import DataManagement from './DataManagement';

interface LayoutProps {
  children: ReactNode;
}

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(135deg, #DC0A2D 0%, #FF4D4D 100%)',
  boxShadow: '0 2px 8px rgba(220, 10, 45, 0.3)',
  backdropFilter: 'blur(8px)',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(0, 2),
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: 'white',
  marginLeft: theme.spacing(1),
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(1),
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  fontSize: '1.5rem',
  letterSpacing: '0.02em',
  background: 'linear-gradient(45deg, #FFFFFF 30%, #FFE5E5 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  [theme.breakpoints.down('md')]: {
    fontSize: '1.2rem',
  },
}));

const Layout = ({ children }: LayoutProps) => {
  const muiTheme = useMuiTheme();
  const { toggleTheme, isDarkMode } = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState<null | HTMLElement>(null);

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const navItems = [
    { label: 'Collection', path: '/' },
    { label: '+ Add', path: '/add' },
    { label: 'Dex Tracker', path: '/tracker' },
    { label: 'Slideshow', path: '/slideshow' },
    { label: 'Timeline', path: '/timeline' },
    { label: 'Favorites', path: '/favorites' },
  ];

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
            <Link
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                mr: 2,
              }}
            >
              <LogoText>
                PokéCollection
              </LogoText>
            </Link>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isMobile ? (
                <>
                  <IconButton
                    color="inherit"
                    onClick={handleMobileMenuOpen}
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                      }
                    }}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Menu
                    anchorEl={mobileMenuAnchor}
                    open={Boolean(mobileMenuAnchor)}
                    onClose={handleMobileMenuClose}
                    PaperProps={{
                      sx: {
                        mt: 1,
                        minWidth: 200,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }
                    }}
                  >
                    {navItems.map((item) => (
                      <MenuItem
                        key={item.path}
                        component={RouterLink}
                        to={item.path}
                        onClick={handleMobileMenuClose}
                        sx={{
                          py: 1.5,
                          px: 2,
                          '&:hover': {
                            bgcolor: 'action.hover',
                          }
                        }}
                      >
                        {item.label}
                      </MenuItem>
                    ))}
                    <Divider sx={{ my: 1 }} />
                    <DataManagement />
                  </Menu>
                </>
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 4 }}>
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        component={RouterLink}
                        to={item.path}
                        sx={{ textDecoration: 'none' }}
                      >
                        <NavButton>{item.label}</NavButton>
                      </Link>
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, borderLeft: '1px solid rgba(255, 255, 255, 0.2)', pl: 2 }}>
                    <DataManagement />
                    <IconButton
                      onClick={toggleTheme}
                      color="inherit"
                      sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                        }
                      }}
                    >
                      {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>
                  </Box>
                </>
              )}
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
            © {new Date().getFullYear()} PokéCollection - data provided by <a href="https://pokeapi.co/" target="_blank" rel="noopener noreferrer">PokéAPI</a>
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;