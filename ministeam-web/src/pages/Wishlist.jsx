import { useNavigate } from 'react-router-dom';
import { useWishlistStore, useCartStore, useAuthStore } from '../stores/store';
import './Wishlist.css';

export default function Wishlist() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const wishlistItems = useWishlistStore((state) => state.items);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const cartItems = useCartStore((state) => state.items);
  const addToCart = useCartStore((state) => state.addItem);
  const removeFromCart = useCartStore((state) => state.removeItem);

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
        {wishlistItems.map((item) => {
          const gameId = item.id_juego || item.id;
          const isInCart = cartItems.some((cartItem) => (cartItem.id_juego || cartItem.id) === gameId);

          return (
            <div key={gameId} className="wishlist-card">
              <div className="card-image">
                <img
                  src={item.caratula_url || 'https://via.placeholder.com/200x280'}
                  alt={item.nombre}
                  onClick={() => navigate(`/game/${gameId}`)}
                />
                <button
                  className="remove-from-wishlist"
                  onClick={() => removeItem(gameId)}
                  title="Eliminar de lista de deseos"
                >
                  ❌
                </button>
              </div>
              <div className="card-info">
                <h3 onClick={() => navigate(`/game/${gameId}`)} style={{ cursor: 'pointer' }}>
                  {item.nombre}
                </h3>
                <p className="genre">{item.genero || 'Sin género'}</p>
                <p className="price">${item.precio?.toFixed(2) || '0.00'}</p>

                <button
                  className={`add-to-cart-btn ${isInCart ? 'in-cart' : ''}`}
                  onClick={() => (isInCart ? removeFromCart(gameId) : addToCart(item))}
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
