import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { testConnection, query } from './config/database';
import { authenticateToken, requireAdmin } from './middleware/auth';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware de seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Los datos ahora se obtienen desde la base de datos MySQL

// Configuración JWT
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura';

// Rutas de autenticación
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nombre, usuario, contraseña, correo, rol = 'cliente' } = req.body;

    // Validaciones básicas
    if (!nombre || !usuario || !contraseña || !correo) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios'
      });
    }

    // Validación de longitud de contraseña
    if (contraseña.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 4 caracteres'
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await query('SELECT id FROM usuarios WHERE usuario = ? OR correo = ?', [usuario, correo]) as any[];
    
    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El usuario o correo ya existe'
      });
    }

    // Encriptar contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(contraseña, saltRounds);

    // Insertar nuevo usuario
    const result = await query(
      'INSERT INTO usuarios (nombre, usuario, contraseña, correo, rol) VALUES (?, ?, ?, ?, ?)',
      [nombre, usuario, hashedPassword, correo, rol]
    ) as any;

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        id: result.insertId,
        nombre,
        usuario,
        correo,
        rol
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { usuario, contraseña } = req.body;

    if (!usuario || !contraseña) {
      return res.status(400).json({
        success: false,
        message: 'Usuario y contraseña son obligatorios'
      });
    }

    // Buscar usuario
    const users = await query('SELECT * FROM usuarios WHERE usuario = ? AND estado = 1', [usuario]) as any[];
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const user = users[0];

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(contraseña, user.contraseña);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        usuario: user.usuario, 
        rol: user.rol 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          usuario: user.usuario,
          correo: user.correo,
          rol: user.rol
        }
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Ruta protegida para obtener perfil del usuario
app.get('/api/auth/profile', authenticateToken, async (req: any, res) => {
  try {
    const users = await query('SELECT id, nombre, usuario, correo, rol, fecha_creacion FROM usuarios WHERE id = ?', [req.user.id]) as any[];
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil'
    });
  }
});

// Rutas de la API
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API del Planetario funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    tech: 'Node.js + TypeScript'
  });
});

// Rutas de cortos/películas
app.get('/api/cortos', async (req, res) => {
  try {
    const peliculas = await query('SELECT * FROM peliculas WHERE estado = 1');
    res.json({
      success: true,
      data: peliculas,
      message: 'Películas obtenidas exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las películas'
    });
  }
});

app.get('/api/cortos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const peliculas = await query('SELECT * FROM peliculas WHERE id = ? AND estado = 1', [id]) as any[];
    
    if (peliculas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Película no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: peliculas[0],
      message: 'Película obtenida exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la película'
    });
  }
});

// Rutas de funciones/horarios
app.get('/api/horarios', async (req, res) => {
  try {
    const horarios = await query(`
      SELECT f.*, p.titulo, p.duracion as duracionMinutos, p.clasificacion 
      FROM funciones f 
      INNER JOIN peliculas p ON f.id_pelicula = p.id 
      WHERE p.estado = 1 
      ORDER BY f.fecha, f.hora
    `) as any[];
    
    const horariosConDetalles = horarios.map((horario: any) => ({
      id: horario.id,
      cortoId: horario.id_pelicula,
      fecha: horario.fecha,
      horaInicio: horario.hora,
      horaFin: horario.hora, // Podrías calcular esto basado en duración
      sala: horario.sala,
      precioEntrada: 50, // Valor por defecto, podrías agregarlo a la tabla
      capacidadDisponible: 30, // Valor por defecto, podrías agregarlo a la tabla
      estado: 'programada',
      corto: {
        titulo: horario.titulo,
        duracionMinutos: horario.duracionMinutos,
        clasificacion: horario.clasificacion
      }
    }));
    
    res.json({
      success: true,
      data: horariosConDetalles,
      message: 'Horarios obtenidos exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los horarios'
    });
  }
});

// Rutas de noticias
app.get('/api/noticias', async (req, res) => {
  try {
    const noticias = await query('SELECT * FROM noticias WHERE estado = 1 ORDER BY fecha_publicacion DESC');
    res.json({
      success: true,
      data: noticias,
      message: 'Noticias obtenidas exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las noticias'
    });
  }
});

// Ruta para obtener horarios de hoy
app.get('/api/horarios/hoy', async (req, res) => {
  try {
    const hoy = new Date().toISOString().split('T')[0];
    const horarios = await query(`
      SELECT f.*, p.titulo, p.duracion as duracionMinutos, p.clasificacion 
      FROM funciones f 
      INNER JOIN peliculas p ON f.id_pelicula = p.id 
      WHERE p.estado = 1 AND f.fecha = ?
      ORDER BY f.hora
    `, [hoy]) as any[];
    
    const horariosConDetalles = horarios.map((horario: any) => ({
      id: horario.id,
      cortoId: horario.id_pelicula,
      fecha: horario.fecha,
      horaInicio: horario.hora,
      horaFin: horario.hora,
      sala: horario.sala,
      precioEntrada: 50,
      capacidadDisponible: 30,
      estado: 'programada',
      corto: {
        titulo: horario.titulo,
        duracionMinutos: horario.duracionMinutos,
        clasificacion: horario.clasificacion
      }
    }));
    
    res.json({
      success: true,
      data: horariosConDetalles,
      message: 'Horarios de hoy obtenidos exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los horarios de hoy'
    });
  }
});

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Ruta no encontrada' 
  });
});

// Middleware de manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📱 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⚡ Tecnología: Node.js + TypeScript + MySQL`);
  console.log(`🔗 Test API: http://localhost:${PORT}/api/test`);
  
  // Probar conexión a la base de datos
  await testConnection();
});

export default app;
