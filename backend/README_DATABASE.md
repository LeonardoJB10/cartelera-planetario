# Configuración de Base de Datos MySQL

## Pasos para conectar el backend con phpMyAdmin/MySQL

### 1. Instalar MySQL y phpMyAdmin
- Instala XAMPP, WAMP, o cualquier servidor local que incluya MySQL
- Asegúrate de que MySQL esté corriendo en el puerto 3306

### 2. Crear la base de datos
1. Abre phpMyAdmin en tu navegador (generalmente `http://localhost/phpmyadmin`)
2. Ve a la pestaña **"SQL"**
3. Copia y pega el contenido del archivo `database/cartelera_domo.sql`
4. Haz clic en **"Ejecutar"**

### 3. Configurar variables de entorno
Crea un archivo `.env` en la carpeta `backend` con el siguiente contenido:

```env
# Configuración del servidor
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Configuración de la base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cartelera_domo
DB_USER=root
DB_PASSWORD=

# Si usas un puerto diferente para phpMyAdmin, ajusta estos valores:
# DB_HOST=localhost
# DB_PORT=8080
# DB_USER=tu_usuario
# DB_PASSWORD=tu_contraseña
```

### 4. Instalar dependencias
```bash
cd backend
npm install
```

### 5. Ejecutar el servidor
```bash
npm run dev
```

## Estructura de la base de datos

### Tablas creadas:
- **usuarios**: Gestión de usuarios y roles
- **peliculas**: Catálogo de películas/cortos
- **funciones**: Horarios y funciones de las películas
- **noticias**: Noticias del planetario

### Datos de ejemplo incluidos:
- 3 usuarios (1 administrador, 2 clientes)
- 4 películas/cortos
- 10 funciones programadas
- 3 noticias

## Verificar la conexión

Cuando ejecutes el servidor, deberías ver:
```
✅ Conexión a MySQL establecida correctamente
📊 Base de datos: cartelera_domo
🌐 Host: localhost:3306
```

## Endpoints disponibles

- `GET /api/test` - Prueba de conexión
- `GET /api/cortos` - Lista de películas
- `GET /api/cortos/:id` - Detalle de película
- `GET /api/horarios` - Lista de funciones
- `GET /api/horarios/hoy` - Funciones de hoy
- `GET /api/noticias` - Lista de noticias

## Solución de problemas

### Error de conexión
- Verifica que MySQL esté corriendo
- Revisa las credenciales en el archivo `.env`
- Asegúrate de que la base de datos `cartelera_domo` exista

### Puerto ocupado
- Cambia el puerto en el archivo `.env` si es necesario
- Verifica que no haya otros servicios usando el puerto 3306
