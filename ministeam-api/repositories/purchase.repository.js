const db = require('../config/database');

const purchaseRepository = {
  // Crear compra
  async create(purchaseData, connection = null) {
    const dbConn = connection || db;
    
    const { id_usuario, total, metodo_pago, estado_pago, notas } = purchaseData;
    
    const query = `
      INSERT INTO compras (id_usuario, total, metodo_pago, estado_pago, notas)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await dbConn.execute(query, [
      id_usuario,
      total,
      metodo_pago,
      estado_pago,
      notas || null
    ]);
    
    return result.insertId;
  },

  // Crear detalle de compra
  async createDetail(detailData, connection = null) {
    const dbConn = connection || db;
    
    const { id_compra, id_juego, precio_pagado, cantidad, descuento_aplicado } = detailData;
    
    const query = `
      INSERT INTO compra_detalle (id_compra, id_juego, precio_pagado, cantidad, descuento_aplicado)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await dbConn.execute(query, [
      id_compra,
      id_juego,
      precio_pagado,
      cantidad || 1,
      descuento_aplicado || 0
    ]);
    
    return result.insertId;
  },

  // Obtener compra por ID con detalles
  async findById(id) {
    const purchaseQuery = `
      SELECT 
        c.*,
        u.nombre_usuario,
        u.correo
      FROM compras c
      JOIN usuarios u ON c.id_usuario = u.id_usuario
      WHERE c.id_compra = ?
    `;
    
    const [purchases] = await db.execute(purchaseQuery, [id]);
    
    if (purchases.length === 0) return null;
    
    const purchase = purchases[0];
    
    // Obtener detalles
    const detailsQuery = `
      SELECT 
        cd.*,
        v.titulo,
        v.slug,
        v.imagen_url,
        v.desarrollador,
        v.plataforma
      FROM compra_detalle cd
      JOIN videojuegos v ON cd.id_juego = v.id_juego
      WHERE cd.id_compra = ?
    `;
    
    const [details] = await db.execute(detailsQuery, [id]);
    
    return {
      ...purchase,
      items: details
    };
  },

  // Obtener compras por usuario
  async findByUser(userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT 
        c.id_compra,
        c.fecha_compra,
        c.total,
        c.metodo_pago,
        c.estado_pago,
        COUNT(cd.id_detalle) as items_count
      FROM compras c
      LEFT JOIN compra_detalle cd ON c.id_compra = cd.id_compra
      WHERE c.id_usuario = ?
      GROUP BY c.id_compra, c.fecha_compra, c.total, c.metodo_pago, c.estado_pago
      ORDER BY c.fecha_compra DESC
      LIMIT ? OFFSET ?
    `;
    
    const [rows] = await db.execute(query, [userId, limit, offset]);
    
    // Contar total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM compras
      WHERE id_usuario = ?
    `;
    
    const [countResult] = await db.execute(countQuery, [userId]);
    
    return {
      purchases: rows,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    };
  },

  // Obtener todas las compras (admin)
  async findAll(options = {}) {
    const { page = 1, limit = 10, estado_pago } = options;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        c.id_compra,
        c.fecha_compra,
        c.total,
        c.metodo_pago,
        c.estado_pago,
        u.nombre_usuario,
        u.correo,
        COUNT(cd.id_detalle) as items_count
      FROM compras c
      JOIN usuarios u ON c.id_usuario = u.id_usuario
      LEFT JOIN compra_detalle cd ON c.id_compra = cd.id_compra
    `;
    
    const params = [];
    
    if (estado_pago) {
      query += ' WHERE c.estado_pago = ?';
      params.push(estado_pago);
    }
    
    query += `
      GROUP BY c.id_compra, c.fecha_compra, c.total, c.metodo_pago, c.estado_pago, u.nombre_usuario, u.correo
      ORDER BY c.fecha_compra DESC
      LIMIT ? OFFSET ?
    `;
    
    params.push(limit, offset);
    
    const [rows] = await db.execute(query, params);
    
    // Contar total
    let countQuery = 'SELECT COUNT(*) as total FROM compras';
    const countParams = [];
    
    if (estado_pago) {
      countQuery += ' WHERE estado_pago = ?';
      countParams.push(estado_pago);
    }
    
    const [countResult] = await db.execute(countQuery, countParams);
    
    return {
      purchases: rows,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    };
  },

  // Actualizar estado de pago
  async updatePaymentStatus(id, estado_pago) {
    const query = `
      UPDATE compras
      SET estado_pago = ?
      WHERE id_compra = ?
    `;
    
    const [result] = await db.execute(query, [estado_pago, id]);
    return result.affectedRows > 0;
  },

  // Obtener estadísticas de ventas
  async getSalesStats() {
    const query = `
      SELECT 
        COUNT(*) as total_compras,
        SUM(total) as ingresos_totales,
        AVG(total) as ticket_promedio,
        COUNT(DISTINCT id_usuario) as clientes_unicos
      FROM compras
      WHERE estado_pago = 'completado'
    `;
    
    const [rows] = await db.execute(query);
    return rows[0];
  }
};

module.exports = purchaseRepository;