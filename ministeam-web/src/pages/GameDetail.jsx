import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gamesAPI, reviewsAPI, cartAPI, wishlistAPI, libraryAPI } from '../services/api';
import { useCartStore, useWishlistStore, useAuthStore } from '../stores/store';
import './GameDetail.css';

export default function GameDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwned, setIsOwned] = useState(false);
  const user = useAuthStore((state) => state.user);
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const addWishlistItem = useWishlistStore((state) => state.addItem);
  const removeWishlistItem = useWishlistStore((state) => state.removeItem);
  const wishlistItems = useWishlistStore((state) => state.items);

  const gameId = parseInt(id);
  const isInCart = cartItems.some((item) => (item.id_juego || item.id) === gameId);
  const isInWishlist = wishlistItems.some((item) => (item.id_juego || item.id) === gameId);

  useEffect(() => {
    loadGameDetails();
  }, [id]);

  const loadGameDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const [gameResponse, reviewsResponse] = await Promise.all([
        gamesAPI.getById(id),
        reviewsAPI.getByGame(id).catch(() => ({ data: { reviews: [] } })),
      ]);
      setGame(gameResponse.data);
      setReviews(reviewsResponse.data.reviews || reviewsResponse.data.resenas || []);

      // Verificar si el usuario ya posee el juego
      if (user) {
        try {
          const libraryResponse = await libraryAPI.getAll();
          const ownedGames = libraryResponse.data.juegos || [];
          const owned = ownedGames.some(g => (g.id_juego || g.id) === gameId);
          setIsOwned(owned);
        } catch (err) {
          console.error('Error verificando biblioteca:', err);
        }
      }
    } catch (err) {
      setError('Error al cargar el juego');
      console.error('Error en GameDetail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      alert('⚠️ Debes iniciar sesión para agregar al carrito');
      return;
    }
    try {
      if (isInCart) {
        await cartAPI.remove(gameId);
        removeItem(gameId);
      } else {
        await cartAPI.add(gameId);
        addItem(game);
      }
    } catch (error) {
      console.error('Error en carrito:', error);
      const errorMsg = error.response?.data?.error || 'Error al actualizar el carrito';
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('⚠️ Sesión expirada. Por favor, inicia sesión nuevamente.');
        window.location.href = '/login';
      } else {
        alert(errorMsg);
      }
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      alert('⚠️ Debes iniciar sesión para usar la lista de deseos');
      return;
    }
    try {
      if (isInWishlist) {
        await wishlistAPI.remove(gameId);
        removeWishlistItem(gameId);
      } else {
        await wishlistAPI.add(gameId);
        addWishlistItem(game);
      }
    } catch (error) {
      console.error('Error en wishlist:', error);
      const errorMsg = error.response?.data?.error || 'Error al actualizar la lista de deseos';
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('⚠️ Sesión expirada. Por favor, inicia sesión nuevamente.');
        window.location.href = '/login';
      } else {
        alert(errorMsg);
      }
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!game) return <div className="error-message">Juego no encontrado</div>;

  // Convertir precio a número de forma segura
  const precio = parseFloat(game.precio) || 0;

  return (
    <div className="game-detail-container">
      <div className="game-header">
        <img
          src={game.imagen_url || game.caratula_url || 'https://via.placeholder.com/300x400'}
          alt={game.titulo || game.nombre}
          className="game-image-large"
        />
        <div className="game-info-section">
          <h1>{game.titulo || game.nombre}</h1>
          <p className="developer">{game.desarrollador || 'Desarrollador desconocido'}</p>
          <p className="description">{game.descripcion}</p>

          <div className="game-meta">
            <span className="genre">{game.genero_nombre || game.genero || 'Sin género'}</span>
            <span className="release-date">
              {game.fecha_lanzamiento ? new Date(game.fecha_lanzamiento).toLocaleDateString('es-ES') : 'N/A'}
            </span>
          </div>

          <div className="price-section">
            <span className="price">${precio.toFixed(2)}</span>
            {isOwned ? (
              <button className="owned-btn" onClick={() => navigate('/library')}>
                ✓ Adquirido - Ver en Biblioteca
              </button>
            ) : (
              <>
                <button className={`add-to-cart ${isInCart ? 'in-cart' : ''}`} onClick={handleAddToCart}>
                  {isInCart ? '✓ En carrito' : 'Añadir al carrito'}
                </button>
                <button className={`wishlist-btn-large ${isInWishlist ? 'active' : ''}`} onClick={handleToggleWishlist}>
                  {isInWishlist ? '❤️ Guardado' : '🤍 Guardar'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="reviews-section">
        <h2>Reseñas ({reviews.length})</h2>
        {reviews.length > 0 ? (
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review.id_resena} className="review-card">
                <div className="review-header">
                  <span className="reviewer-name">{review.nombre_usuario || 'Anónimo'}</span>
                  <span className="rating">{'⭐'.repeat(review.puntuacion)}</span>
                </div>
                <p className="review-text">{review.comentario}</p>
                <small className="review-date">{new Date(review.fecha_creacion).toLocaleDateString('es-ES')}</small>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-reviews">No hay reseñas aún</p>
        )}
      </div>
    </div>
  );
}
