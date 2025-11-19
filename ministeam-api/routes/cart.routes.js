const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
} = require('../controllers/cart.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

router.get('/', getCart);
router.post('/', addToCart);
router.delete('/:gameId', removeFromCart);
router.delete('/', clearCart);

module.exports = router;