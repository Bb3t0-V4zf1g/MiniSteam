// Script para probar todos los endpoints críticos
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testAllEndpoints() {
  console.log('🧪 Probando todos los endpoints críticos...\n');
  let token = null;

  try {
    // Test 1: GET /api/games - Obtener juegos
    console.log('1️⃣ GET /api/games - Obtener juegos');
    const gamesResponse = await axios.get(`${API_URL}/games?page=1&limit=5`);
    console.log('   ✅ Status:', gamesResponse.status);
    console.log('   📦 Tiene "juegos":', 'juegos' in gamesResponse.data);
    console.log('   🎮 Cantidad:', gamesResponse.data.juegos?.length || 0);

    // Test 2: GET /api/genres - Obtener géneros
    console.log('\n2️⃣ GET /api/genres - Obtener géneros');
    const genresResponse = await axios.get(`${API_URL}/genres`);
    console.log('   ✅ Status:', genresResponse.status);
    console.log('   📦 Tiene "generos":', 'generos' in genresResponse.data);
    console.log('   🎭 Cantidad:', genresResponse.data.generos?.length || 0);

    // Test 3: GET /api/games/:id - Detalle de juego
    if (gamesResponse.data.juegos && gamesResponse.data.juegos.length > 0) {
      const gameId = gamesResponse.data.juegos[0].id_juego;
      console.log('\n3️⃣ GET /api/games/:id - Detalle de juego');
      const gameDetailResponse = await axios.get(`${API_URL}/games/${gameId}`);
      console.log('   ✅ Status:', gameDetailResponse.status);
      console.log('   🎮 Juego:', gameDetailResponse.data.titulo);
      console.log('   📋 Tiene propiedades:', {
        titulo: !!gameDetailResponse.data.titulo,
        precio: !!gameDetailResponse.data.precio,
        imagen_url: !!gameDetailResponse.data.imagen_url,
        genero_nombre: !!gameDetailResponse.data.genero_nombre
      });
    }

    // Test 4: Filtros de búsqueda
    console.log('\n4️⃣ GET /api/games con filtros');
    const filteredResponse = await axios.get(`${API_URL}/games`, {
      params: {
        page: 1,
        limit: 5,
        precio_min: 0,
        precio_max: 100,
        sort: 'precio',
        order: 'ASC'
      }
    });
    console.log('   ✅ Filtros funcionando:', filteredResponse.status === 200);
    console.log('   🎮 Resultados:', filteredResponse.data.juegos?.length || 0);

    // Test 5: Búsqueda
    console.log('\n5️⃣ GET /api/games/search - Búsqueda');
    try {
      const searchResponse = await axios.get(`${API_URL}/games/search`, {
        params: { q: 'game', page: 1, limit: 5 }
      });
      console.log('   ✅ Búsqueda funciona:', searchResponse.status === 200);
      console.log('   🔍 Resultados:', searchResponse.data.juegos?.length || 0);
    } catch (err) {
      console.log('   ⚠️ Búsqueda requiere más configuración');
    }

    // Test 6: Login (necesario para probar carrito y wishlist)
    console.log('\n6️⃣ POST /api/users/login - Login');
    try {
      const loginResponse = await axios.post(`${API_URL}/users/login`, {
        correo: 'test@example.com',
        contrasena: 'password123'
      });
      token = loginResponse.data.token;
      console.log('   ✅ Login exitoso');
      console.log('   👤 Usuario:', loginResponse.data.user.username);
    } catch (err) {
      console.log('   ⚠️ Login falló (usuario de prueba no existe)');
      console.log('   💡 Crea un usuario de prueba o usa credenciales existentes');
    }

    // Test 7 y 8: Carrito y Wishlist (requieren autenticación)
    if (token) {
      const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

      console.log('\n7️⃣ GET /api/cart - Obtener carrito');
      try {
        const cartResponse = await axios.get(`${API_URL}/cart`, authHeaders);
        console.log('   ✅ Carrito obtenido');
        console.log('   🛒 Items:', cartResponse.data.items?.length || 0);
      } catch (err) {
        console.log('   ❌ Error:', err.response?.data?.error || err.message);
      }

      console.log('\n8️⃣ GET /api/wishlist - Obtener lista de deseos');
      try {
        const wishlistResponse = await axios.get(`${API_URL}/wishlist`, authHeaders);
        console.log('   ✅ Wishlist obtenida');
        console.log('   ❤️ Items:', wishlistResponse.data.items?.length || 0);
      } catch (err) {
        console.log('   ❌ Error:', err.response?.data?.error || err.message);
      }
    }

    console.log('\n✅ Pruebas completadas!\n');
    console.log('📌 Resumen de lo que debe funcionar:');
    console.log('   ✓ Listar juegos con paginación');
    console.log('   ✓ Obtener géneros para filtros');
    console.log('   ✓ Ver detalle de un juego');
    console.log('   ✓ Filtrar juegos por precio y género');
    console.log('   ✓ Buscar juegos por término');
    console.log('   ✓ Carrito y wishlist (requieren login)');

  } catch (error) {
    console.error('\n❌ Error general en las pruebas:');
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

testAllEndpoints();
