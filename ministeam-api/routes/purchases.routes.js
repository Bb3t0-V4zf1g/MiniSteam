const express = require('express');
const router = express.Router();
const {
  createPurchase,
  getUserPurchases,
  getPurchaseById,
  getAllPurchases
} = require('../controllers/purchases.controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');

// Rutas protegidas
router.use(authenticateToken);

router.post('/', createPurchase);
router.get('/my-purchases', getUserPurchases);
router.get('/:id', getPurchaseById);

// Rutas de administrador
router.get('/admin', isAdmin, getAllPurchases);

module.exports = router;