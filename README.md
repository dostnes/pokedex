# Pokédex App

A web application for managing your Pokémon collection. Built with React, TypeScript, and Material-UI.

## Features

- View your Pokémon collection
- Add new Pokémon with custom stats (IVs, EVs, Nature)
- View detailed information about each Pokémon
- Search and filter functionality
- Responsive design
- Data persistence using JSON Server

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pokedex
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

1. Start the JSON Server (in one terminal):
```bash
npm run server
```

2. Start the development server (in another terminal):
```bash
npm run dev
```

The application will be available at `http://localhost:5173`
The JSON Server will be running at `http://localhost:3001`

## Technology Stack

- React 18
- TypeScript
- Redux Toolkit for state management
- React Router for navigation
- Material-UI for components
- Axios for API calls
- JSON Server for data persistence
- Vite for build tooling

## Project Structure

```
src/
├── components/     # Reusable UI components
├── features/      # Feature-specific components
├── pages/         # Page components
├── services/      # API services
├── store/         # Redux store configuration
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── db/            # JSON Server database
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
