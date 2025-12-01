import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 8000;
// Middlewares
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
app.use(express.json()); // Middleware para leer el cuerpo de las peticiones en formato JSON
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
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const USERS_TABLE = 'usuarios';
const COL_ID = 'id_usuario';
const COL_NAME = 'nombre';
const COL_EMAIL = 'email';
const COL_PWHASH = 'password';
try {
    await db.execute('DROP TABLE IF EXISTS `users`');
}
catch (_e) { }
async function ensureAsientosBlockColumn() {
    try {
        const [cols] = await db.query('SHOW COLUMNS FROM `asientos`');
        const names = new Set(cols.map((r) => String(r.Field)));
        if (!names.has('bloqueado_hasta')) {
            await db.execute('ALTER TABLE `asientos` ADD COLUMN `bloqueado_hasta` DATETIME NULL');
        }
    }
    catch (_e) { }
}
ensureAsientosBlockColumn();
async function releaseExpiredSeats() {
    try {
        await db.execute("UPDATE `asientos` SET `estado`='libre', `id_horario`=NULL WHERE `estado`='bloqueado' AND `bloqueado_hasta` IS NOT NULL AND `bloqueado_hasta` < NOW()");
    }
    catch (_e) { }
}
setInterval(releaseExpiredSeats, 60000);
// Datos en Memoria (Simulación para CRUD en Horarios)
const hoy = new Date().toISOString().split('T')[0];
const cortos = [
    { id: 1, titulo: 'Corto Astronomía', director: 'Equipo Planetario', duracionMinutos: 15, sinopsis: 'Introducción a las constelaciones', clasificacion: 'A', categoria: 'Divulgación', trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', lanzamiento: hoy },
    { id: 2, titulo: 'Ciencia y Universo', director: 'Equipo Planetario', duracionMinutos: 20, sinopsis: 'Viaje por el sistema solar', clasificacion: 'A', categoria: 'Educativo', trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', lanzamiento: hoy }
];
const _horarios = [
    { id: 1, cortoId: 1, fecha: hoy, horaInicio: '10:00:00', horaFin: '10:15:00', sala: 'Sala 1', precioEntrada: 50, capacidadDisponible: 30 },
    { id: 2, cortoId: 1, fecha: hoy, horaInicio: '12:00:00', horaFin: '12:15:00', sala: 'Sala 1', precioEntrada: 50, capacidadDisponible: 30 },
    { id: 3, cortoId: 2, fecha: hoy, horaInicio: '14:00:00', horaFin: '14:20:00', sala: 'Sala 2', precioEntrada: 50, capacidadDisponible: 30 }
];
const _noticias = [
    { id: 1, titulo: 'Nueva proyección inmersiva', resumen: 'Experiencia 360° en el domo.', fechaPublicacion: hoy },
    { id: 2, titulo: 'Semana de astronomía', resumen: 'Charlas y cortos especiales.', fechaPublicacion: hoy }
];
// ----------------------------------------------------------------------
// RUTAS GET Y CRUD PARA HORARIOS (ACTIVIDAD 8)
// ----------------------------------------------------------------------
app.get('/api/test', (_req, res) => { res.json({ ok: true, message: 'API lista' }); });
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password)
        return res.status(400).json({ success: false, message: 'Campos incompletos' });
    try {
        const [rows] = await db.execute(`SELECT \`${COL_ID}\` as id FROM \`${USERS_TABLE}\` WHERE \`${COL_EMAIL}\` = ?`, [email]);
        if (rows.length > 0)
            return res.status(409).json({ success: false, message: 'Correo ya registrado' });
        const hash = await bcrypt.hash(String(password), 10);
        await db.execute(`INSERT INTO \`${USERS_TABLE}\` (\`${COL_NAME}\`, \`${COL_EMAIL}\`, \`${COL_PWHASH}\`, es_admin) VALUES (?, ?, ?, 0)`, [name, email, hash]);
        return res.json({ success: true });
    }
    catch (_e) {
        return res.status(500).json({ success: false, message: 'Error al registrar' });
    }
});
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password)
        return res.status(400).json({ success: false, message: 'Campos incompletos' });
    try {
        const [rows] = await db.execute(`SELECT \`${COL_ID}\` as id, \`${COL_NAME}\` as name, \`${COL_EMAIL}\` as email, \`${COL_PWHASH}\` as password_hash, es_admin FROM \`${USERS_TABLE}\` WHERE \`${COL_EMAIL}\` = ?`, [email]);
        if (rows.length === 0)
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        const user = rows[0];
        const stored = String(user.password_hash);
        const isHash = stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$');
        const ok = isHash ? await bcrypt.compare(String(password), stored) : stored === String(password);
        if (!isHash && ok) {
            const newHash = await bcrypt.hash(String(password), 10);
            await db.execute(`UPDATE \`${USERS_TABLE}\` SET \`${COL_PWHASH}\` = ? WHERE \`${COL_ID}\` = ?`, [newHash, user.id]);
        }
        if (!ok)
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        const token = jwt.sign({ sub: user.id, email: user.email, name: user.name, admin: user.es_admin === 1 }, JWT_SECRET, { expiresIn: '2h' });
        return res.json({ success: true, token });
    }
    catch (_e) {
        return res.status(500).json({ success: false, message: 'Error al iniciar sesión' });
    }
});
function readToken(req) {
    const h = String(req.headers.authorization || '');
    const parts = h.split(' ');
    if (parts[0] === 'Bearer' && parts[1])
        return parts[1];
    return '';
}
app.get('/api/auth/me', async (req, res) => {
    const t = readToken(req);
    if (!t)
        return res.status(401).json({ success: false });
    try {
        const payload = jwt.verify(t, JWT_SECRET);
        const id = Number(payload.sub);
        const [rows] = await db.execute(`SELECT \`${COL_ID}\` as id, \`${COL_NAME}\` as name, \`${COL_EMAIL}\` as email, es_admin FROM \`${USERS_TABLE}\` WHERE \`${COL_ID}\` = ?`, [id]);
        if (rows.length === 0)
            return res.status(404).json({ success: false });
        const u = rows[0];
        return res.json({ success: true, data: { id: u.id, name: u.name, email: u.email, admin: u.es_admin === 1 } });
    }
    catch {
        return res.status(401).json({ success: false });
    }
});
app.put('/api/auth/me', async (req, res) => {
    const t = readToken(req);
    if (!t)
        return res.status(401).json({ success: false });
    try {
        const payload = jwt.verify(t, JWT_SECRET);
        const id = Number(payload.sub);
        const { name, password } = req.body || {};
        const fields = [];
        const values = [];
        if (name) {
            fields.push(`\`${COL_NAME}\` = ?`);
            values.push(String(name));
        }
        if (password) {
            const hash = await bcrypt.hash(String(password), 10);
            fields.push(`\`${COL_PWHASH}\` = ?`);
            values.push(hash);
        }
        if (fields.length === 0)
            return res.status(400).json({ success: false });
        values.push(id);
        await db.execute(`UPDATE \`${USERS_TABLE}\` SET ${fields.join(', ')} WHERE \`${COL_ID}\` = ?`, values);
        const token = jwt.sign({ sub: id, email: payload.email, name: name || payload.name, admin: payload.admin }, JWT_SECRET, { expiresIn: '2h' });
        return res.json({ success: true, token });
    }
    catch {
        return res.status(401).json({ success: false });
    }
});
app.get('/api/cortos', (_req, res) => res.json({ success: true, data: cortos }));
app.get('/api/horarios', (_req, res) => res.json({ success: true, data: _horarios }));
app.get('/api/asientos', async (req, res) => {
    const id_horario = Number(req.query.horario || 0);
    try {
        await releaseExpiredSeats();
        if (id_horario > 0) {
            const [rows] = await db.execute('SELECT id_asiento, estado FROM asientos WHERE id_horario = ?', [id_horario]);
            return res.json({ success: true, data: rows });
        }
        const [rows] = await db.execute('SELECT id_asiento, estado FROM asientos');
        return res.json({ success: true, data: rows });
    }
    catch (_e) {
        return res.status(500).json({ success: false });
    }
});
// POST: Crear Nuevo Horario (Actividad 8)
app.post('/api/horarios', (req, res) => {
    const { id: ignoredId, ...datosSinId } = req.body; // <-- CORRECCIÓN #2: Usamos ignoredId para ignorar la variable 'id'
    const nuevoHorarioData = datosSinId;
    if (!nuevoHorarioData.cortoId || !nuevoHorarioData.fecha || !nuevoHorarioData.horaInicio || !nuevoHorarioData.sala) {
        return res.status(400).json({ success: false, message: 'Faltan campos obligatorios para el nuevo horario.' });
    }
    // Lógica de generación de ID y adición al array
    const nuevoId = _horarios.length > 0 ? Math.max(..._horarios.map(h => h.id)) + 1 : 1;
    const nuevoHorario = {
        ...datosSinId,
        cortoId: Number(nuevoHorarioData.cortoId),
        precioEntrada: Number(nuevoHorarioData.precioEntrada || 0),
        capacidadDisponible: Number(nuevoHorarioData.capacidadDisponible || 0),
        id: nuevoId,
    };
    _horarios.push(nuevoHorario);
    res.status(201).json({ success: true, data: nuevoHorario });
});
// PUT: Actualizar Horario Existente
app.put('/api/horarios/:id', (req, res) => {
    const id = Number(req.params.id);
    const datosNuevos = req.body;
    const index = _horarios.findIndex(h => h.id === id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Horario no encontrado para actualizar.' });
    }
    const horarioActualizado = {
        ..._horarios[index],
        ...datosNuevos,
        cortoId: datosNuevos.cortoId !== undefined ? Number(datosNuevos.cortoId) : _horarios[index].cortoId,
        precioEntrada: datosNuevos.precioEntrada !== undefined ? Number(datosNuevos.precioEntrada) : _horarios[index].precioEntrada,
        capacidadDisponible: datosNuevos.capacidadDisponible !== undefined ? Number(datosNuevos.capacidadDisponible) : _horarios[index].capacidadDisponible,
    };
    _horarios[index] = horarioActualizado;
    res.status(200).json({ success: true, data: horarioActualizado });
});
// DELETE: Eliminar Horario
app.delete('/api/horarios/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = _horarios.findIndex(h => h.id === id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Horario no encontrado para eliminar.' });
    }
    _horarios.splice(index, 1);
    res.status(204).send(); // 204 No Content: éxito en la eliminación
});
// ----------------------------------------------------------------------
// LÓGICA DE BLOQUEO DE ASIENTOS - ACTIVIDAD 9
// ----------------------------------------------------------------------
app.post('/api/reservas/bloquear', async (req, res) => {
    const { id_asiento, id_horario } = req.body;
    let connection;
    if (!id_asiento || !id_horario) {
        return res.status(400).json({ success: false, message: 'Faltan campos: id_asiento o id_horario.' });
    }
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();
        // 2. VERIFICAR EL ESTADO Y BLOQUEAR CON FOR UPDATE
        const [rows] = await connection.execute(`SELECT estado FROM asientos WHERE id_asiento = ? FOR UPDATE`, [id_asiento]);
        if (rows.length === 0) {
            await connection.execute(`INSERT INTO asientos (id_asiento, estado, id_horario, bloqueado_hasta) VALUES (?, 'bloqueado', ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`, [id_asiento, id_horario]);
            await connection.commit();
            return res.status(200).json({ success: true, message: 'Asiento creado y bloqueado.' });
        }
        const asientoActual = rows[0];
        if (String(asientoActual.estado) !== 'libre') {
            await connection.rollback();
            return res.status(409).json({ success: false, message: `Asiento ya está ${asientoActual.estado}. Doble venta evitada.` });
        }
        // 4. ACTUALIZAR ESTADO A BLOQUEADO
        await connection.execute(`UPDATE asientos SET estado = 'bloqueado', id_horario = ?, bloqueado_hasta = DATE_ADD(NOW(), INTERVAL 10 MINUTE) WHERE id_asiento = ?`, [id_horario, id_asiento]);
        await connection.commit();
        res.status(200).json({
            success: true,
            message: 'Asiento bloqueado exitosamente.',
            data: { id_asiento, id_horario, estado: 'bloqueado' }
        });
    }
    catch (_error) { // <-- Suprime el error de '_error' no usado
        if (connection) {
            await connection.rollback();
        }
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
    finally {
        if (connection)
            connection.release();
    }
});
// Inicio del Servidor
app.listen(PORT, () => {
    // Eliminado console.log para pasar el linting
});
