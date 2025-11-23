import { Link } from 'react-router-dom';
import { useAuthStore, useCartStore, useWishlistStore } from '../stores/store';
import { cartAPI, wishlistAPI } from '../services/api';
import './GameCard.css';

export default function GameCard({ game, isInCart, isInWishlist }) {
  const user = useAuthStore((state) => state.user);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const addWishlistItem = useWishlistStore((state) => state.addItem);
  const removeWishlistItem = useWishlistStore((state) => state.removeItem);

  const gameId = game.id_juego || game.id;
  const gameName = game.titulo || game.nombre || game.name || 'Sin título';
  const gamePrice = parseFloat(game.precio || game.price || 0);
  const gameImage = game.imagen_url || game.caratula_url || 'https://via.placeholder.com/200x280?text=No+Image';
  const gameGenre = game.genero_nombre || game.genero || 'Sin género';

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('⚠️ Debes iniciar sesión para agregar al carrito');
      return;
    }
    try {
      if (isInCart) {
        await cartAPI.remove(gameId);
        removeItem(gameId);
      } else {
        const response = await cartAPI.add(gameId);
        // Actualizar con los items retornados por el servidor
        if (response.data.items) {
          const setItems = useCartStore.getState().setItems;
          setItems(response.data.items);
        } else {
          addItem(game);
        }
      }
    } catch (error) {
      console.error('Error en carrito:', error);
      const errorMsg = error.response?.data?.error || 'Error al actualizar el carrito';
      
      if (error.response?.status === 409) {
        // El juego ya está en el carrito, actualizar estado local
        if (errorMsg.includes('ya está en tu carrito')) {
          console.log('🔄 El juego ya está en el carrito, sincronizando...');
          addItem(game);
        }
        return; // No mostrar alert para 409
      }
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('⚠️ Sesión expirada. Por favor, inicia sesión nuevamente.');
        window.location.href = '/login';
      } else {
        alert(errorMsg);
      }
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('⚠️ Debes iniciar sesión para usar la lista de deseos');
      return;
    }
    try {
      if (isInWishlist) {
        await wishlistAPI.remove(gameId);
        removeWishlistItem(gameId);
      } else {
        const response = await wishlistAPI.add(gameId);
        // Actualizar con los items retornados por el servidor
        if (response.data.items) {
          const setItems = useWishlistStore.getState().setItems;
          setItems(response.data.items);
        } else {
          addWishlistItem(game);
        }
      }
    } catch (error) {
      console.error('Error en wishlist:', error);
      const errorMsg = error.response?.data?.error || 'Error al actualizar la lista de deseos';
      
      if (error.response?.status === 409) {
        // El juego ya está en la wishlist, actualizar estado local
        if (errorMsg.includes('ya está en tu lista')) {
          console.log('🔄 El juego ya está en la wishlist, sincronizando...');
          addWishlistItem(game);
        }
        return; // No mostrar alert para 409
      }
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('⚠️ Sesión expirada. Por favor, inicia sesión nuevamente.');
        window.location.href = '/login';
      } else {
        alert(errorMsg);
      }
    }
  };

  return (
    <Link to={`/game/${gameId}`} className="game-card">
      <div className="game-image">
        <img
          src={gameImage}
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
        <p className="genre">{gameGenre}</p>
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
