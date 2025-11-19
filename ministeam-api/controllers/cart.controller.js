const cartRepository = require('../repositories/cart.repository');
const gameRepository = require('../repositories/game.repository');
const libraryRepository = require('../repositories/library.repository');

// Obtener carrito del usuario
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const cart = await cartRepository.getCartByUser(userId);
    
    res.json({
      items: cart.items,
      total: cart.total,
      itemCount: cart.items.length
    });
  } catch (error) {
    console.error('Error en getCart:', error);
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
};

// Agregar juego al carrito
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id_juego } = req.body;

    const gameId = parseInt(id_juego);
    if (isNaN(gameId)) {
      return res.status(400).json({ 
        error: 'ID del juego es requerido y debe ser numérico' 
      });
    }

    if (!gameId) {
      return res.status(400).json({ 
        error: 'ID del juego es requerido' 
      });
    }

    // Verificar que el juego existe y está activo
    const game = await gameRepository.findById(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Videojuego no encontrado' });
    }

    if (!game.activo) {
      return res.status(400).json({ 
        error: 'Este videojuego no está disponible' 
      });
    }

    // Verificar que el usuario no posea ya el juego
    const ownsGame = await libraryRepository.userOwnsGame(userId, gameId);
    if (ownsGame) {
      return res.status(409).json({ 
        error: 'Ya posees este videojuego en tu biblioteca' 
      });
    }

    // Verificar si ya está en el carrito
    const inCart = await cartRepository.isInCart(userId, gameId);
    if (inCart) {
      return res.status(409).json({ 
        error: 'Este juego ya está en tu carrito' 
      });
    }

    // Agregar al carrito
    await cartRepository.addItem(userId, gameId);

    const cart = await cartRepository.getCartByUser(userId);

    res.status(201).json({
      message: 'Juego agregado al carrito',
      items: cart.items,
      total: cart.total,
      itemCount: cart.items.length
    });
  } catch (error) {
    console.error('Error en addToCart:', error);
    res.status(500).json({ error: 'Error al agregar al carrito' });
  }
};

// Eliminar juego del carrito
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId } = req.params;
    const gameIdInt = parseInt(gameId);
    if (isNaN(gameIdInt)) {
      return res.status(400).json({ error: 'ID de juego inválido' });
    }

    const removed = await cartRepository.removeItem(userId, gameIdInt);
    
    if (!removed) {
      return res.status(404).json({ 
        error: 'El juego no está en tu carrito' 
      });
    }

    const cart = await cartRepository.getCartByUser(userId);

    res.json({
      message: 'Juego eliminado del carrito',
      items: cart.items,
      total: cart.total,
      itemCount: cart.items.length
    });
  } catch (error) {
    console.error('Error en removeFromCart:', error);
    res.status(500).json({ error: 'Error al eliminar del carrito' });
  }
};

// Vaciar carrito
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    await cartRepository.clearCart(userId);

    res.json({
      message: 'Carrito vaciado exitosamente',
      items: [],
      total: 0,
      itemCount: 0
    });
  } catch (error) {
    console.error('Error en clearCart:', error);
    res.status(500).json({ error: 'Error al vaciar el carrito' });
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
};