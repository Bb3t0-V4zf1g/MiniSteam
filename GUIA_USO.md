# MiniSteam Web - Guía de Uso

## Cómo ejecutar la aplicación

### 1. Inicia el Backend (API)

```bash
cd ministeam-api
node servidor.js
```

El servidor estará disponible en: `http://localhost:3000/api`

### 2. Inicia el Frontend (Web App)

En otra terminal:

```bash
cd ministeam-web
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

## Páginas Disponibles

### 🏠 Inicio (`/`)
- Listado de juegos disponibles
- Vista previa de cada juego
- Carrito y lista de deseos rápidos

### 🎮 Detalles del Juego (`/game/:id`)
- Información completa del juego
- Descripción y desarrollador
- Reseñas de otros usuarios
- Opciones para agregar al carrito o lista de deseos

### 🛒 Carrito (`/cart`)
- Ver juegos agregados al carrito
- Calcular total de compra (con impuestos)
- Opción para proceder al pago
- Vaciar carrito

### ❤️ Lista de Deseos (`/wishlist`)
- Juegos guardados para después
- Agregar/quitar de carrito desde la lista
- Eliminar de lista de deseos

### 📚 Mi Biblioteca (`/library`)
- Ver juegos que has comprado
- Botón para "jugar" (demo)

### 👤 Perfil (`/profile`)
- Ver información personal
- Rol de usuario
- Cerrar sesión

### 🔐 Login (`/login`)
- Inicia sesión con email y contraseña

### 📝 Registro (`/register`)
- Crea una nueva cuenta

## Características Implementadas

✅ Autenticación con JWT
✅ Listado de juegos con paginación
✅ Sistema de carrito (localStorage)
✅ Lista de deseos (localStorage)
✅ Página de detalles del juego
✅ Reseñas de juegos
✅ Perfil de usuario
✅ Biblioteca de juegos comprados
✅ Diseño responsive
✅ Tema oscuro

## Características Próximamente

🔄 Checkout y procesamiento de pagos
🔄 Editar perfil de usuario
🔄 Crear reseñas personales
🔄 Sistema de búsqueda y filtros
🔄 Wishlist sincronizado en servidor
🔄 Carrito sincronizado en servidor
🔄 Panel de administrador

## Estructura del Proyecto

```
ministeam-web/
├── src/
│   ├── components/        # Componentes reutilizables
│   │   ├── Navbar.jsx
│   │   ├── Navbar.css
│   │   ├── GameCard.jsx
│   │   └── GameCard.css
│   ├── pages/             # Páginas principales
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Cart.jsx
│   │   ├── Wishlist.jsx
│   │   ├── Library.jsx
│   │   ├── Profile.jsx
│   │   ├── GameDetail.jsx
│   │   └── *.css
│   ├── services/          # Servicios API
│   │   └── api.js
│   ├── stores/            # Zustand stores
│   │   └── store.js
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
└── .env

ministeam-api/
├── config/
│   └── database.js
├── controllers/
│   ├── games.controller.js
│   ├── users.controller.js
│   ├── reviews.controller.js
│   ├── cart.controller.js
│   ├── wishlist.controller.js
│   ├── library.controller.js
│   ├── purchases.controller.js
│   └── genres.controller.js
├── middlewares/
│   └── auth.middleware.js
├── repositories/
│   ├── game.repository.js
│   ├── user.repository.js
│   ├── review.repository.js
│   └── ...
├── routes/
│   ├── api.routes.js
│   ├── games.routes.js
│   ├── users.routes.js
│   └── ...
├── .env
├── servidor.js
└── package.json
```

## Variables de Entorno

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:3000/api
```

### Backend (`.env`)
```
DB_HOST=aws-rds-endpoint
DB_USER=usuario
DB_PASSWORD=contraseña
DB_NAME=ministeam2025
DB_PORT=3306
JWT_SECRET=tu_secreto_jwt
PORT=3000
```

## Troubleshooting

### Error: "Cannot connect to API"
- Verifica que el backend esté corriendo en puerto 3000
- Revisa que `VITE_API_URL` sea correcto en `.env`

### Error: "Database connection failed"
- Verifica las credenciales de BD en `.env`
- Asegúrate de que AWS RDS esté accesible

### Usuario no puede hacer login
- Verifica que el nombre de usuario y contraseña sean correctos
- Los campos deben ser `nombre_usuario` y `contrasena` (en DB)

## Notas Importantes

- El carrito y lista de deseos se guardan en `localStorage` (no sincronizado con servidor)
- Los tokens JWT expiran cada 24 horas
- Las imágenes de juegos se obtienen del campo `caratula_url` en BD

## Contacto y Soporte

Para reportar bugs o sugerencias, contacta al equipo de desarrollo.
