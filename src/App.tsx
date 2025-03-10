import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Collection from './pages/Collection';
import AddPokemon from './pages/AddPokemon';
import PokemonDetails from './pages/PokemonDetails';
import Layout from './components/Layout';
import { initializeCollection } from './store/pokemonSlice';
import type { AppDispatch } from './store/store';

function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Initialize collection from IndexedDB when app starts
    dispatch(initializeCollection());
  }, [dispatch]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Collection />} />
        <Route path="/add" element={<AddPokemon />} />
        <Route path="/pokemon/:id" element={<PokemonDetails />} />
      </Routes>
    </Layout>
  );
}

export default App;