import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useCartStore, useWishlistStore } from '../stores/store';
import { useState, useEffect } from 'react';
import { cartAPI, wishlistAPI } from '../services/api';
import { FaShoppingCart, FaHeart, FaUser, FaSignOutAlt, FaUserCircle, FaBook, FaHome, FaSearch } from 'react-icons/fa';
import './Navbar.css';

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const cartItems = useCartStore((state) => state.items || []);
  const setCartItems = useCartStore((state) => state.setItems);
  const wishlistItems = useWishlistStore((state) => state.items || []);
  const setWishlistItems = useWishlistStore((state) => state.setItems);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Cargar carrito y wishlist al montar o cuando cambia el usuario
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        setCartItems([]);
        setWishlistItems([]);
        return;
      }

      try {
        // Cargar carrito
        const cartResponse = await cartAPI.get();
        setCartItems(cartResponse.data.items || []);
      } catch (error) {
        console.error('Error cargando carrito en navbar:', error);
      }

      try {
        // Cargar wishlist
        const wishlistResponse = await wishlistAPI.get();
        setWishlistItems(wishlistResponse.data.items || []);
      } catch (error) {
        console.error('Error cargando wishlist en navbar:', error);
      }
    };

    loadUserData();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  // Obtener nombre de usuario de forma segura
  const displayName = user?.username || user?.nombre_usuario || user?.nombre || 'Usuario';

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownOpen && !e.target.closest('.user-dropdown')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="steam-logo">
            <span className="logo-text">MINISTEAM</span>
          </div>
        </Link>

        <ul className="nav-menu">
          <li>
            <Link to="/" className="nav-link">
              <FaHome className="nav-icon" />
              <span>Tienda</span>
            </Link>
          </li>
          <li>
            <Link to="/search" className="nav-link">
              <FaSearch className="nav-icon" />
              <span>Buscar</span>
            </Link>
          </li>

          {user ? (
            <>
              <li>
                <Link to="/library" className="nav-link">
                  <FaBook className="nav-icon" />
                  <span>Biblioteca</span>
                </Link>
              </li>
            </>
          ) : null}
        </ul>

        <div className="nav-actions">
          {user ? (
            <>
              <Link to="/wishlist" className="nav-action-btn">
                <FaHeart />
                {wishlistItems.length > 0 && <span className="badge">{wishlistItems.length}</span>}
              </Link>
              <Link to="/cart" className="nav-action-btn cart-btn">
                <FaShoppingCart />
                {cartItems.length > 0 && <span className="badge">{cartItems.length}</span>}
              </Link>
              <div className="user-dropdown">
                <button onClick={toggleDropdown} className="user-btn">
                  <FaUserCircle className="user-icon" />
                  <span>{displayName}</span>
                </button>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <Link to="/profile" onClick={() => setDropdownOpen(false)} className="dropdown-item">
                      <FaUser /> Perfil
                    </Link>
                    <button onClick={handleLogout} className="dropdown-item logout">
                      <FaSignOutAlt /> Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="btn-register">
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
