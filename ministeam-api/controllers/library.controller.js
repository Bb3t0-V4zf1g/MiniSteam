const libraryRepository = require('../repositories/library.repository');

// Obtener biblioteca del usuario
const getUserLibrary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, estado_actual, sort = 'fecha_adquirido', order = 'DESC' } = req.query;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      estado_actual,
      sort,
      order
    };

    const result = await libraryRepository.getUserLibrary(userId, filters);
    
    res.json(result);
  } catch (error) {
    console.error('Error en getUserLibrary:', error);
    res.status(500).json({ error: 'Error al obtener biblioteca' });
  }
};

// Obtener detalles de un juego en la biblioteca
const getGameDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId } = req.params;
    const gameIdInt = parseInt(gameId);
    if (isNaN(gameIdInt)) {
      return res.status(400).json({ error: 'ID de juego inválido' });
    }

    const game = await libraryRepository.getGameDetails(userId, gameIdInt);
    
    if (!game) {
      return res.status(404).json({ 
        error: 'Juego no encontrado en tu biblioteca' 
      });
    }

    res.json(game);
  } catch (error) {
    console.error('Error en getGameDetails:', error);
    res.status(500).json({ error: 'Error al obtener detalles del juego' });
  }
};

// Actualizar estado de descarga/instalación
const updateGameStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId } = req.params;
    const gameIdInt = parseInt(gameId);
    if (isNaN(gameIdInt)) {
      return res.status(400).json({ error: 'ID de juego inválido' });
    }
    const { estado_actual } = req.body;

    // Validar estado
    const validStatuses = ['instalando', 'instalado', 'no_iniciado', 'actualizando'];
    if (!estado_actual || !validStatuses.includes(estado_actual)) {
      return res.status(400).json({ 
        error: 'Estado inválido. Valores permitidos: ' + validStatuses.join(', ')
      });
    }

    // Verificar que el usuario posee el juego
    const ownsGame = await libraryRepository.userOwnsGame(userId, gameIdInt);
    if (!ownsGame) {
      return res.status(404).json({ 
        error: 'Juego no encontrado en tu biblioteca' 
      });
    }

    // Actualizar estado
    const updated = await libraryRepository.updateGameStatus(userId, gameIdInt, estado_actual);
    
    if (!updated) {
      return res.status(500).json({ 
        error: 'Error al actualizar estado' 
      });
    }

    const game = await libraryRepository.getGameDetails(userId, gameIdInt);

    res.json({
      message: 'Estado actualizado exitosamente',
      game
    });
  } catch (error) {
    console.error('Error en updateGameStatus:', error);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
};

// Actualizar tiempo jugado
const updatePlaytime = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId } = req.params;
    const gameIdInt = parseInt(gameId);
    if (isNaN(gameIdInt)) {
      return res.status(400).json({ error: 'ID de juego inválido' });
    }
    const { minutos } = req.body;

    if (!minutos || minutos < 0) {
      return res.status(400).json({ 
        error: 'Minutos debe ser un número positivo' 
      });
    }

    // Verificar que el usuario posee el juego
    const ownsGame = await libraryRepository.userOwnsGame(userId, gameIdInt);
    if (!ownsGame) {
      return res.status(404).json({ 
        error: 'Juego no encontrado en tu biblioteca' 
      });
    }

    // Actualizar tiempo jugado
    const updated = await libraryRepository.addPlaytime(userId, gameIdInt, parseInt(minutos));
    
    if (!updated) {
      return res.status(500).json({ 
        error: 'Error al actualizar tiempo jugado' 
      });
    }

    const game = await libraryRepository.getGameDetails(userId, gameIdInt);

    res.json({
      message: 'Tiempo jugado actualizado',
      game
    });
  } catch (error) {
    console.error('Error en updatePlaytime:', error);
    res.status(500).json({ error: 'Error al actualizar tiempo jugado' });
  }
};

module.exports = {
  getUserLibrary,
  getGameDetails,
  updateGameStatus,
  updatePlaytime
};