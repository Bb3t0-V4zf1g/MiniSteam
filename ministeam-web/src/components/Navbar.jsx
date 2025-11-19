import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useCartStore } from '../stores/store';
import './Navbar.css';

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const cartItems = useCartStore((state) => state.items);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🎮 MiniSteam
        </Link>

        <ul className="nav-menu">
          <li>
            <Link to="/">Inicio</Link>
          </li>
          <li>
            <Link to="/search">🔍 Buscar</Link>
          </li>

          {user ? (
            <>
              <li>
                <Link to="/wishlist">
                  ❤️ Lista de Deseos
                </Link>
              </li>
              <li>
                <Link to="/library">
                  📚 Mi Biblioteca
                </Link>
              </li>
              <li>
                <Link to="/cart" className="cart-link">
                  🛒 Carrito ({cartItems.length})
                </Link>
              </li>
              <li className="user-dropdown">
                <span>{user.username || user.nombre}</span>
                <div className="dropdown-menu">
                  <Link to="/profile">Perfil</Link>
                  <button onClick={handleLogout} className="logout-btn">
                    Cerrar Sesión
                  </button>
                </div>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="auth-link">
                  Iniciar Sesión
                </Link>
              </li>
              <li>
                <Link to="/register" className="auth-link-primary">
                  Registrarse
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
