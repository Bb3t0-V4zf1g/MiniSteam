const db = require('../config/database');

const reviewRepository = {
  async create(data) {
    const { id_usuario, id_juego, puntuacion, comentario, recomendado } = data;
    const query = `
      INSERT INTO resenas (id_usuario, id_juego, puntuacion, comentario, recomendado)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      id_usuario, id_juego, puntuacion, comentario, recomendado
    ]);
    return this.findById(result.insertId);
  },

  async findById(id) {
    const query = `
      SELECT r.*, u.nombre_usuario, v.titulo, v.slug
      FROM resenas r
      JOIN usuarios u ON r.id_usuario = u.id_usuario
      JOIN videojuegos v ON r.id_juego = v.id_juego
      WHERE r.id_resena = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
  },

  async findByGame(gameId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const pageInt = parseInt(page) || 1;
    const limitInt = parseInt(limit) || 10;
    const offset = (pageInt - 1) * limitInt;
    
    const query = `
      SELECT r.*, u.nombre_usuario
      FROM resenas r
      JOIN usuarios u ON r.id_usuario = u.id_usuario
      WHERE r.id_juego = ?
      ORDER BY r.fecha_resena DESC
      LIMIT ${limitInt} OFFSET ${offset}
    `;
    const [rows] = await db.execute(query, [gameId]);
    
    const countQuery = 'SELECT COUNT(*) as total FROM resenas WHERE id_juego = ?';
    const [countResult] = await db.execute(countQuery, [gameId]);
    
    return {
      reviews: rows,
      pagination: {
        page: pageInt,
        limit: limitInt,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limitInt)
      }
    };
  },

  async findByUser(userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const pageInt = parseInt(page) || 1;
    const limitInt = parseInt(limit) || 10;
    const offset = (pageInt - 1) * limitInt;
    
    const query = `
      SELECT r.*, v.titulo, v.slug, v.imagen_url
      FROM resenas r
      JOIN videojuegos v ON r.id_juego = v.id_juego
      WHERE r.id_usuario = ?
      ORDER BY r.fecha_resena DESC
      LIMIT ${limitInt} OFFSET ${offset}
    `;
    const [rows] = await db.execute(query, [userId]);
    
    const countQuery = 'SELECT COUNT(*) as total FROM resenas WHERE id_usuario = ?';
    const [countResult] = await db.execute(countQuery, [userId]);
    
    return {
      reviews: rows,
      pagination: {
        page: pageInt,
        limit: limitInt,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limitInt)
      }
    };
  },

  async userHasReview(userId, gameId) {
    const query = 'SELECT id_resena FROM resenas WHERE id_usuario = ? AND id_juego = ?';
    const [rows] = await db.execute(query, [userId, gameId]);
    return rows.length > 0;
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    
    if (data.puntuacion) {
      fields.push('puntuacion = ?');
      values.push(data.puntuacion);
    }
    if (data.comentario !== undefined) {
      fields.push('comentario = ?');
      values.push(data.comentario);
    }
    if (data.recomendado !== undefined) {
      fields.push('recomendado = ?');
      values.push(data.recomendado);
    }
    
    if (fields.length === 0) return null;
    
    values.push(id);
    const query = `UPDATE resenas SET ${fields.join(', ')} WHERE id_resena = ?`;
    const [result] = await db.execute(query, values);
    
    if (result.affectedRows === 0) return null;
    return this.findById(id);
  },

  async delete(id) {
    const query = 'DELETE FROM resenas WHERE id_resena = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }
};

module.exports = reviewRepository;