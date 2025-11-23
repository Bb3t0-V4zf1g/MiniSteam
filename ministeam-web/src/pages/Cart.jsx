import { useNavigate } from 'react-router-dom';
import { useCartStore, useAuthStore } from '../stores/store';
import { useEffect, useState } from 'react';
import { cartAPI, purchasesAPI } from '../services/api';
import './Cart.css';

export default function Cart() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const cartItems = useCartStore((state) => state.items);
  const setItems = useCartStore((state) => state.setItems);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Cargar carrito desde la API al montar
  useEffect(() => {
    const loadCartFromAPI = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('📦 Cargando carrito desde API...');
        const response = await cartAPI.get();
        console.log('✅ Carrito cargado:', response.data);
        setItems(response.data.items || []);
      } catch (error) {
        console.error('❌ Error cargando carrito:', error);
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

    loadCartFromAPI();
  }, [user]);

  const handleRemoveItem = async (gameId) => {
    try {
      console.log('🗑️ Eliminando del carrito:', gameId);
      await cartAPI.remove(gameId);
      removeItem(gameId);
    } catch (error) {
      console.error('❌ Error eliminando del carrito:', error);
      alert(error.response?.data?.error || 'Error al eliminar del carrito');
    }
  };

  const handleClearCart = async () => {
    if (!confirm('¿Estás seguro de vaciar el carrito?')) return;
    
    try {
      console.log('🗑️ Vaciando carrito...');
      await cartAPI.clear();
      clearCart();
    } catch (error) {
      console.error('❌ Error vaciando carrito:', error);
      alert(error.response?.data?.error || 'Error al vaciar el carrito');
    }
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      console.log('💳 Procesando compra...');
      const response = await purchasesAPI.create({
        metodo_pago: 'tarjeta',
        notas: 'Compra desde el carrito'
      });
      
      console.log('✅ Compra exitosa:', response.data);
      clearCart();
      alert('¡Compra realizada con éxito! Los juegos se agregaron a tu biblioteca.');
      navigate('/library');
    } catch (error) {
      console.error('❌ Error procesando compra:', error);
      alert(error.response?.data?.error || 'Error al procesar la compra');
    } finally {
      setIsProcessing(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="cart-container">
        <div className="empty-cart">
          <h2>Cargando carrito...</h2>
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
          {cartItems
            .filter((item) => item && (item.id_juego || item.id))
            .map((item) => {
              const precio = parseFloat(item.precio) || 0;
              const gameId = item.id_juego || item.id;
              const gameName = item.titulo || item.nombre || 'Sin nombre';
              const gameImage = item.imagen_url || item.caratula_url || 'https://via.placeholder.com/100x150';
              const gameGenre = item.genero_nombre || item.genero || 'Sin género';

              return (
                <div key={gameId} className="cart-item">
                  <img
                    src={gameImage}
                    alt={gameName}
                    className="item-image"
                  />
                  <div className="item-info">
                    <h3>{gameName}</h3>
                    <p className="item-genre">{gameGenre}</p>
                    <p className="item-price">${precio.toFixed(2)}</p>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveItem(gameId)}
                  >
                    ❌
                  </button>
                </div>
              );
            })}
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

          <button 
            className="checkout-btn"
            onClick={handleCheckout}
            disabled={isProcessing}
          >
            {isProcessing ? 'Procesando...' : 'Proceder al Pago'}
          </button>
          <button className="continue-shopping-btn" onClick={() => navigate('/')}>
            Continuar Comprando
          </button>
          <button 
            className="clear-cart-btn" 
            onClick={handleClearCart}
            disabled={isProcessing}
          >
            Vaciar Carrito
          </button>
        </div>
      </div>
    </div>
  );
}
