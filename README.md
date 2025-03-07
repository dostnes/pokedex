# Pokédex - Pokémon Collection Manager

A modern web application for managing your Pokémon collection, built with React, TypeScript, and Material UI.

## Features

- **Browse Pokémon**: View all Pokémon from the Pokémon API with pagination and search
- **Collection Management**: Add, view, and remove Pokémon from your personal collection
- **Detailed Pokémon Information**: View comprehensive stats, moves, and other details
- **Customization**: Add nicknames, set levels, natures, IVs, EVs, and more
- **Shiny Variants**: Toggle between normal and shiny sprites
- **Responsive Design**: Works on desktop and mobile devices

## Technologies Used

- **React 19**: For building the user interface
- **TypeScript**: For type safety and better developer experience
- **Redux Toolkit**: For state management
- **Material UI 6**: For UI components and styling
- **React Router**: For navigation
- **Axios**: For API requests
- **Vite**: For fast development and building
- **LocalStorage**: For persisting collection data

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pokedex.git
   cd pokedex
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Adding Pokémon to Your Collection

1. Navigate to the "Add Pokémon" page
2. Browse or search for a Pokémon
3. Click on a Pokémon to open the add form
4. Fill in details like nickname, level, nature, etc.
5. Click "Add to Collection" to save

### Viewing Your Collection

1. Navigate to the home page to see your collection
2. Click on any Pokémon to view detailed information
3. Use the search bar to filter your collection

### Removing Pokémon

1. Open a Pokémon's details page
2. Click the "Remove from Collection" button

## Project Structure

```
src/
├── components/ # Reusable UI components
├── context/ # React context providers
├── pages/ # Page components
├── services/ # API services
├── store/ # Redux store and slices
├── types/ # TypeScript type definitions
├── utils/ # Utility functions
├── App.tsx # Main application component
└── main.tsx # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Data Persistence

The application uses localStorage to persist your Pokémon collection between sessions. The Pokémon API data is also cached to reduce API calls.

## Future Enhancements

- Team building functionality
- Battle statistics
- Evolution chains
- Move details and compatibility
- Import/export collection data

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [PokéAPI](https://pokeapi.co/) for providing the Pokémon data
- Pokémon and all related properties belong to Nintendo, Game Freak, and The Pokémon Company
