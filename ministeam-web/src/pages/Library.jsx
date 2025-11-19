import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { libraryAPI } from '../services/api';
import { useAuthStore } from '../stores/store';
import './Library.css';

export default function Library() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadLibrary();
  }, [user, navigate]);

  const loadLibrary = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await libraryAPI.getAll();
      const juegos = response.data.juegos || response.data || [];
      setGames(Array.isArray(juegos) ? juegos : []);
    } catch (err) {
      setError('Error al cargar tu biblioteca. Por favor intenta más tarde.');
      console.error('Library error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  if (loading) return <div className="loading">Cargando tu biblioteca...</div>;

  return (
    <div className="library-container">
      <h1>📚 Mi Biblioteca</h1>

      {error && <div className="error-message">{error}</div>}

      {games.length === 0 ? (
        <div className="empty-library">
          <p>Aún no has comprado ningún juego</p>
          <button onClick={() => navigate('/')}>Explorar Juegos</button>
        </div>
      ) : (
        <div className="library-grid">
          {games.map((game) => (
            <div
              key={game.id_juego || game.id}
              className="library-card"
              onClick={() => navigate(`/game/${game.id_juego || game.id}`)}
            >
              <img
                src={game.caratula_url || 'https://via.placeholder.com/200x280'}
                alt={game.nombre}
              />
              <div className="card-overlay">
                <button className="play-btn">▶️ Jugar</button>
              </div>
              <div className="card-info">
                <h3>{game.nombre}</h3>
                <p className="genre">{game.genero || 'Sin género'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
