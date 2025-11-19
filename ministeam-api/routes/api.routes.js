const express = require('express');
const router = express.Router();

// Importar todas las rutas
const usersRoutes = require('./users.routes');
const gamesRoutes = require('./games.routes');
const genresRoutes = require('./genres.routes');
const purchasesRoutes = require('./purchases.routes');
const libraryRoutes = require('./library.routes');
const reviewsRoutes = require('./reviews.routes');
const cartRoutes = require('./cart.routes');
const wishlistRoutes = require('./wishlist.routes');

// Montar las rutas
router.use('/users', usersRoutes);
router.use('/games', gamesRoutes);
router.use('/genres', genresRoutes);
router.use('/purchases', purchasesRoutes);
router.use('/library', libraryRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);

// Ruta base de la API
router.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a MiniSteam API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      games: '/api/games',
      genres: '/api/genres',
      purchases: '/api/purchases',
      library: '/api/library',
      reviews: '/api/reviews',
      cart: '/api/cart',
      wishlist: '/api/wishlist'
    }
  });
});

module.exports = router;