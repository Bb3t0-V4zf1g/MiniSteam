const purchaseRepository = require('../repositories/purchase.repository');
const cartRepository = require('../repositories/cart.repository');
const gameRepository = require('../repositories/game.repository');
const libraryRepository = require('../repositories/library.repository');

// Crear compra desde carrito
const createPurchase = async (req, res) => {
  try {
    const userId = req.user.id;
    const { metodo_pago, notas } = req.body;

    if (!metodo_pago) {
      return res.status(400).json({ error: 'Método de pago es requerido' });
    }

    // Obtener carrito
    const cart = await cartRepository.getCartByUser(userId);
    if (cart.items.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    // Crear compra
    const purchaseId = await purchaseRepository.create({
      id_usuario: userId,
      total: cart.total,
      metodo_pago,
      estado_pago: 'completado',
      notas: notas || null
    });

    // Crear detalles y agregar a biblioteca
    for (const item of cart.items) {
      await purchaseRepository.createDetail({
        id_compra: purchaseId,
        id_juego: item.id_juego,
        precio_pagado: item.precio,
        cantidad: 1
      });

      // Agregar a biblioteca
      await libraryRepository.addGame({
        id_usuario: userId,
        id_juego: item.id_juego,
        id_compra: purchaseId
      });
    }

    // Vaciar carrito
    await cartRepository.clearCart(userId);

    const purchase = await purchaseRepository.findById(purchaseId);

    res.status(201).json({
      message: 'Compra completada exitosamente',
      purchase
    });
  } catch (error) {
    console.error('Error en createPurchase:', error);
    res.status(500).json({ error: 'Error al crear compra' });
  }
};

// Obtener compras del usuario
const getUserPurchases = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const result = await purchaseRepository.findByUser(userId, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json(result);
  } catch (error) {
    console.error('Error en getUserPurchases:', error);
    res.status(500).json({ error: 'Error al obtener compras' });
  }
};

// Obtener compra por ID
const getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const purchaseId = parseInt(id);
    if (isNaN(purchaseId)) {
      return res.status(400).json({ error: 'ID de compra inválido' });
    }
    const userId = req.user.id;

    const purchase = await purchaseRepository.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({ error: 'Compra no encontrada' });
    }

    // Verificar que la compra pertenece al usuario (o es admin)
    if (purchase.id_usuario !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para ver esta compra' });
    }

    res.json(purchase);
  } catch (error) {
    console.error('Error en getPurchaseById:', error);
    res.status(500).json({ error: 'Error al obtener compra' });
  }
};

// Obtener todas las compras (solo admin)
const getAllPurchases = async (req, res) => {
  try {
    const { page = 1, limit = 10, estado_pago } = req.query;

    const result = await purchaseRepository.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      estado_pago
    });

    res.json(result);
  } catch (error) {
    console.error('Error en getAllPurchases:', error);
    res.status(500).json({ error: 'Error al obtener compras' });
  }
};

module.exports = {
  createPurchase,
  getUserPurchases,
  getPurchaseById,
  getAllPurchases
};