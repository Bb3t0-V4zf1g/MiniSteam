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
  const [downloadingGames, setDownloadingGames] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadLibrary();
  }, [user]);

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

  const generateProductKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segments = 4;
    const segmentLength = 4;
    
    const key = [];
    for (let i = 0; i < segments; i++) {
      let segment = '';
      for (let j = 0; j < segmentLength; j++) {
        segment += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      key.push(segment);
    }
    
    return key.join('-');
  };

  const downloadGame = (gameName, gameId) => {
    const productKey = generateProductKey();
    const content = `MiniSteam - Clave del Producto\n\n` +
                   `Juego: ${gameName}\n` +
                   `ID: ${gameId}\n\n` +
                   `Clave de Producto:\n${productKey}\n\n` +
                   `Guarda esta clave en un lugar seguro.\n` +
                   `Necesitarás esta clave para activar el juego.\n`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${gameName.replace(/[^a-z0-9]/gi, '_')}_ProductKey.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePlayGame = (e, game) => {
    e.stopPropagation();
    const gameId = game.id_juego || game.id;
    const gameName = game.titulo || game.nombre;

    // Si ya está "descargado", descargar la clave
    if (downloadingGames[gameId] === 100) {
      downloadGame(gameName, gameId);
      return;
    }

    // Iniciar "descarga"
    setDownloadingGames(prev => ({ ...prev, [gameId]: 0 }));

    const interval = setInterval(() => {
      setDownloadingGames(prev => {
        const currentProgress = prev[gameId] || 0;
        if (currentProgress >= 100) {
          clearInterval(interval);
          return { ...prev, [gameId]: 100 };
        }
        return { ...prev, [gameId]: currentProgress + 10 };
      });
    }, 300);
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
          {games.map((game) => {
            const gameId = game.id_juego || game.id;
            const gameName = game.titulo || game.nombre || 'Sin título';
            const gameImage = game.imagen_url || game.caratula_url || 'https://via.placeholder.com/200x280';
            const gameGenre = game.genero_nombre || game.genero || 'Sin género';
            const downloadProgress = downloadingGames[gameId] || 0;
            const isDownloaded = downloadProgress === 100;
            const isDownloading = downloadProgress > 0 && downloadProgress < 100;
            
            return (
              <div
                key={gameId}
                className="library-card"
              >
                <img
                  src={gameImage}
                  alt={gameName}
                  onClick={() => navigate(`/game/${gameId}`)}
                  style={{ cursor: 'pointer' }}
                />
                <div className="card-overlay">
                  {isDownloading ? (
                    <div className="download-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${downloadProgress}%` }}
                        />
                      </div>
                      <span className="progress-text">Descargando... {downloadProgress}%</span>
                    </div>
                  ) : (
                    <button 
                      className="play-btn"
                      onClick={(e) => handlePlayGame(e, game)}
                    >
                      {isDownloaded ? '▶️ Jugar' : '⬇️ Descargar'}
                    </button>
                  )}
                </div>
                <div className="card-info">
                  <h3>{gameName}</h3>
                  <p className="genre">{gameGenre}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
