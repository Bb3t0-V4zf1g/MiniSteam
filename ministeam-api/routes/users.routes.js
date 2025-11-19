const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserProfile,
  getUserStats
} = require('../controllers/users.controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');

// Rutas públicas
router.post('/signup', signup);
router.post('/login', login);

// Rutas protegidas (requieren autenticación)
router.get('/profile', authenticateToken, getUserProfile);
router.get('/stats/:id', authenticateToken, getUserStats);
router.put('/:id', authenticateToken, updateUser);
router.delete('/:id', authenticateToken, deleteUser);

// Rutas de administrador
router.get('/admin', authenticateToken, isAdmin, getAllUsers);
router.get('/admin/:id', authenticateToken, isAdmin, getUserById);

module.exports = router;