const db = require('../config/database');

const cartRepository = {
  // Obtener carrito completo del usuario
  async getCartByUser(userId) {
    const query = `
      SELECT 
        c.id_carrito,
        c.id_juego,
        c.fecha_agregado,
        v.titulo,
        v.slug,
        v.precio,
        v.imagen_url,
        v.desarrollador,
        v.plataforma,
        g.nombre as genero
      FROM carrito c
      JOIN videojuegos v ON c.id_juego = v.id_juego
      LEFT JOIN genero_videojuego g ON v.id_genero = g.id_genero
      WHERE c.id_usuario = ? AND v.activo = true
      ORDER BY c.fecha_agregado DESC
    `;

    const [rows] = await db.execute(query, [userId]);

    // Calcular total
    const total = rows.reduce((sum, item) => sum + parseFloat(item.precio), 0);

    return {
      items: rows,
      total: parseFloat(total.toFixed(2))
    };
  },

  // Agregar item al carrito
  async addItem(userId, gameId) {
    const query = `
      INSERT INTO carrito (id_usuario, id_juego)
      VALUES (?, ?)
    `;

    const [result] = await db.execute(query, [userId, gameId]);
    return result.insertId;
  },

  // Verificar si un juego está en el carrito
  async isInCart(userId, gameId) {
    const query = `
      SELECT id_carrito
      FROM carrito
      WHERE id_usuario = ? AND id_juego = ?
    `;

    const [rows] = await db.execute(query, [userId, gameId]);
    return rows.length > 0;
  },

  // Eliminar item del carrito
  async removeItem(userId, gameId) {
    const query = `
      DELETE FROM carrito
      WHERE id_usuario = ? AND id_juego = ?
    `;

    const [result] = await db.execute(query, [userId, gameId]);
    return result.affectedRows > 0;
  },

  // Vaciar carrito del usuario
  async clearCart(userId) {
    const query = 'DELETE FROM carrito WHERE id_usuario = ?';
    const [result] = await db.execute(query, [userId]);
    return result.affectedRows;
  },

  // Obtener IDs de juegos en el carrito
  async getGameIds(userId) {
    const query = `
      SELECT id_juego
      FROM carrito
      WHERE id_usuario = ?
    `;

    const [rows] = await db.execute(query, [userId]);
    return rows.map(row => row.id_juego);
  },

  // Contar items en el carrito
  async countItems(userId) {
    const query = `
      SELECT COUNT(*) as count
      FROM carrito
      WHERE id_usuario = ?
    `;

    const [rows] = await db.execute(query, [userId]);
    return rows[0].count;
  }
};

module.exports = cartRepository;