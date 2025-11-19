const express = require('express');
const router = express.Router();
const {
  getGameReviews,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews
} = require('../controllers/reviews.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Rutas públicas
router.get('/game/:gameId', getGameReviews);

// Rutas protegidas
router.use(authenticateToken);
router.get('/admin/my-reviews', getUserReviews);
router.post('/admin', createReview);
router.put('/admin/:id', updateReview);
router.delete('/admin/:id', deleteReview);

module.exports = router;