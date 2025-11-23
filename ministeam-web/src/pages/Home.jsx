import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gamesAPI } from '../services/api';
import { useGamesStore, useCartStore, useWishlistStore, useAuthStore } from '../stores/store';
import GameCard from '../components/GameCard';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const games = useGamesStore((state) => state.games);
  const setGames = useGamesStore((state) => state.setGames);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredGames, setFeaturedGames] = useState([]);
  const [displayedGames, setDisplayedGames] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const cartItems = useCartStore((state) => state.items || []);
  const wishlistItems = useWishlistStore((state) => state.items || []);
  const carouselRef = useRef(null);

  useEffect(() => {
    loadGames();
  }, []);

  useEffect(() => {
    // Auto-rotate carousel
    const interval = setInterval(() => {
      if (featuredGames.length > 0) {
        setCurrentSlide((prev) => (prev + 1) % featuredGames.length);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredGames.length]);

  const loadGames = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await gamesAPI.getAll(page, 12);
      const juegos = response.data.juegos || response.data.games || [];
      const validGames = Array.isArray(juegos) ? juegos : [];
      
      if (page === 1) {
        setGames(validGames);
        // Featured games are the first 5
        setFeaturedGames(validGames.slice(0, 5));
      }
      
      setDisplayedGames(validGames);
      
      // Calcular total de páginas
      if (validGames.length === 12) {
        setTotalPages(page + 1); // Al menos hay una página más
      } else if (validGames.length > 0) {
        setTotalPages(page); // Esta es la última página
      }
      
      setCurrentPage(page);
    } catch (err) {
      setError('Error al cargar los juegos. Intenta más tarde.');
      console.error('Error cargando juegos:', err);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      loadGames(currentPage + 1);
      window.scrollTo({ top: 600, behavior: 'smooth' });
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      loadGames(currentPage - 1);
      window.scrollTo({ top: 600, behavior: 'smooth' });
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredGames.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredGames.length) % featuredGames.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="home-container">
      {/* Hero Carousel */}
      {featuredGames.length > 0 && (
        <div className="hero-carousel">
          <div className="carousel-container" ref={carouselRef}>
            {featuredGames.map((game, index) => (
              <div
                key={game.id_juego || game.id}
                className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                style={{
                  backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.9) 100%), url(${game.imagen_url || game.caratula_url})`
                }}
              >
                <div className="carousel-content">
                  <div className="carousel-info">
                    <h1>{game.titulo || game.nombre}</h1>
                    <p className="carousel-description">{game.descripcion || 'Descubre este increíble juego'}</p>
                    <div className="carousel-meta">
                      <span className="genre-tag">{game.genero_nombre || game.genero || 'Acción'}</span>
                      <span className="price-tag">${parseFloat(game.precio || 0).toFixed(2)}</span>
                    </div>
                    <button 
                      className="view-details-btn"
                      onClick={() => navigate(`/game/${game.id_juego || game.id}`)}
                    >
                      Ver Detalles
                    </button>
                  </div>
                  <div className="carousel-image">
                    <img src={game.imagen_url || game.caratula_url} alt={game.titulo || game.nombre} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="carousel-btn prev" onClick={prevSlide}>
            <FaChevronLeft />
          </button>
          <button className="carousel-btn next" onClick={nextSlide}>
            <FaChevronRight />
          </button>

          <div className="carousel-indicators">
            {featuredGames.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="content-wrapper">
        <section className="games-section">
          <div className="section-header">
            <h2>Todos los Juegos</h2>
            <div className="section-controls">
              {currentPage > 1 && (
                <button className="control-btn" onClick={() => loadGames(1)}>
                  Volver al inicio
                </button>
              )}
            </div>
          </div>

          {loading && currentPage === 1 && <div className="loading">Cargando juegos...</div>}
          {error && <div className="error-message">{error}</div>}

          {!loading && displayedGames.length > 0 && (
            <>
              <div className="games-grid">
                {displayedGames.map((game) => (
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

              <div className="pagination-container">
                <button 
                  onClick={prevPage} 
                  className="pagination-btn"
                  disabled={currentPage === 1}
                >
                  <FaChevronLeft />
                </button>
                <span className="page-info">
                  Página {currentPage} de {totalPages}
                </span>
                <button 
                  onClick={nextPage} 
                  className="pagination-btn"
                  disabled={currentPage >= totalPages}
                >
                  <FaChevronRight />
                </button>
              </div>
            </>
          )}

          {!loading && displayedGames.length === 0 && (
            <div className="no-games">
              No hay juegos disponibles en este momento.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
