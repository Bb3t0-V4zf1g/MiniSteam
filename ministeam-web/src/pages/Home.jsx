import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { gamesAPI } from '../services/api';
import { useGamesStore, useCartStore, useWishlistStore, useAuthStore } from '../stores/store';
import GameCard from '../components/GameCard';
import './Home.css';

export default function Home() {
  const user = useAuthStore((state) => state.user);
  const games = useGamesStore((state) => state.games);
  const setGames = useGamesStore((state) => state.setGames);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const cartItems = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await gamesAPI.getAll(1, 12);
      setGames(response.data.juegos || []);
    } catch (err) {
      setError('Error al cargar los juegos. Intenta más tarde.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <div className="hero">
        <div className="hero-content">
          <h1>Bienvenido a MiniSteam</h1>
          <p>Descubre y compra los mejores juegos indie</p>
          {!user && (
            <Link to="/register" className="cta-button">
              Comenzar
            </Link>
          )}
        </div>
      </div>

      <div className="content-wrapper">
        <section className="games-section">
          <h2>Juegos Populares</h2>

          {loading && <div className="loading">Cargando juegos...</div>}
          {error && <div className="error-message">{error}</div>}

          {!loading && games.length > 0 && (
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
          )}

          {!loading && games.length === 0 && (
            <div className="no-games">
              No hay juegos disponibles en este momento.
            </div>
          )}
        </section>

        <aside className="sidebar">
          <div className="sidebar-card">
            <h3>🛒 Carrito</h3>
            <p className="stat">{cartItems.length} artículos</p>
            <Link to="/cart" className="sidebar-button">
              Ver Carrito
            </Link>
          </div>

          {user && (
            <>
              <div className="sidebar-card">
                <h3>❤️ Lista de Deseos</h3>
                <p className="stat">{wishlistItems.length} juegos</p>
                <Link to="/wishlist" className="sidebar-button">
                  Ver Lista
                </Link>
              </div>

              <div className="sidebar-card">
                <h3>📚 Mi Biblioteca</h3>
                <Link to="/library" className="sidebar-button">
                  Mis Compras
                </Link>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
