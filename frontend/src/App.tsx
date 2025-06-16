import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import pages
import Home from './pages/Home';
import Movies from './pages/Movies';
import TVShows from './pages/TVShows';
import Search from './pages/Search';
import Recommendations from './pages/Recommendations';
import Analytics from './pages/Analytics';
import GenreExplorer from './pages/GenreExplorer';
import MovieDetail from './pages/MovieDetail';
import TVShowDetail from './pages/TVShowDetail';

// Import components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <Navbar />
        <main className="container mx-auto px-4 py-8 min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/movies/:id" element={<MovieDetail />} />
            <Route path="/tv-shows" element={<TVShows />} />
            <Route path="/tv-shows/:id" element={<TVShowDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/genres" element={<GenreExplorer />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
