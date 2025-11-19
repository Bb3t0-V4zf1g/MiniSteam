const mysql = require('mysql2/promise');
require('dotenv').config();

// Validar que exista el nombre de la base de datos en las variables de entorno
if (!process.env.DB_NAME) {
  console.error('⛔ Variable de entorno DB_NAME no definida. Por favor configura el nombre de la base de datos en .env (DB_NAME=...)');
  // Lanzar error para evitar crear pool sin DB y provocar consultas sin seleccionar base
  throw new Error('DB_NAME not set in environment');
}

// Crear el pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Verificar conexión sin bloquear el servidor
pool.getConnection()
  .then(connection => {
    console.log('✅ Conexión a la base de datos exitosa');
    connection.release();
  })
  .catch(err => {
    console.warn('⚠️ Error de conexión a BD:', err.message);
  });

// Función para probar conexión y lanzar error si falla (útil para inicio del servidor)
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch (err) {
    // Re-lanzar para que el llamador decida cómo manejarlo
    throw err;
  }
}

// Anexar la función al objeto pool para compatibilidad con require actuales
pool.testConnection = testConnection;

module.exports = pool;