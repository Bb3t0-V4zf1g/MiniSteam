const express = require('express');
const router = express.Router();
const {
  getAllGames,
  getGameById,
  getGameBySlug,
  createGame,
  updateGame,
  deleteGame,
  searchGames,
  getGamesByGenre,
  getTopRatedGames,
  getFeaturedGames
} = require('../controllers/games.controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');

// Rutas públicas
router.get('/', getAllGames);
router.get('/search', searchGames);
router.get('/top-rated', getTopRatedGames);
router.get('/featured', getFeaturedGames);
router.get('/genre/:genreId', getGamesByGenre);
router.get('/id/:id', getGameById);
router.get('/:slug', getGameBySlug);

// Rutas de administrador
router.post('/admin', authenticateToken, isAdmin, createGame);
router.put('/admin/:id', authenticateToken, isAdmin, updateGame);
router.delete('/admin/:id', authenticateToken, isAdmin, deleteGame);

module.exports = router;