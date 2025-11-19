const wishlistRepository = require('../repositories/wishlist.repository');
const gameRepository = require('../repositories/game.repository');
const libraryRepository = require('../repositories/library.repository');

const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlist = await wishlistRepository.getWishlist(userId);
    res.json({ items: wishlist, count: wishlist.length });
  } catch (error) {
    console.error('Error en getWishlist:', error);
    res.status(500).json({ error: 'Error al obtener lista de deseos' });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id_juego } = req.body;
    
    const gameId = parseInt(id_juego);
    if (isNaN(gameId)) {
      return res.status(400).json({ error: 'ID del juego es requerido' });
    }
    
    const game = await gameRepository.findById(gameId);
    if (!game || !game.activo) {
      return res.status(404).json({ error: 'Videojuego no encontrado' });
    }
    
    const ownsGame = await libraryRepository.userOwnsGame(userId, gameId);
    if (ownsGame) {
      return res.status(409).json({ error: 'Ya posees este videojuego' });
    }
    
    const inWishlist = await wishlistRepository.isInWishlist(userId, gameId);
    if (inWishlist) {
      return res.status(409).json({ error: 'Ya está en tu lista de deseos' });
    }
    
    await wishlistRepository.addItem(userId, gameId);
    const wishlist = await wishlistRepository.getWishlist(userId);
    
    res.status(201).json({
      message: 'Agregado a lista de deseos',
      items: wishlist,
      count: wishlist.length
    });
  } catch (error) {
    console.error('Error en addToWishlist:', error);
    res.status(500).json({ error: 'Error al agregar a lista de deseos' });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId } = req.params;
    const gameIdInt = parseInt(gameId);
    if (isNaN(gameIdInt)) {
      return res.status(400).json({ error: 'ID de juego inválido' });
    }

    const removed = await wishlistRepository.removeItem(userId, gameIdInt);
    if (!removed) {
      return res.status(404).json({ error: 'No está en tu lista de deseos' });
    }
    
    const wishlist = await wishlistRepository.getWishlist(userId);
    res.json({
      message: 'Eliminado de lista de deseos',
      items: wishlist,
      count: wishlist.length
    });
  } catch (error) {
    console.error('Error en removeFromWishlist:', error);
    res.status(500).json({ error: 'Error al eliminar de lista de deseos' });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };