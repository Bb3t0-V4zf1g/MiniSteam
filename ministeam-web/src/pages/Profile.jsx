import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/store';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">
            {user.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-info">
            <h1>{user.username}</h1>
            <p className="email">{user.email}</p>
            <p className="role">
              {user.role === 'admin' ? '👑 Administrador' : '👤 Cliente'}
            </p>
          </div>
        </div>

        <div className="profile-details">
          <h2>Información Personal</h2>
          <div className="detail-group">
            <label>Nombre de Usuario:</label>
            <p>{user.username}</p>
          </div>
          <div className="detail-group">
            <label>Email:</label>
            <p>{user.email}</p>
          </div>
          {user.country && (
            <div className="detail-group">
              <label>País:</label>
              <p>{user.country}</p>
            </div>
          )}
          <div className="detail-group">
            <label>Rol:</label>
            <p>{user.role === 'admin' ? 'Administrador' : 'Cliente'}</p>
          </div>
        </div>

        <div className="profile-actions">
          <button className="edit-btn" disabled>
            ✏️ Editar Perfil (Próximamente)
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
