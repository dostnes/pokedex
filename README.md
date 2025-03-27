# PokéCollector

## Overview

PokéCollector is a comprehensive Pokémon collection management application built with React, TypeScript, and Material-UI. It allows trainers to catalog, organize, and showcase their Pokémon collections with detailed information and customization options.

## Features

### Core Functionality
- **Pokémon Collection Management**: Add, edit, and remove Pokémon from your personal collection
- **Detailed Pokémon Information**: View comprehensive details including stats, abilities, types, and more
- **Local PokeAPI Integration**: Connect to a local PokeAPI server for Pokémon data
- **Persistent Storage**: Collection data is stored in IndexedDB for reliable performance with large collections
- **Import/Export**: Easily backup and restore your collection data

### Advanced Features
- **EV/IV Management**: Track and modify Effort Values (EVs) and Individual Values (IVs) for each Pokémon
- **Custom Attributes**: Record catch location, Poké Ball type, nature, level, and more
- **Slideshow Mode**: Showcase your collection with an automated slideshow featuring random Pokémon
- **Responsive Design**: Optimized for both desktop and mobile devices

### Pokémon Details
- **Visual Representation**: Display Pokémon sprites and artwork
- **Poké Ball Visualization**: Show which Poké Ball was used to catch each Pokémon
- **Stat Management**: Comprehensive stat tracking and visualization

## Technical Stack

- **Frontend**: React with TypeScript
- **State Management**: Redux with Redux Toolkit
- **UI Framework**: Material-UI (MUI)
- **Storage**: IndexedDB for large collection support
- **API**: Local PokeAPI server for Pokémon data
- **Routing**: React Router for navigation

## Installation

### Development Setup

1. **Prerequisites**
   - Node.js (v20.x or later)
   - npm (comes with Node.js)
   - Git

2. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd pokedex
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Start Development Servers**
   ```bash
   # Start the backend server (in one terminal)
   npm run pokeserver

   # Start the development server (in another terminal)
   npm run dev
   ```

5. **Access the Application**
   - Open your browser and navigate to `http://localhost:5173`
   - The backend API will be available at `http://localhost:3001`

### Raspberry Pi Setup

1. **Initial OS Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install required packages
   sudo apt install -y git curl build-essential

   # Install Node.js (LTS version)
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Verify installations
   node --version
   npm --version
   git --version
   ```

2. **Application Setup**
   ```bash
   # Clone repository (replace USERNAME with your actual username)
   cd /home/USERNAME
   git clone <repository-url>
   cd pokedex

   # Install dependencies
   npm install

   # Build the application
   npm run build
   ```

3. **Service Setup**
   The project includes two service files in the root directory:
   - `pokedex-server.service`
   - `pokedex-frontend.service`

   Copy these files to the systemd directory:
   ```bash
   sudo cp pokedex-server.service /etc/systemd/system/
   sudo cp pokedex-frontend.service /etc/systemd/system/
   ```

4. **Start Services**
   ```bash
   # Reload systemd
   sudo systemctl daemon-reload

   # Enable services to start on boot
   sudo systemctl enable pokedex-server
   sudo systemctl enable pokedex-frontend

   # Start services
   sudo systemctl start pokedex-server
   sudo systemctl start pokedex-frontend

   # Check status
   sudo systemctl status pokedex-server
   sudo systemctl status pokedex-frontend
   ```

5. **Collection Setup**
   The project includes a `collection-data` directory in the root folder. Your collection data should be placed here:
   ```bash
   # Copy your collection file to the collection-data directory
   cp /path/to/your/collection.json collection-data/collection.json

   # Make import script executable
   chmod +x import-collection.sh

   # Import collection
   ./import-collection.sh
   ```

6. **Access the Application**
   - Open a browser and go to `http://localhost:3000` or `http://your-pi-ip:3000`
   - The application should be running in production mode

### Useful Commands

**Development:**
```bash
# Start development server
npm run dev

# Start backend server
npm run pokeserver

# Build for production
npm run build

# Preview production build
npm run preview
```

**Raspberry Pi:**
```bash
# View service logs
sudo journalctl -u pokedex-server -f
sudo journalctl -u pokedex-frontend -f

# Restart services
sudo systemctl restart pokedex-server
sudo systemctl restart pokedex-frontend

# Stop services
sudo systemctl stop pokedex-server
sudo systemctl stop pokedex-frontend
```

## Data Management

### Collection Synchronization

The application supports collection synchronization between devices:

1. **Export Collection**
   ```bash
   # On your development machine
   ./sync-collection.sh
   ```

2. **Import Collection**
   ```bash
   # On the Raspberry Pi
   ./import-collection.sh
   ```

## Troubleshooting

### Development Issues

1. **Port Already in Use**
   - Check if another process is using the port
   - Kill the process or use a different port

2. **Node.js Version Issues**
   - Ensure you're using Node.js v20.x or later
   - Use nvm to manage Node.js versions

### Raspberry Pi Issues

1. **Service Not Starting**
   - Check service logs: `sudo journalctl -u pokedex-server -f`
   - Verify file permissions
   - Check Node.js installation

2. **Performance Issues**
   - Use production build instead of development server
   - Monitor system resources with `htop`
   - Consider using a swap file if memory is low

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Pokémon and all related properties are owned by Nintendo, Game Freak, and The Pokémon Company
- PokeAPI for providing the comprehensive Pokémon database
- All the contributors and maintainers of the libraries used in this project