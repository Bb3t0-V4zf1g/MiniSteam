const genreRepository = require('../repositories/genre.repository');


// Obtener todos los generos 
const getAllGenres = async (req, res) => {
  try {
    const genres = await genreRepository.findAll();
    res.json({ generos: genres });
  }catch (error) {
    console.error('Error en getAllGenres:', error);
    res.status(500).json({ error: 'Error al obtener los generos' });
  }
};

const getGenreById = async (req, res) => {
  try {
    const { id } = req.params;
    const genreId = parseInt(id);
    if (isNaN(genreId)) {
      return res.status(400).json({ error: 'ID de género inválido' });
    }
    const genre = await genreRepository.findById(genreId);
    
    if (!genre) {
      return res.status(404).json({ error: 'Género no encontrado' });
    }
    
    res.json(genre);
  } catch (error) {
    console.error('Error en getGenreById:', error);
    res.status(500).json({ error: 'Error al obtener género' });
  }
};

// solo admin
const createGenre = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ error: 'Nombre es requerido' });
    }
    const existing = await genreRepository.findByName(nombre);
    if (existing) {
      return res.status(404).json({ error: 'Ya existe un genero con ese nombre' });
    }
    
    const newGenre = await genreRepository.create({ nombre, descripcion });
    
    res.status(201).json({
      message: 'Genero creado exitosamente',
        genre: newGenre
    });
  } catch (error) {
    console.error('Error en createGenre:', error);
    res.status(500).json({ error: 'Error al crear el genero' });
  }
};

// Solo admin
const updateGenre = async (req, res) => {
  try {
    const { id } = req.params;
    const genreId = parseInt(id);
    if (isNaN(genreId)) {
      return res.status(400).json({ error: 'ID de género inválido' });
    }
    const { nombre, descripcion } = req.body;

    const updated = await genreRepository.update(genreId, { nombre, descripcion });
    if (!updated) {
      return res.status(404).json({ error: 'Genero no encontrado' });
    }   

    res.json({
        message: 'Genero actualizado exitosamente',
        genre: updated
    });
    } catch (error) {
    console.error('Error en updateGenre:', error);
    res.status(500).json({ error: 'Error al actualizar el genero' });
  }
};

// Solo admin
const deleteGenre = async (req, res) => {
  try {
    const { id } = req.params;
    const genreId = parseInt(id);
    if (isNaN(genreId)) {
      return res.status(400).json({ error: 'ID de género inválido' });
    }

    const removed = await genreRepository.delete(genreId);
    if (!removed) {
      return res.status(404).json({ error: 'Genero no encontrado' });
    }
    
    res.json({
      message: 'Genero eliminado exitosamente',
      genre: removed
    });
    } catch (error) {
    console.error('Error en deleteGenre:', error);
    res.status(500).json({ error: 'Error al eliminar el genero' });
  }
};

module.exports = {
  getAllGenres,
  getGenreById,
  createGenre,
  updateGenre,
  deleteGenre
};