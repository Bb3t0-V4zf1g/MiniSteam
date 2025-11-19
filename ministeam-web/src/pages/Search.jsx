import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { gamesAPI, genresAPI } from '../services/api';
import { useCartStore, useWishlistStore } from '../stores/store';
import GameCard from '../components/GameCard';
import './Search.css';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [games, setGames] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || 0);
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || 1000);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'recent');

  const cartItems = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);

  // Cargar géneros
  useEffect(() => {
    loadGenres();
  }, []);

  // Cargar juegos cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
    loadGames(1);
  }, [searchTerm, selectedGenre, minPrice, maxPrice, sortBy]);

  const loadGenres = async () => {
    try {
      const response = await genresAPI.getAll();
      setGenres(response.data.generos || []);
    } catch (err) {
      console.error('Error loading genres:', err);
    }
  };

  const loadGames = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      // Construir parámetros de búsqueda
      const params = {
        page,
        limit: 12,
      };

      if (searchTerm) params.nombre = searchTerm;
      if (selectedGenre) params.id_genero = selectedGenre;
      if (minPrice || maxPrice) {
        params.minPrice = minPrice;
        params.maxPrice = maxPrice;
      }
      if (sortBy) params.sort = sortBy;

      const response = await gamesAPI.getAll(page, 12, params);
      const juegos = response.data.juegos || [];
      setGames(juegos);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(page);

      // Actualizar URL
      const newParams = new URLSearchParams();
      if (searchTerm) newParams.set('q', searchTerm);
      if (selectedGenre) newParams.set('genre', selectedGenre);
      if (minPrice) newParams.set('minPrice', minPrice);
      if (maxPrice) newParams.set('maxPrice', maxPrice);
      if (sortBy) newParams.set('sort', sortBy);
      setSearchParams(newParams);
    } catch (err) {
      setError('Error al buscar juegos. Intenta con otros filtros.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadGames(1);
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedGenre('');
    setMinPrice(0);
    setMaxPrice(1000);
    setSortBy('recent');
    setSearchParams({});
  };

  return (
    <div className="search-container">
      <div className="search-header">
        <h1>🔍 Buscar Juegos</h1>
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">
            Buscar
          </button>
        </form>
      </div>

      <div className="search-wrapper">
        <aside className="filters-panel">
          <h3>Filtros</h3>

          {/* Género */}
          <div className="filter-group">
            <label>Género</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="filter-select"
            >
              <option value="">Todos los géneros</option>
              {genres.map((genre) => (
                <option key={genre.id_genero || genre.id} value={genre.id_genero || genre.id}>
                  {genre.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Rango de Precio */}
          <div className="filter-group">
            <label>Rango de Precio</label>
            <div className="price-range">
              <input
                type="number"
                min="0"
                max="1000"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                className="price-input"
                placeholder="Mín"
              />
              <span>-</span>
              <input
                type="number"
                min="0"
                max="1000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="price-input"
                placeholder="Máx"
              />
            </div>
            <div className="price-display">
              ${minPrice} - ${maxPrice}
            </div>
          </div>

          {/* Ordenar */}
          <div className="filter-group">
            <label>Ordenar por</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="recent">Más Recientes</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="rating">Mejor Calificados</option>
              <option value="name">Alfabético (A-Z)</option>
            </select>
          </div>

          <button className="reset-btn" onClick={handleReset}>
            🔄 Restablecer Filtros
          </button>
        </aside>

        <section className="results-section">
          {loading && <div className="loading">Buscando juegos...</div>}
          {error && <div className="error-message">{error}</div>}

          {!loading && games.length === 0 && (
            <div className="no-results">
              <p>No se encontraron juegos con esos criterios.</p>
              <button className="reset-btn" onClick={handleReset}>
                🔄 Restablecer Filtros
              </button>
            </div>
          )}

          {!loading && games.length > 0 && (
            <>
              <div className="results-info">
                <p>{games.length} juegos encontrados</p>
              </div>

              <div className="games-grid">
                {games.map((game) => (
                  <GameCard
                    key={game.id_juego || game.id}
                    game={game}
                    isInCart={cartItems.some(
                      (item) => (item.id_juego || item.id) === (game.id_juego || game.id)
                    )}
                    isInWishlist={wishlistItems.some(
                      (item) => (item.id_juego || item.id) === (game.id_juego || game.id)
                    )}
                  />
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="pagination">
                  {currentPage > 1 && (
                    <button
                      className="page-btn"
                      onClick={() => loadGames(currentPage - 1)}
                    >
                      ← Anterior
                    </button>
                  )}

                  <span className="page-info">
                    Página {currentPage} de {totalPages}
                  </span>

                  {currentPage < totalPages && (
                    <button
                      className="page-btn"
                      onClick={() => loadGames(currentPage + 1)}
                    >
                      Siguiente →
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
