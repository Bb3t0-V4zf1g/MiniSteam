const express = require('express');
const router = express.Router();
const {
  getUserLibrary,
  updateGameStatus,
  updatePlaytime,
  getGameDetails
} = require('../controllers/library.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

router.get('/', getUserLibrary);
router.get('/:gameId', getGameDetails);
router.patch('/:gameId/status', updateGameStatus);
router.patch('/:gameId/playtime', updatePlaytime);

module.exports = router;