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
- **Evolution Chains**: View evolution information for each Pokémon

## Technical Stack

- **Frontend**: React with TypeScript
- **State Management**: Redux with Redux Toolkit
- **UI Framework**: Material-UI (MUI)
- **Storage**: IndexedDB for large collection support
- **API**: Local PokeAPI server for Pokémon data
- **Routing**: React Router for navigation

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Local PokeAPI server running on port 3002 (optional, can be configured)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/pokecollector.git
   cd pokecollector
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. The application will be available at `http://localhost:3000`

### Setting Up Local PokeAPI (Optional)

For optimal performance, you can set up a local PokeAPI server:

1. Clone the PokeAPI data repository
2. Follow the setup instructions for the local server
3. Ensure it's running on port 3002 (or update the configuration in the app)

## Usage Guide

### Adding Pokémon to Your Collection

1. Navigate to the "All Pokémon" page
2. Search or browse for the Pokémon you want to add
3. Click "Add to Collection" and fill in the details
4. Save to add the Pokémon to your personal collection

### Managing Your Collection

- **View Details**: Click on any Pokémon in your collection to view its complete details
- **Edit**: Update information such as level, nature, EVs, and more
- **Remove**: Delete Pokémon from your collection when needed
- **Sort/Filter**: Organize your collection by various attributes

### Slideshow Mode

1. Navigate to the "Slideshow" page
2. Adjust settings like duration and display options
3. Start the slideshow to see your Pokémon displayed in random order
4. Use controls to pause, skip, or restart the slideshow

### Data Management

- **Export Collection**: Back up your collection data to a JSON file
- **Import Collection**: Restore your collection from a previously exported file
- **Monitor Storage**: Keep track of your IndexedDB usage with the storage monitor

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Pokémon and all related properties are owned by Nintendo, Game Freak, and The Pokémon Company
- PokeAPI for providing the comprehensive Pokémon database
- All the contributors and maintainers of the libraries used in this project