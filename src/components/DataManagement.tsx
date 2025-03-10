import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Typography,
  Alert,
  Snackbar,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import InfoIcon from '@mui/icons-material/Info';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { RootState, AppDispatch } from '../store/store';
import { importCollectionAsync } from '../store/pokemonSlice';

const DataManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch<AppDispatch>();
  const myCollection = useSelector((state: RootState) => state.pokemon.myCollection);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  // For mobile menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExportData = () => {
    try {
      // Create a JSON blob from the collection data
      const dataStr = JSON.stringify(myCollection, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      
      // Create a download link and trigger it
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Create a filename with current date
      const date = new Date().toISOString().split('T')[0];
      link.download = `pokemon-collection-${date}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSnackbarMessage('Collection exported successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleMenuClose();
    } catch (error) {
      console.error('Export failed:', error);
      setSnackbarMessage('Export failed. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = event.target;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importedData = JSON.parse(content);
          
          // Validate that the imported data is an array
          if (!Array.isArray(importedData)) {
            throw new Error('Invalid data format');
          }
          
          console.log('Importing collection:', {
            size: importedData.length,
            firstPokemon: importedData[0]?.name,
            lastPokemon: importedData[importedData.length - 1]?.name
          });
          
        // Use importCollectionAsync instead of importCollection
        dispatch(importCollectionAsync(importedData));
          
          setSnackbarMessage('Collection imported successfully!');
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
          
          // Reset the file input
          fileInput.value = '';
          handleMenuClose();
        } catch (error) {
          console.error('Import failed:', error);
          setSnackbarMessage('Import failed. Please check your file format.');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      };
      
      reader.readAsText(file);
    }
  };

  const handleInfoClick = () => {
    setIsInfoDialogOpen(true);
    handleMenuClose();
  };

  // Mobile version with dropdown menu
  if (isMobile) {
    return (
      <>
        <Tooltip title="Data Options">
          <IconButton
            color="inherit"
            onClick={handleMenuClick}
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.2)',
              }
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </Tooltip>
        
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          MenuListProps={{
            'aria-labelledby': 'data-management-button',
          }}
        >
          <MenuItem onClick={handleExportData}>
            <FileDownloadIcon fontSize="small" sx={{ mr: 1 }} />
            Export Collection
          </MenuItem>
          
          <MenuItem component="label">
            <FileUploadIcon fontSize="small" sx={{ mr: 1 }} />
            Import Collection
            <input
              type="file"
              accept=".json"
              hidden
              onChange={handleImportData}
            />
          </MenuItem>
          
          <MenuItem onClick={handleInfoClick}>
            <InfoIcon fontSize="small" sx={{ mr: 1 }} />
            Data Info
          </MenuItem>
        </Menu>
        
        {/* Info Dialog */}
        <Dialog open={isInfoDialogOpen} onClose={() => setIsInfoDialogOpen(false)}>
          <DialogTitle>About Your Collection Data</DialogTitle>
          <DialogContent>
            <Typography paragraph>
              Your Pokémon collection data is currently stored in your browser's local storage. 
              This means it persists between sessions but is tied to this specific browser.
            </Typography>
            <Typography paragraph>
              <strong>To ensure your data is safe:</strong>
            </Typography>
            <Typography component="ul" sx={{ pl: 2 }}>
              <li>Use the Export button regularly to save a backup of your collection</li>
              <li>Store these backup files in a safe location (cloud storage, external drive, etc.)</li>
              <li>If you need to switch browsers or devices, use the Import feature to restore your collection</li>
            </Typography>
            <Typography paragraph>
              The exported JSON file can also be used with other applications or for data analysis if needed.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsInfoDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
        
        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbarOpen(false)} 
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </>
    );
  }

  // Desktop version with buttons
  return (
    <>
      <Button
        variant="text"
        startIcon={<FileDownloadIcon />}
        onClick={handleExportData}
        size="small"
        sx={{ 
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }
        }}
      >
        Export
      </Button>
      
      <Button
        variant="text"
        component="label"
        startIcon={<FileUploadIcon />}
        size="small"
        sx={{ 
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }
        }}
      >
        Import
        <input
          type="file"
          accept=".json"
          hidden
          onChange={handleImportData}
        />
      </Button>
      
      <IconButton
        size="small"
        onClick={() => setIsInfoDialogOpen(true)}
        sx={{ 
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }
        }}
      >
        <InfoIcon />
      </IconButton>
      
      {/* Info Dialog */}
      <Dialog open={isInfoDialogOpen} onClose={() => setIsInfoDialogOpen(false)}>
        <DialogTitle>About Your Collection Data</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Your Pokémon collection data is currently stored in your browser's local storage. 
            This means it persists between sessions but is tied to this specific browser.
          </Typography>
          <Typography paragraph>
            <strong>To ensure your data is safe:</strong>
          </Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <li>Use the Export button regularly to save a backup of your collection</li>
            <li>Store these backup files in a safe location (cloud storage, external drive, etc.)</li>
            <li>If you need to switch browsers or devices, use the Import feature to restore your collection</li>
          </Typography>
          <Typography paragraph>
            The exported JSON file can also be used with other applications or for data analysis if needed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsInfoDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DataManagement;