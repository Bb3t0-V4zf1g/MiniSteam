const db = require('../config/database');

const wishlistRepository = {
  async getWishlist(userId) {
    const query = `
      SELECT 
        l.id_lista, l.fecha_agregado,
        v.id_juego, v.titulo, v.slug, v.precio, v.imagen_url,
        v.desarrollador, v.plataforma, v.calificacion_promedio,
        g.nombre as genero
      FROM lista_deseos l
      JOIN videojuegos v ON l.id_juego = v.id_juego
      LEFT JOIN genero_videojuego g ON v.id_genero = g.id_genero
      WHERE l.id_usuario = ? AND v.activo = true
      ORDER BY l.fecha_agregado DESC
    `;
    const [rows] = await db.execute(query, [userId]);
    return rows;
  },

  async addItem(userId, gameId) {
    const query = 'INSERT INTO lista_deseos (id_usuario, id_juego) VALUES (?, ?)';
    const [result] = await db.execute(query, [userId, gameId]);
    return result.insertId;
  },

  async isInWishlist(userId, gameId) {
    const query = 'SELECT id_lista FROM lista_deseos WHERE id_usuario = ? AND id_juego = ?';
    const [rows] = await db.execute(query, [userId, gameId]);
    return rows.length > 0;
  },

  async removeItem(userId, gameId) {
    const query = 'DELETE FROM lista_deseos WHERE id_usuario = ? AND id_juego = ?';
    const [result] = await db.execute(query, [userId, gameId]);
    return result.affectedRows > 0;
  }
};

module.exports = wishlistRepository;