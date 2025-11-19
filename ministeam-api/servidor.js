require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const apiRoutes = require('./routes/api.routes');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(helmet()); // Seguridad
app.use(cors()); // CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded

// Rutas principales
app.use('/api', apiRoutes);

// Ruta de health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'MiniSteam API está funcionando',
    timestamp: new Date().toISOString()
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl 
  });
});

// Manejo de errores global (mejorado: incluye método, ruta y stack)
app.use((err, req, res, next) => {
  try {
    const meta = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`;
    console.error(meta, err.stack || err);
  } catch (loggingErr) {
    console.error('Error al loggear el error:', loggingErr, err);
  }

  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Iniciar servidor: primero verificar conexión a BD
(async () => {
  try {
    if (db && typeof db.testConnection === 'function') {
      await db.testConnection();
      console.log('✅ Verificación de BD completada.');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📍 API: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('⛔ No se pudo conectar a la base de datos. Abortando inicio del servidor.');
    console.error(err.stack || err);
    process.exit(1);
  }
})();