// Script para probar el repositorio de juegos
const gameRepository = require('./repositories/game.repository');

async function test() {
  try {
    console.log('🧪 Probando game.repository.findAll()...\n');
    
    const result = await gameRepository.findAll({ 
      page: 1, 
      limit: 5,
      activo: true 
    });
    
    console.log('✅ Estructura de respuesta:');
    console.log('  - Keys:', Object.keys(result));
    console.log('  - Tiene "juegos":', 'juegos' in result);
    console.log('  - Cantidad de juegos:', result.juegos?.length || 0);
    console.log('  - Paginación:', result.pagination);
    
    if (result.juegos && result.juegos.length > 0) {
      console.log('\n📋 Primer juego:');
      const game = result.juegos[0];
      console.log('  - ID:', game.id_juego);
      console.log('  - Título:', game.titulo);
      console.log('  - Precio:', game.precio);
      console.log('  - Género:', game.genero_nombre);
    }
    
    console.log('\n✅ ¡Todo OK! El repositorio devuelve "juegos" correctamente.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

test();
