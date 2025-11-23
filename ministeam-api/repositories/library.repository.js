const db = require('../config/database');

const libraryRepository = {
  // Agregar juego a la biblioteca
  async addGame(data, connection = null) {
    const dbConn = connection || db;
    
    const { id_usuario, id_juego, id_compra } = data;
    
    const query = `
      INSERT INTO biblioteca_usuario (id_usuario, id_juego, id_compra)
      VALUES (?, ?, ?)
    `;
    
    const [result] = await dbConn.execute(query, [id_usuario, id_juego, id_compra]);
    return result.insertId;
  },

  // Obtener biblioteca del usuario
  async getUserLibrary(userId, filters = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        estado_actual,
        sort = 'fecha_adquirido',
        order = 'DESC'
      } = filters;

      const offset = (page - 1) * limit;
      const params = [userId];
      let whereClause = 'WHERE b.id_usuario = ?';

      if (estado_actual) {
        whereClause += ' AND b.estado_actual = ?';
        params.push(estado_actual);
      }

      const validSortColumns = ['fecha_adquirido', 'tiempo_jugado', 'titulo'];
      const sortColumn = validSortColumns.includes(sort) ? sort : 'fecha_adquirido';
      const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const query = `
        SELECT 
          b.id_biblioteca,
          b.id_juego,
          b.fecha_adquirido,
          b.estado_actual,
          b.tiempo_jugado,
          v.titulo,
          v.slug,
          v.imagen_url,
          v.desarrollador,
          v.plataforma,
          v.calificacion_promedio,
          g.nombre as genero_nombre,
          c.fecha_compra
        FROM biblioteca_usuario b
        JOIN videojuegos v ON b.id_juego = v.id_juego
        LEFT JOIN genero_videojuego g ON v.id_genero = g.id_genero
        LEFT JOIN compras c ON b.id_compra = c.id_compra
        ${whereClause}
        ORDER BY ${sortColumn === 'titulo' ? 'v.titulo' : 'b.' + sortColumn} ${sortOrder}
        LIMIT ${limit} OFFSET ${offset}
      `;

      console.log('📚 Query biblioteca:', query);
      console.log('📚 Params:', params);
      console.log('📚 userId:', userId);

      const [rows] = await db.execute(query, params);

      console.log('📚 Rows encontrados:', rows.length);

      // Contar total
      const countQuery = `
        SELECT COUNT(*) as total
        FROM biblioteca_usuario b
        ${whereClause}
      `;

      const countParams = params.slice(0, whereClause.includes('estado_actual') ? 2 : 1);
      const [countResult] = await db.execute(countQuery, countParams);

      return {
        juegos: rows,
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      };
    } catch (error) {
      console.error('❌ Error en getUserLibrary repository:', error);
      throw error;
    }
  },

  // Obtener detalles de un juego en la biblioteca
  async getGameDetails(userId, gameId) {
    const query = `
      SELECT 
        b.*,
        v.titulo,
        v.slug,
        v.descripcion,
        v.precio,
        v.imagen_url,
        v.trailer_url,
        v.fecha_lanzamiento,
        v.desarrollador,
        v.distribuidor,
        v.plataforma,
        v.clasificacion_edad,
        v.calificacion_promedio,
        g.nombre as genero_nombre,
        g.descripcion as genero_descripcion,
        c.fecha_compra,
        c.total as precio_pagado_compra
      FROM biblioteca_usuario b
      JOIN videojuegos v ON b.id_juego = v.id_juego
      LEFT JOIN genero_videojuego g ON v.id_genero = g.id_genero
      LEFT JOIN compras c ON b.id_compra = c.id_compra
      WHERE b.id_usuario = ? AND b.id_juego = ?
    `;

    const [rows] = await db.execute(query, [userId, gameId]);
    return rows[0] || null;
  },

  // Verificar si el usuario posee un juego
  async userOwnsGame(userId, gameId) {
    const query = `
      SELECT id_biblioteca
      FROM biblioteca_usuario
      WHERE id_usuario = ? AND id_juego = ?
    `;

    const [rows] = await db.execute(query, [userId, gameId]);
    return rows.length > 0;
  },

  // Actualizar estado del juego
  async updateGameStatus(userId, gameId, estado) {
    const query = `
      UPDATE biblioteca_usuario
      SET estado_actual = ?
      WHERE id_usuario = ? AND id_juego = ?
    `;

    const [result] = await db.execute(query, [estado, userId, gameId]);
    return result.affectedRows > 0;
  },

  // Agregar tiempo jugado
  async addPlaytime(userId, gameId, minutos) {
    const query = `
      UPDATE biblioteca_usuario
      SET tiempo_jugado = tiempo_jugado + ?
      WHERE id_usuario = ? AND id_juego = ?
    `;

    const [result] = await db.execute(query, [minutos, userId, gameId]);
    return result.affectedRows > 0;
  },

  // Obtener estadísticas de la biblioteca
  async getUserLibraryStats(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_juegos,
        SUM(tiempo_jugado) as tiempo_total_minutos,
        COUNT(CASE WHEN estado_actual = 'instalado' THEN 1 END) as juegos_instalados,
        COUNT(CASE WHEN estado_actual = 'no_descargado' THEN 1 END) as juegos_pendientes,
        AVG(v.calificacion_promedio) as calificacion_promedio_biblioteca
      FROM biblioteca_usuario b
      JOIN videojuegos v ON b.id_juego = v.id_juego
      WHERE b.id_usuario = ?
    `;

    const [rows] = await db.execute(query, [userId]);
    return rows[0];
  },

  // Obtener juegos recientemente agregados
  async getRecentlyAdded(userId, limit = 5) {
    const query = `
      SELECT 
        b.id_juego,
        b.fecha_adquirido,
        v.titulo,
        v.slug,
        v.imagen_url,
        v.desarrollador
      FROM biblioteca_usuario b
      JOIN videojuegos v ON b.id_juego = v.id_juego
      WHERE b.id_usuario = ?
      ORDER BY b.fecha_adquirido DESC
      LIMIT ?
    `;

    const [rows] = await db.execute(query, [userId, limit]);
    return rows;
  },

  // Obtener juegos más jugados
  async getMostPlayed(userId, limit = 5) {
    const query = `
      SELECT 
        b.id_juego,
        b.tiempo_jugado,
        v.titulo,
        v.slug,
        v.imagen_url,
        v.desarrollador
      FROM biblioteca_usuario b
      JOIN videojuegos v ON b.id_juego = v.id_juego
      WHERE b.id_usuario = ? AND b.tiempo_jugado > 0
      ORDER BY b.tiempo_jugado DESC
      LIMIT ?
    `;

    const [rows] = await db.execute(query, [userId, limit]);
    return rows;
  }
};

module.exports = libraryRepository;