const gameRepository = require('../repositories/game.repository');

// Obtener todos los juegos con filtros y paginación
const getAllGames = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      plataforma,
      precio_min,
      precio_max,
      id_genero,
      activo = 'true',
      sort = 'fecha_agregado',
      order = 'DESC'
    } = req.query;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      plataforma,
      precio_min: precio_min ? parseFloat(precio_min) : undefined,
      precio_max: precio_max ? parseFloat(precio_max) : undefined,
      id_genero: id_genero ? parseInt(id_genero) : undefined,
      activo: activo === 'true' ? true : activo === 'false' ? false : undefined,
      sort,
      order
    };

    const result = await gameRepository.findAll(filters);
    res.json(result);
  } catch (error) {
    console.error('Error en getAllGames:', error);
    res.status(500).json({ error: 'Error al obtener videojuegos' });
  }
};

// Obtener juego por ID o slug
const getGameById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Intentar convertir a número
    const gameId = parseInt(id);
    let game;
    
    // Si es un número válido, buscar por ID
    if (!isNaN(gameId)) {
      game = await gameRepository.findById(gameId);
    } else {
      // Si no es un número, buscar por slug
      game = await gameRepository.findBySlug(id);
    }
    
    if (!game) {
      return res.status(404).json({ error: 'Videojuego no encontrado' });
    }

    res.json(game);
  } catch (error) {
    console.error('Error en getGameById:', error);
    res.status(500).json({ error: 'Error al obtener videojuego' });
  }
};

// Obtener juego por slug
const getGameBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const game = await gameRepository.findBySlug(slug);
    if (!game) {
      return res.status(404).json({ error: 'Videojuego no encontrado' });
    }

    res.json(game);
  } catch (error) {
    console.error('Error en getGameBySlug:', error);
    res.status(500).json({ error: 'Error al obtener videojuego' });
  }
};

// Crear nuevo juego
const createGame = async (req, res) => {
  try {
    const gameData = req.body;

    // Validaciones básicas
    if (!gameData.titulo || !gameData.slug) {
      return res.status(400).json({ 
        error: 'Título y slug son requeridos' 
      });
    }

    // Verificar si el slug ya existe
    const existing = await gameRepository.findBySlug(gameData.slug);
    if (existing) {
      return res.status(409).json({ 
        error: 'Ya existe un videojuego con ese slug' 
      });
    }

    // Validar precio
    if (gameData.precio && gameData.precio < 0) {
      return res.status(400).json({ 
        error: 'El precio no puede ser negativo' 
      });
    }

    const newGame = await gameRepository.create(gameData);
    
    res.status(201).json({
      message: 'Videojuego creado exitosamente',
      game: newGame
    });
  } catch (error) {
    console.error('Error en createGame:', error);
    res.status(500).json({ error: 'Error al crear videojuego' });
  }
};

// Actualizar juego
const updateGame = async (req, res) => {
  try {
    const { id } = req.params;
    const gameId = parseInt(id);
    if (isNaN(gameId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    const gameData = req.body;

    // Verificar que el juego existe
    const existing = await gameRepository.findById(gameId);
    if (!existing) {
      return res.status(404).json({ error: 'Videojuego no encontrado' });
    }

    // Si se actualiza el slug, verificar que no exista
    if (gameData.slug && gameData.slug !== existing.slug) {
      const slugExists = await gameRepository.findBySlug(gameData.slug);
      if (slugExists) {
        return res.status(409).json({ 
          error: 'Ya existe un videojuego con ese slug' 
        });
      }
    }

    // Validar precio
    if (gameData.precio !== undefined && gameData.precio < 0) {
      return res.status(400).json({ 
        error: 'El precio no puede ser negativo' 
      });
    }

    const updated = await gameRepository.update(gameId, gameData);
    
    res.json({
      message: 'Videojuego actualizado exitosamente',
      game: updated
    });
  } catch (error) {
    console.error('Error en updateGame:', error);
    res.status(500).json({ error: 'Error al actualizar videojuego' });
  }
};

// Eliminar juego (soft delete)
const deleteGame = async (req, res) => {
  try {
    const { id } = req.params;
    const gameId = parseInt(id);
    if (isNaN(gameId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const deleted = await gameRepository.softDelete(gameId);
    if (!deleted) {
      return res.status(404).json({ error: 'Videojuego no encontrado' });
    }

    res.json({ message: 'Videojuego eliminado exitosamente' });
  } catch (error) {
    console.error('Error en deleteGame:', error);
    res.status(500).json({ error: 'Error al eliminar videojuego' });
  }
};

// Buscar juegos
const searchGames = async (req, res) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ 
        error: 'Parámetro de búsqueda requerido' 
      });
    }

    const result = await gameRepository.search(q, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json(result);
  } catch (error) {
    console.error('Error en searchGames:', error);
    res.status(500).json({ error: 'Error al buscar videojuegos' });
  }
};

// Obtener juegos por género
const getGamesByGenre = async (req, res) => {
  try {
    const { genreId } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const result = await gameRepository.findByGenre(genreId, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json(result);
  } catch (error) {
    console.error('Error en getGamesByGenre:', error);
    res.status(500).json({ error: 'Error al obtener videojuegos por género' });
  }
};

// Obtener juegos mejor calificados
const getTopRatedGames = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const games = await gameRepository.findTopRated(parseInt(limit));
    res.json(games);
  } catch (error) {
    console.error('Error en getTopRatedGames:', error);
    res.status(500).json({ error: 'Error al obtener juegos mejor calificados' });
  }
};

// Obtener juegos destacados
const getFeaturedGames = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const games = await gameRepository.findFeatured(parseInt(limit));
    res.json(games);
  } catch (error) {
    console.error('Error en getFeaturedGames:', error);
    res.status(500).json({ error: 'Error al obtener juegos destacados' });
  }
};

module.exports = {
  getAllGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame,
  searchGames,
  getGamesByGenre,
  getTopRatedGames,
  getFeaturedGames
};