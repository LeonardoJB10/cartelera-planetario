import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import mysql, { RowDataPacket } from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const app: Express = express()
const PORT = process.env.PORT ? Number(process.env.PORT) : 8000

// Middlewares
app.use(cors({ origin: ['http://localhost:5173','http://localhost:5174'], credentials: true }))
app.use(express.json()) // Middleware para leer el cuerpo de las peticiones en formato JSON

// ----------------------------------------------------------------------
// CONFIGURACIÓN DE BASE DE DATOS
// ----------------------------------------------------------------------

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'db_planetario_sia',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

const USERS_TABLE = 'usuarios'
const COL_ID = 'id_usuario'
const COL_NAME = 'nombre'
const COL_EMAIL = 'email'
const COL_PWHASH = 'password'

try { await db.execute('DROP TABLE IF EXISTS `users`') } catch (_e) {}

async function ensureAsientosBlockColumn() {
  try {
    const [cols] = await db.query<mysql.RowDataPacket[]>('SHOW COLUMNS FROM `asientos`')
    const names = new Set(cols.map((r: any) => String(r.Field)))
    if (!names.has('bloqueado_hasta')) {
      await db.execute('ALTER TABLE `asientos` ADD COLUMN `bloqueado_hasta` DATETIME NULL')
    }
  } catch (_e) {}
}
ensureAsientosBlockColumn()
async function ensureAdminAccount() {
  try {
    const email = 'admin@planetario.local'
    const [rows] = await db.execute(`SELECT \`${COL_ID}\` as id FROM \`${USERS_TABLE}\` WHERE \`${COL_EMAIL}\` = ?`, [email]) as [RowDataPacket[], any]
    if ((rows as RowDataPacket[]).length === 0) {
      const hash = await bcrypt.hash('1234', 10)
      await db.execute(`INSERT INTO \`${USERS_TABLE}\` (\`${COL_NAME}\`, \`${COL_EMAIL}\`, \`${COL_PWHASH}\`, es_admin) VALUES (?, ?, ?, 1)`, ['Administrador', email, hash])
    }
  } catch (_e) {}
}
ensureAdminAccount()

async function releaseExpiredSeats() {
  try {
    await db.execute("UPDATE `asientos` SET `estado`='libre' WHERE `estado`='bloqueado' AND `bloqueado_hasta` IS NOT NULL AND `bloqueado_hasta` < NOW()")
  } catch (_e) {}
}
setInterval(releaseExpiredSeats, 60_000)

// Definición de Tipos
type Corto = { id: number; titulo: string; director: string; duracionMinutos: number; sinopsis: string; clasificacion: string; categoria: string; trailerUrl: string; lanzamiento: string; }
type Horario = { id: number; cortoId: number; fecha: string; horaInicio: string; horaFin: string; sala: string; precioEntrada: number; capacidadDisponible: number; }
type Noticia = { id: number; titulo: string; resumen: string; fechaPublicacion: string; }

// Datos de ejemplo eliminados. Las rutas usan tablas reales.

// ----------------------------------------------------------------------
// RUTAS GET Y CRUD PARA HORARIOS (ACTIVIDAD 8)
// ----------------------------------------------------------------------

app.get('/api/test', (_req: Request, res: Response) => { res.json({ ok: true, message: 'API lista' }) })
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body || {}
  if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Campos incompletos' })
  try {
    const [rows] = await db.execute(`SELECT \`${COL_ID}\` as id FROM \`${USERS_TABLE}\` WHERE \`${COL_EMAIL}\` = ?`, [email]) as [RowDataPacket[], any]
    if (rows.length > 0) return res.status(409).json({ success: false, message: 'Correo ya registrado' })
    const hash = await bcrypt.hash(String(password), 10)
    await db.execute(`INSERT INTO \`${USERS_TABLE}\` (\`${COL_NAME}\`, \`${COL_EMAIL}\`, \`${COL_PWHASH}\`, es_admin) VALUES (?, ?, ?, 0)`, [name, email, hash])
    return res.json({ success: true })
  } catch (_e) { return res.status(500).json({ success: false, message: 'Error al registrar' }) }
})
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ success: false, message: 'Campos incompletos' })
  try {
    const [rows] = await db.execute(`SELECT \`${COL_ID}\` as id, \`${COL_NAME}\` as name, \`${COL_EMAIL}\` as email, \`${COL_PWHASH}\` as password_hash, es_admin FROM \`${USERS_TABLE}\` WHERE \`${COL_EMAIL}\` = ?`, [email]) as [RowDataPacket[], any]
    if (rows.length === 0) return res.status(401).json({ success: false, message: 'Credenciales inválidas' })
    const user = rows[0]
    const stored = String(user.password_hash)
    const isHash = stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$')
    const ok = isHash ? await bcrypt.compare(String(password), stored) : stored === String(password)
    if (!isHash && ok) {
      const newHash = await bcrypt.hash(String(password), 10)
      await db.execute(`UPDATE \`${USERS_TABLE}\` SET \`${COL_PWHASH}\` = ? WHERE \`${COL_ID}\` = ?`, [newHash, user.id])
    }
    if (!ok) return res.status(401).json({ success: false, message: 'Credenciales inválidas' })
    const token = jwt.sign({ sub: user.id, email: user.email, name: user.name, admin: user.es_admin === 1 }, JWT_SECRET, { expiresIn: '2h' })
    return res.json({ success: true, token })
  } catch (_e) { return res.status(500).json({ success: false, message: 'Error al iniciar sesión' }) }
})
function readToken(req: Request): string {
  const h = String(req.headers.authorization || '')
  const parts = h.split(' ')
  if (parts[0] === 'Bearer' && parts[1]) return parts[1]
  return ''
}
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const t = readToken(req)
  if (!t) return res.status(401).json({ success: false })
  try {
    const payload: any = jwt.verify(t, JWT_SECRET)
    if (payload && payload.admin) { (req as any).user = payload; return next() }
    return res.status(403).json({ success: false })
  } catch { return res.status(401).json({ success: false }) }
}
app.get('/api/auth/me', async (req: Request, res: Response) => {
  const t = readToken(req)
  if (!t) return res.status(401).json({ success: false })
  try {
    const payload: any = jwt.verify(t, JWT_SECRET)
    const id = Number(payload.sub)
    const [rows] = await db.execute(`SELECT \`${COL_ID}\` as id, \`${COL_NAME}\` as name, \`${COL_EMAIL}\` as email, es_admin FROM \`${USERS_TABLE}\` WHERE \`${COL_ID}\` = ?`, [id]) as [RowDataPacket[], any]
    if (rows.length === 0) return res.status(404).json({ success: false })
    const u = rows[0]
    return res.json({ success: true, data: { id: u.id, name: u.name, email: u.email, admin: u.es_admin === 1 } })
  } catch { return res.status(401).json({ success: false }) }
})
app.put('/api/auth/me', async (req: Request, res: Response) => {
  const t = readToken(req)
  if (!t) return res.status(401).json({ success: false })
  try {
    const payload: any = jwt.verify(t, JWT_SECRET)
    const id = Number(payload.sub)
    const { name, password } = req.body || {}
    const fields: string[] = []
    const values: any[] = []
    if (name) { fields.push(`\`${COL_NAME}\` = ?`); values.push(String(name)) }
    if (password) { const hash = await bcrypt.hash(String(password), 10); fields.push(`\`${COL_PWHASH}\` = ?`); values.push(hash) }
    if (fields.length === 0) return res.status(400).json({ success: false })
    values.push(id)
    await db.execute(`UPDATE \`${USERS_TABLE}\` SET ${fields.join(', ')} WHERE \`${COL_ID}\` = ?`, values)
    const token = jwt.sign({ sub: id, email: payload.email, name: name || payload.name, admin: payload.admin }, JWT_SECRET, { expiresIn: '2h' })
    return res.json({ success: true, token })
  } catch { return res.status(401).json({ success: false }) }
})
app.post('/api/admin/users', requireAdmin, async (req: Request, res: Response) => {
  const { name, email, password } = req.body || {}
  if (!name || !email || !password) return res.status(400).json({ success: false })
  try {
    const [rows] = await db.execute(`SELECT \`${COL_ID}\` as id FROM \`${USERS_TABLE}\` WHERE \`${COL_EMAIL}\` = ?`, [email]) as [RowDataPacket[], any]
    if (rows.length > 0) return res.status(409).json({ success: false, message: 'Correo ya registrado' })
    const hash = await bcrypt.hash(String(password), 10)
    await db.execute(`INSERT INTO \`${USERS_TABLE}\` (\`${COL_NAME}\`, \`${COL_EMAIL}\`, \`${COL_PWHASH}\`, es_admin) VALUES (?, ?, ?, 1)`, [name, email, hash])
    return res.status(201).json({ success: true })
  } catch (_e) { return res.status(500).json({ success: false }) }
})
app.get('/api/admin/users', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.execute(
      `SELECT \`${COL_ID}\` as id, \`${COL_NAME}\` as name, \`${COL_EMAIL}\` as email, es_admin FROM \`${USERS_TABLE}\` WHERE es_admin = 1`
    ) as [RowDataPacket[], any]
    const data = (rows as RowDataPacket[]).map(r => ({ id: Number((r as any).id), name: String((r as any).name), email: String((r as any).email) }))
    return res.json({ success: true, data })
  } catch (_e) { return res.status(500).json({ success: false }) }
})
app.delete('/api/admin/users/:id', requireAdmin, async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  if (!id) return res.status(400).json({ success: false })
  const current = (req as any).user?.sub
  try {
    if (Number(current) === id) return res.status(409).json({ success: false, message: 'No puedes eliminar tu propia cuenta' })
    await db.execute(`DELETE FROM \`${USERS_TABLE}\` WHERE \`${COL_ID}\` = ? AND es_admin = 1`, [id])
    return res.status(204).send()
  } catch (_e) { return res.status(500).json({ success: false }) }
})
app.post('/api/admin/users/delete', requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.body || {}
  const numId = Number(id)
  if (!numId) return res.status(400).json({ success: false })
  const current = Number((req as any).user?.sub)
  try {
    if (current === numId) return res.status(409).json({ success: false, message: 'No puedes eliminar tu propia cuenta' })
    await db.execute(`DELETE FROM \`${USERS_TABLE}\` WHERE \`${COL_ID}\` = ? AND es_admin = 1`, [numId])
    return res.json({ success: true })
  } catch (_e) { return res.status(500).json({ success: false }) }
})
app.get('/api/cortos', async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.execute('SELECT id, titulo, clasificacion, duracionMinutos, categoria, sinopsis FROM cortos') as [RowDataPacket[], any]
    return res.json({ success: true, data: rows })
  } catch (_e) { return res.status(500).json({ success: false }) }
})
app.get('/api/cortos/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  try {
    const [rows] = await db.execute('SELECT id, titulo, clasificacion, duracionMinutos, categoria, sinopsis FROM cortos WHERE id = ?', [id]) as [RowDataPacket[], any]
    if (rows.length === 0) return res.status(404).json({ success: false })
    return res.json({ success: true, data: rows[0] })
  } catch (_e) { return res.status(500).json({ success: false }) }
})
app.get('/api/horarios', async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.execute(
      'SELECT id_funcion AS id, id_funcion AS cortoId, fecha_proyeccion AS fecha, hora_proyeccion AS horaInicio, titulo, id_sala FROM funciones'
    ) as [RowDataPacket[], any]
    return res.json({ success: true, data: rows })
  } catch (_e) { return res.status(500).json({ success: false }) }
})
app.post('/api/horarios', requireAdmin, async (req: Request, res: Response) => {
  const { titulo, fecha, horaInicio, id_sala, descripcion, duracion_minutos } = req.body || {}
  if (!titulo || !fecha || !horaInicio || !id_sala) return res.status(400).json({ success: false, message: 'Faltan campos requeridos: titulo, fecha, horaInicio, id_sala' })
  try {
    const [r]: any = await db.execute(
      'INSERT INTO funciones (titulo, descripcion, duracion_minutos, fecha_proyeccion, hora_proyeccion, id_sala) VALUES (?, ?, ?, ?, ?, ?)',
      [String(titulo), descripcion || null, duracion_minutos || null, String(fecha), String(horaInicio), Number(id_sala)]
    )
    const id = Number(r.insertId || 0)
    return res.status(201).json({ success: true, data: { id } })
  } catch (_e) { return res.status(500).json({ success: false, message: 'Error al crear el horario' }) }
})
app.put('/api/horarios/:id', requireAdmin, async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const { titulo, fecha, horaInicio, id_sala, descripcion, duracion_minutos } = req.body || {}
  if (!id) return res.status(400).json({ success: false })
  const fields: string[] = []
  const values: any[] = []
  if (titulo !== undefined) { fields.push('titulo = ?'); values.push(String(titulo)) }
  if (descripcion !== undefined) { fields.push('descripcion = ?'); values.push(descripcion || null) }
  if (duracion_minutos !== undefined) { fields.push('duracion_minutos = ?'); values.push(duracion_minutos || null) }
  if (fecha !== undefined) { fields.push('fecha_proyeccion = ?'); values.push(String(fecha)) }
  if (horaInicio !== undefined) { fields.push('hora_proyeccion = ?'); values.push(String(horaInicio)) }
  if (id_sala !== undefined) { fields.push('id_sala = ?'); values.push(Number(id_sala)) }
  if (fields.length === 0) return res.status(400).json({ success: false })
  values.push(id)
  try {
    await db.execute(`UPDATE funciones SET ${fields.join(', ')} WHERE id_funcion = ?`, values)
    return res.json({ success: true })
  } catch (_e) { return res.status(500).json({ success: false }) }
})
app.delete('/api/horarios/:id', requireAdmin, async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  if (!id) return res.status(400).json({ success: false })
  try {
    const [rows] = await db.execute('DELETE FROM funciones WHERE id_funcion = ?', [id]) as [any, any]
    return res.status(204).send()
  } catch (_e) { return res.status(500).json({ success: false }) }
})
app.get('/api/asientos', async (req: Request, res: Response) => {
  const id_horario = Number(req.query.horario || 0)
  try {
    await releaseExpiredSeats()
    if (id_horario > 0) {
      const [frows] = await db.execute('SELECT id_sala FROM funciones WHERE id_funcion = ?', [id_horario]) as [RowDataPacket[], any]
      if ((frows as RowDataPacket[]).length === 0) return res.json({ success: true, data: [] })
      const id_sala = Number((frows as RowDataPacket[])[0].id_sala)
      const [rows] = await db.execute('SELECT CONCAT(fila, columna) AS id_asiento, estado FROM asientos WHERE id_horario = ? AND id_sala = ?', [id_horario, id_sala]) as [RowDataPacket[], any]
      return res.json({ success: true, data: rows })
    }
    const [rows] = await db.execute('SELECT CONCAT(fila, columna) AS id_asiento, estado FROM asientos') as [RowDataPacket[], any]
    return res.json({ success: true, data: rows })
  } catch (_e) { return res.status(500).json({ success: false }) }
})

// CRUD de horarios de ejemplo eliminado.


// ----------------------------------------------------------------------
// LÓGICA DE BLOQUEO DE ASIENTOS - ACTIVIDAD 9
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

    const [rfun] = await connection.execute('SELECT id_sala FROM funciones WHERE id_funcion = ?', [id_horario]) as [RowDataPacket[], any]
    if ((rfun as RowDataPacket[]).length === 0) { await connection.rollback(); return res.status(400).json({ success: false }) }
    const id_sala = Number((rfun as RowDataPacket[])[0].id_sala)

    const m = String(id_asiento).match(/^([A-Za-z]+)(\d+)$/)
    const fila = m ? String(m[1]).toUpperCase() : null
    const columna = m ? Number(m[2]) : null

    const [rows] = await connection.execute(`SELECT estado, bloqueado_hasta FROM asientos WHERE id_asiento = ? AND id_horario = ? FOR UPDATE`,
      [id_asiento, id_horario]
    ) as [RowDataPacket[], any];

    if (rows.length === 0) {
      if (!fila || !Number.isFinite(columna)) { await connection.rollback(); return res.status(400).json({ success: false }) }
      await connection.execute(
        `INSERT INTO asientos (id_asiento, fila, columna, id_sala, estado, id_horario, bloqueado_hasta) VALUES (?, ?, ?, ?, 'bloqueado', ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))`,
        [id_asiento, fila, columna, id_sala, id_horario]
      );
      await connection.commit();
      return res.status(200).json({ success: true, message: 'Asiento creado y bloqueado.' });
    }

    const asientoActual = rows[0];
    const estado = String(asientoActual.estado || 'libre');
    const bh = asientoActual.bloqueado_hasta ? new Date(asientoActual.bloqueado_hasta as Date) : null;
    const expirado = estado === 'bloqueado' && bh !== null && bh.getTime() < Date.now();

    if (estado === 'libre' || expirado) {
      await connection.execute(
        `UPDATE asientos SET estado = 'bloqueado', id_sala = ?, id_horario = ?, bloqueado_hasta = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id_asiento = ? AND id_horario = ?`,
        [id_sala, id_horario, id_asiento, id_horario]
      );
    } else {
      await connection.rollback();
      return res.status(409).json({ success: false, message: `Asiento ya está ${estado}. Doble venta evitada.` });
    }

    await connection.commit();

    res.status(200).json({
      success: true,
      message: 'Asiento bloqueado exitosamente.',
      data: { id_asiento, id_horario, estado: 'bloqueado' }
    });

  } catch (_error) { // <-- Suprime el error de '_error' no usado
    if (connection) {
        await connection.rollback(); 
    }
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/reservas/liberar', async (req: Request, res: Response) => {
  const { id_asiento, id_horario } = req.body;
  let connection: mysql.PoolConnection | undefined;

  if (!id_asiento || !id_horario) {
    return res.status(400).json({ success: false });
  }

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      `SELECT estado FROM asientos WHERE id_asiento = ? AND id_horario = ? FOR UPDATE`,
      [id_asiento, id_horario]
    ) as [RowDataPacket[], any];

    if ((rows as RowDataPacket[]).length === 0) {
      await connection.commit();
      return res.json({ success: true });
    }

    const estado = String(rows[0].estado || 'libre');
    if (estado === 'bloqueado') {
      await connection.execute(
        `UPDATE asientos SET estado = 'libre', bloqueado_hasta = NULL WHERE id_asiento = ? AND id_horario = ?`,
        [id_asiento, id_horario]
      );
      await connection.commit();
      return res.json({ success: true });
    }
    await connection.rollback();
    return res.status(409).json({ success: false });
  } catch (_e) {
    if (connection) {
      await connection.rollback();
    }
    return res.status(500).json({ success: false });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/reservas/bloquear-multiple', async (req: Request, res: Response) => {
  const { seats, id_horario } = req.body as { seats: string[]; id_horario: number };
  let connection: mysql.PoolConnection | undefined;
  if (!Array.isArray(seats) || seats.length === 0 || !id_horario) return res.status(400).json({ success: false });

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [rfun] = await connection.execute('SELECT id_sala FROM funciones WHERE id_funcion = ?', [id_horario]) as [RowDataPacket[], any]
    if ((rfun as RowDataPacket[]).length === 0) { await connection.rollback(); return res.status(400).json({ success: false }) }
    const id_sala = Number((rfun as RowDataPacket[])[0].id_sala)

    const expireAt = new Date(Date.now() + 15 * 60 * 1000)
    const expireAtStr = expireAt.toISOString().slice(0,19).replace('T',' ')

    const conflicts: string[] = []

    for (const id_asiento of seats) {
      const m = String(id_asiento).match(/^([A-Za-z]+)(\d+)$/)
      const fila = m ? String(m[1]).toUpperCase() : null
      const columna = m ? Number(m[2]) : null
      if (!fila || !Number.isFinite(columna)) { conflicts.push(id_asiento); continue }

      const [rows] = await connection.execute(
        `SELECT estado, bloqueado_hasta FROM asientos WHERE id_asiento = ? AND id_horario = ? FOR UPDATE`,
        [id_asiento, id_horario]
      ) as [RowDataPacket[], any]

      if ((rows as RowDataPacket[]).length === 0) {
        await connection.execute(
          `INSERT INTO asientos (id_asiento, fila, columna, id_sala, estado, id_horario, bloqueado_hasta) VALUES (?, ?, ?, ?, 'bloqueado', ?, ?)`,
          [id_asiento, fila, columna, id_sala, id_horario, expireAtStr]
        )
        continue
      }

      const row = (rows as RowDataPacket[])[0]
      const estado = String(row.estado || 'libre')
      const bh = row.bloqueado_hasta ? new Date(row.bloqueado_hasta as Date) : null
      const expirado = estado === 'bloqueado' && bh !== null && bh.getTime() < Date.now()

      if (estado === 'libre' || expirado) {
        await connection.execute(
          `UPDATE asientos SET estado = 'bloqueado', id_sala = ?, bloqueado_hasta = ? WHERE id_asiento = ? AND id_horario = ?`,
          [id_sala, expireAtStr, id_asiento, id_horario]
        )
      } else {
        conflicts.push(id_asiento)
      }
    }

    if (conflicts.length > 0) {
      await connection.rollback()
      return res.status(409).json({ success: false, conflicts })
    }

    await connection.commit()
    return res.json({ success: true, expire_at: expireAtStr })

  } catch (_e) {
    if (connection) await connection.rollback()
    return res.status(500).json({ success: false })
  } finally {
    if (connection) connection.release()
  }
})


// Inicio del Servidor
app.listen(PORT, () => {
  // Eliminado console.log para pasar el linting
});
