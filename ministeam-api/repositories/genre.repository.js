const db = require("../config/database");

const genreRepository = {
  // Crear genre
  async create(genreData) {
    const { nombre, descripcion } = genreData;

    const query = `
      INSERT INTO genero_videojuego (nombre, descripcion)
      VALUES (?, ?)
    `;

    const [result] = await db.execute(query, [nombre, descripcion || null]);

    return this.findById(result.insertId);
  },

  async findAll() {
    const query = `
      SELECT 
        g.*,
        COUNT(v.id_juego) as total_juegos
      FROM genero_videojuego g
      LEFT JOIN videojuegos v ON g.id_genero = v.id_genero AND v.activo = true
      GROUP BY g.id_genero, g.nombre, g.descripcion
      ORDER BY g.nombre ASC
    `;

    const [rows] = await db.execute(query);
    return rows;
  },

  // Buscar genero por ID
  async findById(id) {
    const query = `
      SELECT 
        g.*,
        COUNT(v.id_juego) as total_juegos
      FROM genero_videojuego g
      LEFT JOIN videojuegos v ON g.id_genero = v.id_genero AND v.activo = true
      WHERE g.id_genero = ?
      GROUP BY g.id_genero, g.nombre, g.descripcion
    `;

    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
  },

  // Buscar genero por nombre
  async findByName(nombre) {
    const query = `
      SELECT id_genero, nombre, descripcion
      FROM genero_videojuego
      WHERE nombre = ?`;

    const [rows] = await db.execute(query, [nombre]);
    return rows[0] || null;
  },

  // Actualizar genero
  async update(id, genreData) {
    const fields = [];
    const values = [];

    if (genreData.nombre) {
      fields.push("nombre = ?");
      values.push(genreData.nombre);
    }
    if (genreData.descripcion) {
      fields.push("descripcion = ?");
      values.push(genreData.descripcion);
    }
    if (fields.length === 0) {
      return null;
    }
    values.push(id);

    const query = `
      UPDATE genero_videojuego
      SET ${fields.join(", ")}
      WHERE id_genero = ?
    `;

    const [result] = await db.execute(query, values);

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(id);
  },

  // Eliminar completamente
  async delete(id) {
    const query = "DELETE FROM genero_videojuego WHERE id_genero = ?";
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  },

  // Verificar si el genero existe
  async exists(name) {
    const query = "SELECT nombre FROM genero_videojuego WHERE nombre = ?";
    const [rows] = await db.execute(query, [name]);
    return rows.length > 0;
  },
};

module.exports = genreRepository;
