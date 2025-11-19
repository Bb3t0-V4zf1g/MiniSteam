const express = require('express');
const router = express.Router();
const {
    getAllGenres,
    getGenreById,
    createGenre,
    updateGenre,
    deleteGenre,
} = require('../controllers/genres.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Rutas públicas
router.get('/:id', getGenreById);
router.get('/', getAllGenres);

// Rutas protegidas
router.use(authenticateToken);
router.post('/admin', createGenre);
router.put('/admin/:id', updateGenre);
router.delete('/admin/:id', deleteGenre);

module.exports = router;