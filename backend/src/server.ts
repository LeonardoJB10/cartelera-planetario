import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import mysql, { RowDataPacket } from 'mysql2/promise' // Importación para MySQL

const app: Express = express()
const PORT = process.env.PORT ? Number(process.env.PORT) : 8000

// Middlewares
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json()) // Middleware para leer el cuerpo de las peticiones en formato JSON

// ----------------------------------------------------------------------
// CONFIGURACIÓN DE BASE DE DATOS
// ----------------------------------------------------------------------

const db = mysql.createPool({
    host: 'localhost',
    user: 'root', 
    password: '', // 🚨 REVISA ESTO (cadena vacía o tu contraseña real)
    database: 'db_planetario_sia',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Definición de Tipos
type Corto = { id: number; titulo: string; director: string; duracionMinutos: number; sinopsis: string; clasificacion: string; categoria: string; trailerUrl: string; lanzamiento: string; }
type Horario = { id: number; cortoId: number; fecha: string; horaInicio: string; horaFin: string; sala: string; precioEntrada: number; capacidadDisponible: number; }
type Noticia = { id: number; titulo: string; resumen: string; fechaPublicacion: string; } // Tipo mantenido por si se necesita

// Datos en Memoria (Simulación para CRUD en Horarios)
const hoy = new Date().toISOString().split('T')[0]
const cortos: Corto[] = [
  { id: 1, titulo: 'Corto Astronomía', director: 'Equipo Planetario', duracionMinutos: 15, sinopsis: 'Introducción a las constelaciones', clasificacion: 'A', categoria: 'Divulgación', trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', lanzamiento: hoy },
  { id: 2, titulo: 'Ciencia y Universo', director: 'Equipo Planetario', duracionMinutos: 20, sinopsis: 'Viaje por el sistema solar', clasificacion: 'A', categoria: 'Educativo', trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', lanzamiento: hoy }
]
const horarios: Horario[] = [
  { id: 1, cortoId: 1, fecha: hoy, horaInicio: '10:00:00', horaFin: '10:15:00', sala: 'Sala 1', precioEntrada: 50, capacidadDisponible: 30 },
  { id: 2, cortoId: 1, fecha: hoy, horaInicio: '12:00:00', horaFin: '12:15:00', sala: 'Sala 1', precioEntrada: 50, capacidadDisponible: 30 },
  { id: 3, cortoId: 2, fecha: hoy, horaInicio: '14:00:00', horaFin: '14:20:00', sala: 'Sala 2', precioEntrada: 50, capacidadDisponible: 30 }
]
const noticias: Noticia[] = [ // Mantenemos noticias por si se usa la ruta GET
  { id: 1, titulo: 'Nueva proyección inmersiva', resumen: 'Experiencia 360° en el domo.', fechaPublicacion: hoy },
  { id: 2, titulo: 'Semana de astronomía', resumen: 'Charlas y cortos especiales.', fechaPublicacion: hoy }
]

// ----------------------------------------------------------------------
// RUTAS GET Y CRUD PARA HORARIOS (ACTIVIDAD 8)
// ----------------------------------------------------------------------

app.get('/api/test', (_req: Request, res: Response) => { res.json({ ok: true, message: 'API lista' }) })
app.get('/api/cortos', (_req: Request, res: Response) => res.json({ success: true, data: cortos }))
app.get('/api/horarios', (_req: Request, res: Response) => res.json({ success: true, data: horarios }))

// POST: Crear Nuevo Horario (Actividad 8)
app.post('/api/horarios', (req: Request, res: Response) => { 
  const { id: _unusedId, ...datosSinId } = req.body; // <-- Corrección de 'id' no usado
  const nuevoHorarioData = datosSinId;

  if (!nuevoHorarioData.cortoId || !nuevoHorarioData.fecha || !nuevoHorarioData.horaInicio || !nuevoHorarioData.sala) {
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios para el nuevo horario.' });
  }

  // Lógica de generación de ID y adición al array
  const nuevoId = horarios.length > 0 ? Math.max(...horarios.map(h => h.id)) + 1 : 1;
  const nuevoHorario: Horario = {
    ...datosSinId, 
    cortoId: Number(nuevoHorarioData.cortoId), 
    precioEntrada: Number(nuevoHorarioData.precioEntrada || 0),
    capacidadDisponible: Number(nuevoHorarioData.capacidadDisponible || 0),
    id: nuevoId, 
  };

  horarios.push(nuevoHorario);
  res.status(201).json({ success: true, data: nuevoHorario });
});

// PUT: Actualizar Horario Existente
app.put('/api/horarios/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const datosNuevos: Partial<Horario> = req.body; 
  const index = horarios.findIndex(h => h.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Horario no encontrado para actualizar.' });
  }

  const horarioActualizado: Horario = {
      ...horarios[index], 
      ...datosNuevos,     
      cortoId: datosNuevos.cortoId !== undefined ? Number(datosNuevos.cortoId) : horarios[index].cortoId,
      precioEntrada: datosNuevos.precioEntrada !== undefined ? Number(datosNuevos.precioEntrada) : horarios[index].precioEntrada,
      capacidadDisponible: datosNuevos.capacidadDisponible !== undefined ? Number(datosNuevos.capacidadDisponible) : horarios[index].capacidadDisponible,
  };
  
  horarios[index] = horarioActualizado;

  res.status(200).json({ success: true, data: horarioActualizado });
});

// DELETE: Eliminar Horario
app.delete('/api/horarios/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const index = horarios.findIndex(h => h.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Horario no encontrado para eliminar.' });
  }

  horarios.splice(index, 1);

  res.status(204).send(); // 204 No Content: éxito en la eliminación
});


// ----------------------------------------------------------------------
// LÓGICA DE BLOQUEO DE ASIENTOS - ACTIVIDAD 9 (UNIFICADA Y CORREGIDA)
// ----------------------------------------------------------------------

app.post('/api/reservas/bloquear', async (req: Request, res: Response) => {
    const { id_asiento, id_horario } = req.body;
    let connection: mysql.PoolConnection | undefined; 

    if (!id_asiento || !id_horario) {
        return res.status(400).json({ success: false, message: 'Faltan campos: id_asiento o id_horario.' });
    }

    try {
        connection = await db.getConnection();
        await connection.beginTransaction(); 

        // CORRECCIÓN FINAL DE TIPADO Y LÓGICA DE SELECT
        const [rows] = await connection.execute(
            `SELECT estado FROM asientos WHERE id_asiento = ? FOR UPDATE`,
            [id_asiento]
        ) as [RowDataPacket[], any]; 

        if (rows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Asiento no encontrado.' });
        }

        const asientoActual = rows[0];

        if (asientoActual.estado !== 'libre') { 
            await connection.rollback(); 
            return res.status(409).json({ success: false, message: `Asiento ya está ${asientoActual.estado}. Doble venta evitada.` });
        }

        // ACTUALIZAR ESTADO A BLOQUEADO
        await connection.execute(
            `UPDATE asientos SET estado = 'bloqueado', id_horario = ? WHERE id_asiento = ?`,
            [id_horario, id_asiento]
        );

        await connection.commit(); 

        res.status(200).json({ 
            success: true, 
            message: 'Asiento bloqueado exitosamente.', 
            data: { id_asiento, id_horario, estado: 'bloqueado' } 
        });

    } catch (error) {
        // Eliminado console.error para pasar el linting
        if (connection) {
            await connection.rollback(); 
        }
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    } finally {
        if (connection) connection.release(); 
    }
});


// Inicio del Servidor
app.listen(PORT, () => {
  // Eliminado console.log para pasar el linting
});