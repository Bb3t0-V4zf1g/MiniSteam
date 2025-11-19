const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');

// Función para generar JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id_usuario, 
      username: user.nombre_usuario,
      role: user.rol 
    },
    process.env.JWT_SECRET || 'secret_key_ministeam',
    { expiresIn: '24h' }
  );
};

// Registro de usuario
const signup = async (req, res) => {
  try {
    const { nombre_usuario, correo, contrasena, pais } = req.body;

    // Validaciones
    if (!nombre_usuario || !correo || !contrasena) {
      return res.status(400).json({ 
        error: 'Nombre de usuario, correo y contraseña son requeridos' 
      });
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return res.status(400).json({ error: 'Formato de correo inválido' });
    }

    // Validar longitud de contraseña
    if (contrasena.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    // Verificar si el usuario o correo ya existe
    const existingUser = await userRepository.findByUsernameOrEmail(nombre_usuario, correo);
    if (existingUser) {
      if (existingUser.nombre_usuario === nombre_usuario) {
        return res.status(409).json({ 
          error: 'El nombre de usuario ya está registrado' 
        });
      }
      if (existingUser.correo === correo) {
        return res.status(409).json({ 
          error: 'El correo electrónico ya está registrado' 
        });
      }
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Crear usuario
    const newUser = await userRepository.create({
      nombre_usuario,
      correo,
      contrasena: hashedPassword,
      pais: pais || null,
      rol: 'cliente'
    });

    // Generar token
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser.id_usuario,
        username: newUser.nombre_usuario,
        email: newUser.correo,
        country: newUser.pais,
        role: newUser.rol
      },
      token
    });
  } catch (error) {
    console.error('Error en signup:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

// Login de usuario
const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    // Validaciones
    if (!correo || !contrasena) {
      return res.status(400).json({ 
        error: 'Correo y contraseña son requeridos' 
      });
    }

    // Buscar usuario por correo
    const user = await userRepository.findByEmail(correo);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Verificar si el usuario está activo
    if (!user.activo) {
      return res.status(403).json({ error: 'Usuario inactivo' });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(contrasena, user.contrasena);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Generar token
    const token = generateToken(user);

    res.json({
      message: 'Login exitoso',
      user: {
        id: user.id_usuario,
        username: user.nombre_usuario,
        email: user.correo,
        country: user.pais,
        role: user.rol
      },
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

// Obtener todos los usuarios (solo admin)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, activo } = req.query;
    
    const users = await userRepository.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      activo: activo === 'true' ? true : activo === 'false' ? false : undefined
    });

    res.json(users);
  } catch (error) {
    console.error('Error en getAllUsers:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Obtener usuario por ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const userIdParam = parseInt(id);
    if (isNaN(userIdParam)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    const user = await userRepository.findById(userIdParam);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error en getUserById:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

// Obtener perfil del usuario autenticado
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error en getUserProfile:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

// Actualizar usuario
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const userIdParam = parseInt(id);
    if (isNaN(userIdParam)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    // Verificar que el usuario solo pueda actualizar su propio perfil (excepto admin)
    if (userRole !== 'admin' && userIdParam !== userId) {
      return res.status(403).json({ 
        error: 'No tienes permiso para actualizar este usuario' 
      });
    }

    const { nombre_usuario, correo, contrasena, pais, activo } = req.body;
    
    const updateData = {};
    
    if (nombre_usuario) updateData.nombre_usuario = nombre_usuario;
    if (correo) updateData.correo = correo;
    if (pais !== undefined) updateData.pais = pais;
    
    // Solo admin puede cambiar el estado activo
    if (activo !== undefined && userRole === 'admin') {
      updateData.activo = activo;
    }
    
    // Si se proporciona nueva contraseña, hashearla
    if (contrasena) {
      if (contrasena.length < 6) {
        return res.status(400).json({ 
          error: 'La contraseña debe tener al menos 6 caracteres' 
        });
      }
      updateData.contrasena = await bcrypt.hash(contrasena, 10);
    }

    // Verificar si el nuevo nombre de usuario o correo ya existe
    if (nombre_usuario || correo) {
      const existing = await userRepository.findByUsernameOrEmail(
        nombre_usuario || '', 
        correo || ''
      );
      
      if (existing && existing.id_usuario !== parseInt(id)) {
        if (existing.nombre_usuario === nombre_usuario) {
          return res.status(409).json({ 
            error: 'El nombre de usuario ya está en uso' 
          });
        }
        if (existing.correo === correo) {
          return res.status(409).json({ 
            error: 'El correo electrónico ya está en uso' 
          });
        }
      }
    }

    const updated = await userRepository.update(userIdParam, updateData);
    if (!updated) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ 
      message: 'Usuario actualizado exitosamente',
      user: updated 
    });
  } catch (error) {
    console.error('Error en updateUser:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

// Eliminar usuario (soft delete)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const userIdParam = parseInt(id);
    if (isNaN(userIdParam)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    // Verificar permisos
    if (userRole !== 'admin' && userIdParam !== userId) {
      return res.status(403).json({ 
        error: 'No tienes permiso para eliminar este usuario' 
      });
    }

    const deleted = await userRepository.softDelete(userIdParam);
    if (!deleted) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error en deleteUser:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

// Obtener estadísticas del usuario
const getUserStats = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const userIdParam = parseInt(id);
    if (isNaN(userIdParam)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    // Verificar permisos
    if (userRole !== 'admin' && userIdParam !== userId) {
      return res.status(403).json({ 
        error: 'No tienes permiso para ver estas estadísticas' 
      });
    }

    const stats = await userRepository.getUserStats(userIdParam);
    if (!stats) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(stats);
  } catch (error) {
    console.error('Error en getUserStats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

module.exports = {
  signup,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserProfile,
  getUserStats
};