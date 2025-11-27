# 🎬 Cartelera Planetario Digital

Una aplicación web moderna para la cartelera del domo digital del planetario, desarrollada con tecnologías de vanguardia.

## 🚀 Tecnologías Utilizadas

### Frontend
- **React 18** - Biblioteca de interfaz de usuario
- **Vite** - Herramienta de construcción ultra-rápida
- **TypeScript** - Tipado estático para JavaScript
- **Styled Components** - CSS-in-JS para estilos
- **React Router** - Enrutamiento del lado del cliente
- **Axios** - Cliente HTTP para API calls
- **React Icons** - Iconografía moderna

### Backend
- **Node.js** - Runtime de JavaScript
- **TypeScript** - Tipado estático
- **Express.js** - Framework web minimalista
- **CORS** - Configuración de recursos cruzados
- **Helmet** - Middleware de seguridad
- **Morgan** - Logger de HTTP

## 📁 Estructura del Proyecto

```
cartelera-planetario/
├── backend/
│   ├── src/
│   │   └── server.ts          # Servidor principal
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   ├── pages/            # Páginas de la aplicación
│   │   └── main.tsx          # Punto de entrada
│   ├── package.json
│   ├── vite.config.ts
│   └── index.html
└── README.md
```

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd cartelera-planetario
```

### 2. Configurar Backend
```bash
cd backend
npm install
```

### 3. Configurar Frontend
```bash
cd ../frontend
npm install
```

## 🚀 Cómo Levantar el Proyecto

### Desarrollo

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### URLs de Acceso
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **Test API**: http://localhost:8000/api/test

## 📱 Funcionalidades

### 🎬 Cartelera
- Visualización de horarios de funciones
- Información detallada de cada proyección
- Horarios del día actual

### 🎭 Cortos
- Catálogo completo de cortos disponibles
- Información detallada de cada corto
- Clasificación por categorías

### 📰 Noticias
- Últimas noticias del planetario
- Noticias destacadas
- Sistema de fechas y publicación

## 🔧 API Endpoints

### Cortos
- `GET /api/cortos` - Obtener todos los cortos
- `GET /api/cortos/:id` - Obtener corto específico

### Horarios
- `GET /api/horarios` - Obtener todos los horarios
- `GET /api/horarios/hoy` - Obtener horarios de hoy

### Noticias
- `GET /api/noticias` - Obtener todas las noticias

### Test
- `GET /api/test` - Verificar estado de la API

## 🎨 Características del Diseño

- **Interfaz Moderna**: Diseño limpio y profesional
- **Responsive**: Adaptable a todos los dispositivos
- **Tema Oscuro**: Optimizado para proyecciones
- **Animaciones Suaves**: Transiciones elegantes
- **Iconografía**: Iconos intuitivos y modernos

## 🔒 Seguridad

- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configuración de recursos cruzados
- **Validación**: Validación de datos de entrada
- **Sanitización**: Limpieza de datos del usuario

## 📈 Próximas Funcionalidades

- [ ] Panel de administración
- [ ] Sistema de autenticación
- [ ] Base de datos persistente
- [ ] Sistema de reservas
- [ ] Notificaciones push
- [ ] PWA (Progressive Web App)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Equipo

- **Desarrollo**: Planetario Team
- **Diseño**: Equipo de UX/UI
- **Backend**: Desarrolladores Node.js

## 📞 Contacto

- **Email**: info@planetario.com
- **Teléfono**: +1 (555) 123-4567
- **Dirección**: Av. Principal 123, Ciudad

---

⭐ ¡Dale una estrella al proyecto si te gusta!
