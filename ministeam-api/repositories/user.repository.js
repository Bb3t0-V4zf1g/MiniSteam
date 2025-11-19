const db = require('../config/database');

const userRepository = {
  // Crear usuario
  async create(userData) {
    const { nombre_usuario, correo, contrasena, pais, rol } = userData;
    
    const query = `
      INSERT INTO usuarios (nombre_usuario, correo, contrasena, pais, rol)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      nombre_usuario, 
      correo, 
      contrasena, 
      pais, 
      rol || 'cliente'
    ]);
    
    return this.findById(result.insertId);
  },

  // Buscar usuario por ID
  async findById(id) {
    const query = `
      SELECT id_usuario, nombre_usuario, correo, pais, rol, fecha_registro, activo
      FROM usuarios
      WHERE id_usuario = ?
    `;
    
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
  },

  // Buscar usuario por email (incluye contraseña para login)
  async findByEmail(correo) {
    const query = `
      SELECT id_usuario, nombre_usuario, correo, contrasena, pais, rol, activo, fecha_registro
      FROM usuarios
      WHERE correo = ?
    `;
    
    const [rows] = await db.execute(query, [correo]);
    return rows[0] || null;
  },

  // Buscar usuario por nombre de usuario o correo
  async findByUsernameOrEmail(username, email) {
    const query = `
      SELECT id_usuario, nombre_usuario, correo, pais, rol, activo
      FROM usuarios
      WHERE nombre_usuario = ? OR correo = ?
    `;
    
    const [rows] = await db.execute(query, [username, email]);
    return rows[0] || null;
  },

  // Obtener todos los usuarios con paginación
  async findAll(options = {}) {
    const { page = 1, limit = 10, activo } = options;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT id_usuario, nombre_usuario, correo, pais, rol, fecha_registro, activo
      FROM usuarios
    `;
    
    const params = [];
    
    if (activo !== undefined) {
      query += ' WHERE activo = ?';
      params.push(activo);
    }
    
    query += ' ORDER BY fecha_registro DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const [rows] = await db.execute(query, params);
    
    // Contar total
    let countQuery = 'SELECT COUNT(*) as total FROM usuarios';
    if (activo !== undefined) {
      countQuery += ' WHERE activo = ?';
    }
    
    const [countResult] = await db.execute(
      countQuery, 
      activo !== undefined ? [activo] : []
    );
    
    return {
      users: rows,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    };
  },

  // Actualizar usuario
  async update(id, userData) {
    const fields = [];
    const values = [];
    
    if (userData.nombre_usuario) {
      fields.push('nombre_usuario = ?');
      values.push(userData.nombre_usuario);
    }
    if (userData.correo) {
      fields.push('correo = ?');
      values.push(userData.correo);
    }
    if (userData.contrasena) {
      fields.push('contrasena = ?');
      values.push(userData.contrasena);
    }
    if (userData.pais !== undefined) {
      fields.push('pais = ?');
      values.push(userData.pais);
    }
    if (userData.activo !== undefined) {
      fields.push('activo = ?');
      values.push(userData.activo);
    }
    
    if (fields.length === 0) {
      return null;
    }
    
    values.push(id);
    
    const query = `
      UPDATE usuarios 
      SET ${fields.join(', ')}
      WHERE id_usuario = ?
    `;
    
    const [result] = await db.execute(query, values);
    
    if (result.affectedRows === 0) {
      return null;
    }
    
    return this.findById(id);
  },

  // Soft delete (desactivar usuario)
  async softDelete(id) {
    const query = `
      UPDATE usuarios 
      SET activo = FALSE
      WHERE id_usuario = ?
    `;
    
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  },

  // Hard delete (eliminar completamente)
  async hardDelete(id) {
    const query = 'DELETE FROM usuarios WHERE id_usuario = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  },

  // Obtener estadísticas del usuario
  async getUserStats(id) {
    const query = `
      SELECT 
        u.id_usuario,
        u.nombre_usuario,
        u.correo,
        u.pais,
        u.fecha_registro,
        COUNT(DISTINCT c.id_compra) as total_compras,
        COUNT(DISTINCT b.id_juego) as juegos_totales,
        COALESCE(SUM(c.total), 0) as gasto_total,
        COALESCE(AVG(c.total), 0) as gasto_promedio_compra,
        MAX(c.fecha_compra) as ultima_compra,
        COUNT(DISTINCT r.id_resena) as total_resenas,
        COUNT(DISTINCT ca.id_juego) as juegos_en_carrito,
        COUNT(DISTINCT l.id_juego) as juegos_en_wishlist
      FROM usuarios u
      LEFT JOIN compras c ON u.id_usuario = c.id_usuario AND c.estado_pago = 'completado'
      LEFT JOIN biblioteca_usuario b ON u.id_usuario = b.id_usuario
      LEFT JOIN reseñas r ON u.id_usuario = r.id_usuario
      LEFT JOIN carrito ca ON u.id_usuario = ca.id_usuario
      LEFT JOIN lista_deseos l ON u.id_usuario = l.id_usuario
      WHERE u.id_usuario = ?
      GROUP BY u.id_usuario, u.nombre_usuario, u.correo, u.pais, u.fecha_registro
    `;
    
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
  },

  // Verificar si el usuario existe
  async exists(id) {
    const query = 'SELECT id_usuario FROM usuarios WHERE id_usuario = ?';
    const [rows] = await db.execute(query, [id]);
    return rows.length > 0;
  }
};

module.exports = userRepository;