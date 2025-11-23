// Script para probar el endpoint de juegos corregido
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testGameEndpoint() {
  console.log('🧪 Probando endpoint GET /api/games/:id\n');

  try {
    // Test 1: Buscar por ID numérico
    console.log('1️⃣ Test: GET /api/games/1 (por ID)');
    const byIdResponse = await axios.get(`${API_URL}/games/1`);
    console.log('   ✅ Status:', byIdResponse.status);
    console.log('   🎮 Juego:', byIdResponse.data.titulo);
    console.log('   📋 ID:', byIdResponse.data.id_juego);

    // Test 2: Buscar por slug (si existe)
    if (byIdResponse.data.slug) {
      console.log('\n2️⃣ Test: GET /api/games/:slug (por slug)');
      const bySlugResponse = await axios.get(`${API_URL}/games/${byIdResponse.data.slug}`);
      console.log('   ✅ Status:', bySlugResponse.status);
      console.log('   🎮 Juego:', bySlugResponse.data.titulo);
      console.log('   📋 Slug:', bySlugResponse.data.slug);
    }

    // Test 3: Varios IDs
    console.log('\n3️⃣ Test: Múltiples IDs');
    for (let id of [1, 8, 10]) {
      try {
        const response = await axios.get(`${API_URL}/games/${id}`);
        console.log(`   ✅ ID ${id}:`, response.data.titulo);
      } catch (err) {
        if (err.response?.status === 404) {
          console.log(`   ⚠️ ID ${id}: No encontrado (puede no existir en BD)`);
        } else {
          console.log(`   ❌ ID ${id}: Error -`, err.message);
        }
      }
    }

    console.log('\n✅ Endpoint funcionando correctamente!\n');

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

testGameEndpoint();
