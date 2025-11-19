const db = require('../config/database');

const gameRepository = {
  // Crear videojuego
  async create(gameData) {
    const {
      slug, titulo, descripcion, precio = 0.00, stock = 999,
      fecha_lanzamiento, desarrollador, distribuidor, id_genero,
      plataforma = 'PC', clasificacion_edad, steam_app_id, igdb_id,
      imagen_url, trailer_url, activo = true
    } = gameData;

    const query = `
      INSERT INTO videojuegos (
        slug, titulo, descripcion, precio, stock,
        fecha_lanzamiento, desarrollador, distribuidor, id_genero,
        plataforma, clasificacion_edad, steam_app_id, igdb_id,
        imagen_url, trailer_url, activo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, [
      slug, titulo, descripcion, precio, stock,
      fecha_lanzamiento, desarrollador, distribuidor, id_genero,
      plataforma, clasificacion_edad, steam_app_id, igdb_id,
      imagen_url, trailer_url, activo
    ]);

    return this.findById(result.insertId);
  },

  // Buscar videojuego por ID con información completa
  async findById(id) {
    const query = `
      SELECT 
        v.*,
        g.nombre as genero_nombre,
        g.descripcion as genero_descripcion,
        (SELECT COUNT(*) FROM reseñas WHERE id_juego = v.id_juego) as total_reseñas
      FROM videojuegos v
      LEFT JOIN genero_videojuego g ON v.id_genero = g.id_genero
      WHERE v.id_juego = ?
    `;

    const [rows] = await db.execute(query, [id]);
    
    if (rows.length === 0) return null;
    
    // Obtener requisitos
    const requisitos = await this.getRequirements(id);
    
    return {
      ...rows[0],
      requisitos
    };
  },

  // Buscar videojuego por slug
  async findBySlug(slug) {
    const query = `
      SELECT 
        v.*,
        g.nombre as genero_nombre,
        g.descripcion as genero_descripcion,
        (SELECT COUNT(*) FROM reseñas WHERE id_juego = v.id_juego) as total_reseñas
      FROM videojuegos v
      LEFT JOIN genero_videojuego g ON v.id_genero = g.id_genero
      WHERE v.slug = ?
    `;

    const [rows] = await db.execute(query, [slug]);
    
    if (rows.length === 0) return null;
    
    // Obtener requisitos
    const requisitos = await this.getRequirements(rows[0].id_juego);
    
    return {
      ...rows[0],
      requisitos
    };
  },

  // Obtener requisitos de un juego
  async getRequirements(gameId) {
    const query = `
      SELECT * FROM requisitos
      WHERE id_juego = ?
      ORDER BY tipo
    `;

    const [rows] = await db.execute(query, [gameId]);
    
    return {
      minimos: rows.find(r => r.tipo === 'Minimo') || null,
      recomendados: rows.find(r => r.tipo === 'Recomendado') || null
    };
  },

  // Obtener todos los videojuegos con filtros
  async findAll(filters = {}) {
    const {
      page = 1,
      limit = 12,
      plataforma,
      precio_min,
      precio_max,
      activo = true,
      sort = 'fecha_agregado',
      order = 'DESC'
    } = filters;

    const pageInt = parseInt(page) || 1;
    const limitInt = parseInt(limit) || 12;
    const offset = (pageInt - 1) * limitInt;
    const params = [];
    let whereConditions = [];

    // Construir condiciones WHERE
    if (activo !== undefined) {
      // Asegurarnos de pasar 1/0 en lugar de booleanos para evitar problemas con tipos en MySQL
      whereConditions.push('v.activo = ?');
      params.push(activo ? 1 : 0);
    }

    if (plataforma) {
      whereConditions.push('v.plataforma = ?');
      params.push(plataforma);
    }

    if (precio_min !== undefined) {
      whereConditions.push('v.precio >= ?');
      params.push(precio_min);
    }

    if (precio_max !== undefined) {
      whereConditions.push('v.precio <= ?');
      params.push(precio_max);
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    // Validar columna de ordenamiento
    const validSortColumns = [
      'fecha_agregado', 'titulo', 'precio', 'calificacion_promedio', 'fecha_lanzamiento'
    ];
    const sortColumn = validSortColumns.includes(sort) ? sort : 'fecha_agregado';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const query = `
      SELECT 
        v.id_juego, v.slug, v.titulo, v.descripcion, v.precio,
        v.imagen_url, v.trailer_url, v.fecha_lanzamiento,
        v.desarrollador, v.plataforma, v.calificacion_promedio,
        v.clasificacion_edad, v.stock, v.activo,
        g.nombre as genero_nombre,
        (SELECT COUNT(*) FROM reseñas WHERE id_juego = v.id_juego) as total_reseñas
      FROM videojuegos v
      LEFT JOIN genero_videojuego g ON v.id_genero = g.id_genero
      ${whereClause}
      ORDER BY v.${sortColumn} ${sortOrder}
      LIMIT ${limitInt} OFFSET ${offset}
    `;

    // Ejecutar consulta principal (limit/offset ya interpolados de forma segura como enteros)
    const [rows] = await db.execute(query, params);

    // Contar total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM videojuegos v
      ${whereClause}
    `;

    // Para el count usamos los mismos parámetros de filtro (antes de LIMIT/OFFSET)
    const [countResult] = await db.execute(countQuery, params);

    return {
      games: rows,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    };
  },

  // Buscar videojuegos
  async search(searchTerm, options = {}) {
    const { page = 1, limit = 12 } = options;
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        v.id_juego, v.slug, v.titulo, v.descripcion, v.precio,
        v.imagen_url, v.fecha_lanzamiento, v.desarrollador,
        v.plataforma, v.calificacion_promedio,
        g.nombre as genero_nombre
      FROM videojuegos v
      LEFT JOIN genero_videojuego g ON v.id_genero = g.id_genero
      WHERE v.activo = true
        AND (
          v.titulo LIKE ? OR
          v.descripcion LIKE ? OR
          v.desarrollador LIKE ? OR
          g.nombre LIKE ?
        )
      ORDER BY v.calificacion_promedio DESC, v.titulo ASC
      LIMIT ? OFFSET ?
    `;

    const searchPattern = `%${searchTerm}%`;
    const [rows] = await db.execute(query, [
      searchPattern, searchPattern, searchPattern, searchPattern,
      limit, offset
    ]);

    // Contar resultados
    const countQuery = `
      SELECT COUNT(*) as total
      FROM videojuegos v
      LEFT JOIN genero_videojuego g ON v.id_genero = g.id_genero
      WHERE v.activo = true
        AND (
          v.titulo LIKE ? OR
          v.descripcion LIKE ? OR
          v.desarrollador LIKE ? OR
          g.nombre LIKE ?
        )
    `;

    const [countResult] = await db.execute(countQuery, [
      searchPattern, searchPattern, searchPattern, searchPattern
    ]);

    return {
      games: rows,
      searchTerm,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    };
  },

  // Obtener videojuegos por género
  async findByGenre(genreId, options = {}) {
    const { page = 1, limit = 12 } = options;
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        v.id_juego, v.slug, v.titulo, v.descripcion, v.precio,
        v.imagen_url, v.fecha_lanzamiento, v.desarrollador,
        v.plataforma, v.calificacion_promedio,
        g.nombre as genero_nombre
      FROM videojuegos v
      LEFT JOIN genero_videojuego g ON v.id_genero = g.id_genero
      WHERE v.id_genero = ? AND v.activo = true
      ORDER BY v.calificacion_promedio DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.execute(query, [genreId, limit, offset]);

    const countQuery = `
      SELECT COUNT(*) as total
      FROM videojuegos
      WHERE id_genero = ? AND activo = true
    `;

    const [countResult] = await db.execute(countQuery, [genreId]);

    return {
      games: rows,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    };
  },

  // Obtener juegos mejor calificados
  async findTopRated(limit = 10) {
    const query = `
      SELECT 
        v.id_juego, v.slug, v.titulo, v.precio,
        v.imagen_url, v.desarrollador, v.calificacion_promedio,
        g.nombre as genero_nombre,
        (SELECT COUNT(*) FROM reseñas WHERE id_juego = v.id_juego) as total_reseñas
      FROM videojuegos v
      LEFT JOIN genero_videojuego g ON v.id_genero = g.id_genero
      WHERE v.activo = true
      ORDER BY v.calificacion_promedio DESC, total_reseñas DESC
      LIMIT ?
    `;

    const [rows] = await db.execute(query, [limit]);
    return rows;
  },

  // Obtener juegos destacados (recientes y bien calificados)
  async findFeatured(limit = 6) {
    const query = `
      SELECT 
        v.id_juego, v.slug, v.titulo, v.precio,
        v.imagen_url, v.trailer_url, v.desarrollador,
        v.calificacion_promedio, v.fecha_lanzamiento,
        g.nombre as genero_nombre
      FROM videojuegos v
      LEFT JOIN genero_videojuego g ON v.id_genero = g.id_genero
      WHERE v.activo = true
        AND v.fecha_lanzamiento >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      ORDER BY v.calificacion_promedio DESC, v.fecha_agregado DESC
      LIMIT ?
    `;

    const [rows] = await db.execute(query, [limit]);
    return rows;
  },

  // Actualizar videojuego
  async update(id, gameData) {
    const fields = [];
    const values = [];

    const allowedFields = [
      'slug', 'titulo', 'descripcion', 'precio', 'stock',
      'fecha_lanzamiento', 'desarrollador', 'distribuidor',
      'id_genero', 'plataforma', 'clasificacion_edad',
      'steam_app_id', 'igdb_id', 'imagen_url', 'trailer_url', 'activo'
    ];

    for (const field of allowedFields) {
      if (gameData[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(gameData[field]);
      }
    }

    if (fields.length === 0) return null;

    values.push(id);

    const query = `
      UPDATE videojuegos
      SET ${fields.join(', ')}
      WHERE id_juego = ?
    `;

    const [result] = await db.execute(query, values);

    if (result.affectedRows === 0) return null;

    return this.findById(id);
  },

  // Soft delete
  async softDelete(id) {
    const query = `
      UPDATE videojuegos
      SET activo = FALSE
      WHERE id_juego = ?
    `;

    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  },

  // Verificar si existe
  async exists(id) {
    const query = 'SELECT id_juego FROM videojuegos WHERE id_juego = ?';
    const [rows] = await db.execute(query, [id]);
    return rows.length > 0;
  },

  // Actualizar stock
  async updateStock(id, quantity) {
    const query = `
      UPDATE videojuegos
      SET stock = stock - ?
      WHERE id_juego = ? AND stock >= ?
    `;

    const [result] = await db.execute(query, [quantity, id, quantity]);
    return result.affectedRows > 0;
  }
};

module.exports = gameRepository;