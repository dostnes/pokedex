import { Routes, Route } from 'react-router-dom';
import Collection from './pages/Collection';
import AddPokemon from './pages/AddPokemon';
import PokemonDetails from './pages/PokemonDetails';
import Layout from './components/Layout';

function App() {
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