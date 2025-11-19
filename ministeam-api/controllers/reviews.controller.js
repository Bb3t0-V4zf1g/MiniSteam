const reviewRepository = require('../repositories/review.repository');
const libraryRepository = require('../repositories/library.repository');

const getGameReviews = async (req, res) => {
  try {
    const { gameId } = req.params;
    const gameIdInt = parseInt(gameId);
    if (isNaN(gameIdInt)) {
      return res.status(400).json({ error: 'ID de juego inválido' });
    }

    const { page = 1, limit = 10 } = req.query;

    const result = await reviewRepository.findByGame(gameIdInt, {
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error en getGameReviews:', error);
    res.status(500).json({ error: 'Error al obtener reseñas' });
  }
};

const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    const result = await reviewRepository.findByUser(userId, {
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error en getUserReviews:', error);
    res.status(500).json({ error: 'Error al obtener reseñas' });
  }
};

const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id_juego, puntuacion, comentario, recomendado } = req.body;

    const gameIdInt = parseInt(id_juego);
    if (isNaN(gameIdInt) || !puntuacion) {
      return res.status(400).json({ 
        error: 'ID del juego y puntuación son requeridos' 
      });
    }
    
    const puntuacionNum = parseFloat(puntuacion);
    if (isNaN(puntuacionNum) || puntuacionNum < 1 || puntuacionNum > 10) {
      return res.status(400).json({ 
        error: 'La puntuación debe estar entre 1 y 10' 
      });
    }
    
    // Verificar que el usuario posee el juego
    const ownsGame = await libraryRepository.userOwnsGame(userId, gameIdInt);
    if (!ownsGame) {
      return res.status(403).json({ 
        error: 'Debes poseer el juego para dejar una reseña' 
      });
    }
    
    // Verificar si ya tiene una reseña
    const hasReview = await reviewRepository.userHasReview(userId, gameIdInt);
    if (hasReview) {
      return res.status(409).json({ 
        error: 'Ya has dejado una reseña para este juego' 
      });
    }
    
    const newReview = await reviewRepository.create({
      id_usuario: userId,
      id_juego: gameIdInt,
      puntuacion: puntuacionNum,
      comentario: comentario || null,
      recomendado: recomendado !== undefined ? recomendado : true
    });
    
    res.status(201).json({
      message: 'Reseña creada exitosamente',
      review: newReview
    });
  } catch (error) {
    console.error('Error en createReview:', error);
    res.status(500).json({ error: 'Error al crear reseña' });
  }
};

const updateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const reviewId = parseInt(id);
    if (isNaN(reviewId)) {
      return res.status(400).json({ error: 'ID de reseña inválido' });
    }
    const { puntuacion, comentario, recomendado } = req.body;
    
    // Verificar propiedad
    const review = await reviewRepository.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Reseña no encontrada' });
    }
    
    if (review.id_usuario !== userId) {
      return res.status(403).json({ 
        error: 'No tienes permiso para editar esta reseña' 
      });
    }
    
    if (puntuacion && (puntuacion < 1 || puntuacion > 10)) {
      return res.status(400).json({ 
        error: 'La puntuación debe estar entre 1 y 10' 
      });
    }
    
    const updated = await reviewRepository.update(reviewId, {
      puntuacion,
      comentario,
      recomendado
    });
    
    res.json({
      message: 'Reseña actualizada exitosamente',
      review: updated
    });
  } catch (error) {
    console.error('Error en updateReview:', error);
    res.status(500).json({ error: 'Error al actualizar reseña' });
  }
};

const deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const reviewId = parseInt(id);
    if (isNaN(reviewId)) {
      return res.status(400).json({ error: 'ID de reseña inválido' });
    }
    
    const review = await reviewRepository.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Reseña no encontrada' });
    }
    
    if (review.id_usuario !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'No tienes permiso para eliminar esta reseña' 
      });
    }
    
    await reviewRepository.delete(reviewId);
    
    res.json({ message: 'Reseña eliminada exitosamente' });
  } catch (error) {
    console.error('Error en deleteReview:', error);
    res.status(500).json({ error: 'Error al eliminar reseña' });
  }
};

module.exports = {
  getGameReviews,
  getUserReviews,
  createReview,
  updateReview,
  deleteReview
};