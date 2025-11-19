const express = require('express');
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist
} = require('../controllers/wishlist.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

router.use(authenticateToken);
router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/:gameId', removeFromWishlist);

module.exports = router;