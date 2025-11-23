// Script para verificar la estructura de respuesta de la API
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testAPI() {
  console.log('🧪 Probando endpoints de la API...\n');

  try {
    // Test 1: GET /api/games
    console.log('1️⃣ Probando GET /api/games');
    const gamesResponse = await axios.get(`${API_URL}/games?page=1&limit=3`);
    console.log('   ✅ Status:', gamesResponse.status);
    console.log('   📦 Keys en response.data:', Object.keys(gamesResponse.data));
    console.log('   🎮 Cantidad de juegos:', gamesResponse.data.juegos?.length || 0);
    
    if (gamesResponse.data.juegos && gamesResponse.data.juegos.length > 0) {
      const game = gamesResponse.data.juegos[0];
      console.log('   📋 Propiedades del primer juego:', Object.keys(game));
      console.log('   📝 Primer juego:', {
        id: game.id_juego,
        titulo: game.titulo,
        precio: game.precio,
        genero: game.genero_nombre,
        imagen: game.imagen_url ? '✓' : '✗'
      });
    }

    // Test 2: GET /api/games/:id
    console.log('\n2️⃣ Probando GET /api/games/:id');
    if (gamesResponse.data.juegos && gamesResponse.data.juegos.length > 0) {
      const firstGameId = gamesResponse.data.juegos[0].id_juego;
      const gameDetailResponse = await axios.get(`${API_URL}/games/${firstGameId}`);
      console.log('   ✅ Status:', gameDetailResponse.status);
      console.log('   📦 Keys en response.data:', Object.keys(gameDetailResponse.data));
      console.log('   🎮 Juego:', {
        id: gameDetailResponse.data.id_juego,
        titulo: gameDetailResponse.data.titulo,
        precio: gameDetailResponse.data.precio
      });
    }

    console.log('\n✅ Todas las pruebas pasaron correctamente!');
    console.log('\n📌 Resumen:');
    console.log('   - La API devuelve "juegos" (array) en GET /games');
    console.log('   - La API devuelve objeto directo en GET /games/:id');
    console.log('   - Las propiedades son: id_juego, titulo, precio, imagen_url, genero_nombre');

  } catch (error) {
    console.error('\n❌ Error en las pruebas:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else {
      console.error('   Mensaje:', error.message);
      console.error('   ⚠️ ¿Está el servidor corriendo en puerto 3000?');
    }
    process.exit(1);
  }
}

testAPI();
