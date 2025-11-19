import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { gamesAPI, reviewsAPI } from '../services/api';
import { useCartStore, useWishlistStore, useAuthStore } from '../stores/store';
import './GameDetail.css';

export default function GameDetail() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
        reviewsAPI.getByGame(id),
      ]);
      setGame(gameResponse.data.juego);
      setReviews(reviewsResponse.data.resenas || []);
    } catch (err) {
      setError('Error al cargar el juego');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (isInCart) {
      removeItem(gameId);
    } else {
      addItem(game);
    }
  };

  const handleToggleWishlist = () => {
    if (!user) {
      alert('Debes iniciar sesión');
      return;
    }
    if (isInWishlist) {
      removeWishlistItem(gameId);
    } else {
      addWishlistItem(game);
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!game) return <div className="error-message">Juego no encontrado</div>;

  return (
    <div className="game-detail-container">
      <div className="game-header">
        <img
          src={game.caratula_url || 'https://via.placeholder.com/300x400'}
          alt={game.nombre}
          className="game-image-large"
        />
        <div className="game-info-section">
          <h1>{game.nombre}</h1>
          <p className="developer">{game.desarrollador || 'Desarrollador desconocido'}</p>
          <p className="description">{game.descripcion}</p>

          <div className="game-meta">
            <span className="genre">{game.genero || 'Sin género'}</span>
            <span className="release-date">
              {game.fecha_lanzamiento ? new Date(game.fecha_lanzamiento).toLocaleDateString('es-ES') : 'N/A'}
            </span>
          </div>

          <div className="price-section">
            <span className="price">${game.precio?.toFixed(2) || '0.00'}</span>
            <button className={`add-to-cart ${isInCart ? 'in-cart' : ''}`} onClick={handleAddToCart}>
              {isInCart ? '✓ En carrito' : 'Añadir al carrito'}
            </button>
            <button className={`wishlist-btn-large ${isInWishlist ? 'active' : ''}`} onClick={handleToggleWishlist}>
              {isInWishlist ? '❤️ Guardado' : '🤍 Guardar'}
            </button>
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
