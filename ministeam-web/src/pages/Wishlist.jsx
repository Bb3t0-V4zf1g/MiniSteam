import { useNavigate } from 'react-router-dom';
import { useWishlistStore, useCartStore, useAuthStore } from '../stores/store';
import { useEffect, useState } from 'react';
import { wishlistAPI, cartAPI } from '../services/api';
import './Wishlist.css';

export default function Wishlist() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const wishlistItems = useWishlistStore((state) => state.items);
  const setWishlistItems = useWishlistStore((state) => state.setItems);
  const removeWishlistItem = useWishlistStore((state) => state.removeItem);
  const cartItems = useCartStore((state) => state.items);
  const setCartItems = useCartStore((state) => state.setItems);
  const addToCart = useCartStore((state) => state.addItem);
  const removeFromCart = useCartStore((state) => state.removeItem);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar wishlist desde la API al montar
  useEffect(() => {
    const loadWishlistFromAPI = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('💖 Cargando wishlist desde API...');
        const response = await wishlistAPI.get();
        console.log('✅ Wishlist cargada:', response.data);
        setWishlistItems(response.data.items || []);
      } catch (error) {
        console.error('❌ Error cargando wishlist:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          // Token inválido, limpiar sesión
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlistFromAPI();
  }, [user]);

  const handleRemoveFromWishlist = async (gameId) => {
    try {
      console.log('💔 Eliminando de wishlist:', gameId);
      await wishlistAPI.remove(gameId);
      removeWishlistItem(gameId);
    } catch (error) {
      console.error('❌ Error eliminando de wishlist:', error);
      alert(error.response?.data?.error || 'Error al eliminar de la lista de deseos');
    }
  };

  const handleToggleCart = async (gameId, item, isInCart) => {
    try {
      if (isInCart) {
        console.log('🗑️ Eliminando del carrito:', gameId);
        await cartAPI.remove(gameId);
        removeFromCart(gameId);
      } else {
        console.log('🛒 Agregando al carrito:', gameId);
        const response = await cartAPI.add(gameId);
        if (response.data.items) {
          setCartItems(response.data.items);
        } else {
          addToCart(item);
        }
      }
    } catch (error) {
      console.error('❌ Error con carrito:', error);
      if (error.response?.status !== 409) {
        alert(error.response?.data?.error || 'Error al actualizar el carrito');
      }
    }
  };

  if (!user) {
    return (
      <div className="wishlist-container">
        <div className="empty-wishlist">
          <h2>Inicia sesión para ver tu lista de deseos</h2>
          <button onClick={() => navigate('/login')}>Ir a Login</button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="wishlist-container">
        <div className="empty-wishlist">
          <h2>Cargando lista de deseos...</h2>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-container">
        <div className="empty-wishlist">
          <h2>Tu lista de deseos está vacía</h2>
          <p>Guarda tus juegos favoritos para después</p>
          <button onClick={() => navigate('/')}>Explorar Juegos</button>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      <h1>❤️ Mi Lista de Deseos</h1>

      <div className="wishlist-grid">
        {wishlistItems
          .filter((item) => item && (item.id_juego || item.id))
          .map((item) => {
          const gameId = item.id_juego || item.id;
          const isInCart = cartItems.some((cartItem) => (cartItem.id_juego || cartItem.id) === gameId);
          const precio = parseFloat(item.precio) || 0;

          return (
            <div key={gameId} className="wishlist-card">
              <div className="card-image">
                <img
                  src={item.imagen_url || item.caratula_url || 'https://via.placeholder.com/200x280'}
                  alt={item.titulo || item.nombre}
                  onClick={() => navigate(`/game/${gameId}`)}
                />
                <button
                  className="remove-from-wishlist"
                  onClick={() => handleRemoveFromWishlist(gameId)}
                  title="Eliminar de lista de deseos"
                >
                  ❌
                </button>
              </div>
              <div className="card-info">
                <h3 onClick={() => navigate(`/game/${gameId}`)} style={{ cursor: 'pointer' }}>
                  {item.titulo || item.nombre}
                </h3>
                <p className="genre">{item.genero_nombre || item.genero || 'Sin género'}</p>
                <p className="price">${precio.toFixed(2)}</p>

                <button
                  className={`add-to-cart-btn ${isInCart ? 'in-cart' : ''}`}
                  onClick={() => handleToggleCart(gameId, item, isInCart)}
                >
                  {isInCart ? '✓ En Carrito' : 'Añadir al Carrito'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
