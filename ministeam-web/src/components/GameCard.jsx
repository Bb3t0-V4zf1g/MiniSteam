import { Link } from 'react-router-dom';
import { useAuthStore, useCartStore, useWishlistStore } from '../stores/store';
import './GameCard.css';

export default function GameCard({ game, isInCart, isInWishlist }) {
  const user = useAuthStore((state) => state.user);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const addWishlistItem = useWishlistStore((state) => state.addItem);
  const removeWishlistItem = useWishlistStore((state) => state.removeItem);

  const gameId = game.id_juego || game.id;
  const gameName = game.nombre || game.name;
  const gamePrice = game.precio || game.price || 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (isInCart) {
      removeItem(gameId);
    } else {
      addItem(game);
    }
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    if (!user) {
      alert('Debes iniciar sesión para usar la lista de deseos');
      return;
    }
    if (isInWishlist) {
      removeWishlistItem(gameId);
    } else {
      addWishlistItem(game);
    }
  };

  return (
    <Link to={`/game/${gameId}`} className="game-card">
      <div className="game-image">
        <img
          src={game.caratula_url || 'https://via.placeholder.com/200x280?text=No+Image'}
          alt={gameName}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/200x280?text=No+Image';
          }}
        />
        <div className="game-overlay">
          <button
            className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
            onClick={handleToggleWishlist}
            title={isInWishlist ? 'Eliminar de lista de deseos' : 'Añadir a lista de deseos'}
          >
            ❤️
          </button>
        </div>
      </div>

      <div className="game-info">
        <h3>{gameName}</h3>
        <p className="genre">{game.genero || 'Sin género'}</p>
        <div className="game-footer">
          <span className="price">${gamePrice.toFixed(2)}</span>
          <button
            className={`add-to-cart-btn ${isInCart ? 'in-cart' : ''}`}
            onClick={handleAddToCart}
          >
            {isInCart ? '✓' : '🛒'}
          </button>
        </div>
      </div>
    </Link>
  );
}
