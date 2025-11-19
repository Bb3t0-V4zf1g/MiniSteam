import { useNavigate } from 'react-router-dom';
import { useCartStore, useAuthStore } from '../stores/store';
import './Cart.css';

export default function Cart() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const cartItems = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  if (!user) {
    return (
      <div className="cart-container">
        <div className="empty-cart">
          <h2>Inicia sesión para ver tu carrito</h2>
          <button onClick={() => navigate('/login')}>Ir a Login</button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="empty-cart">
          <h2>Tu carrito está vacío</h2>
          <p>Explora nuestros juegos y añade algunos a tu carrito</p>
          <button onClick={() => navigate('/')}>Volver a la tienda</button>
        </div>
      </div>
    );
  }

  const total = getTotalPrice();

  return (
    <div className="cart-container">
      <h1>🛒 Mi Carrito</h1>

      <div className="cart-content">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.id_juego || item.id} className="cart-item">
              <img
                src={item.caratula_url || 'https://via.placeholder.com/100x150'}
                alt={item.nombre}
                className="item-image"
              />
              <div className="item-info">
                <h3>{item.nombre}</h3>
                <p className="item-genre">{item.genero || 'Sin género'}</p>
                <p className="item-price">${item.precio?.toFixed(2) || '0.00'}</p>
              </div>
              <button
                className="remove-btn"
                onClick={() => removeItem(item.id_juego || item.id)}
              >
                ❌
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Resumen del Carrito</h2>
          <div className="summary-item">
            <span>Subtotal:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span>Impuestos:</span>
            <span>${(total * 0.16).toFixed(2)}</span>
          </div>
          <div className="summary-item total">
            <span>Total:</span>
            <span>${(total * 1.16).toFixed(2)}</span>
          </div>

          <button className="checkout-btn">Proceder al Pago</button>
          <button className="continue-shopping-btn" onClick={() => navigate('/')}>
            Continuar Comprando
          </button>
          <button className="clear-cart-btn" onClick={clearCart}>
            Vaciar Carrito
          </button>
        </div>
      </div>
    </div>
  );
}
