import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 8000

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())

const hoy = new Date().toISOString().split('T')[0]
const cortos = [
  { id: 1, titulo: 'Corto Astronomía', director: 'Equipo Planetario', duracionMinutos: 15, sinopsis: 'Introducción a las constelaciones', clasificacion: 'A', categoria: 'Divulgación', trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', lanzamiento: hoy },
  { id: 2, titulo: 'Ciencia y Universo', director: 'Equipo Planetario', duracionMinutos: 20, sinopsis: 'Viaje por el sistema solar', clasificacion: 'A', categoria: 'Educativo', trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', lanzamiento: hoy }
]
const horarios = [
  { id: 1, cortoId: 1, fecha: hoy, horaInicio: '10:00:00', horaFin: '10:15:00', sala: 'Sala 1', precioEntrada: 50, capacidadDisponible: 30 },
  { id: 2, cortoId: 1, fecha: hoy, horaInicio: '12:00:00', horaFin: '12:15:00', sala: 'Sala 1', precioEntrada: 50, capacidadDisponible: 30 },
  { id: 3, cortoId: 2, fecha: hoy, horaInicio: '14:00:00', horaFin: '14:20:00', sala: 'Sala 2', precioEntrada: 50, capacidadDisponible: 30 }
]
const noticias = [
  { id: 1, titulo: 'Nueva proyección inmersiva', resumen: 'Experiencia 360° en el domo.', fechaPublicacion: hoy },
  { id: 2, titulo: 'Semana de astronomía', resumen: 'Charlas y cortos especiales.', fechaPublicacion: hoy }
]

app.get('/api/test', (req, res) => {
  res.json({ ok: true, message: 'API lista' })
})

app.get('/api/cortos', (req, res) => res.json({ success: true, data: cortos }))
app.get('/api/cortos/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const c = cortos.find(x => x.id === id)
  if (!c) return res.status(404).json({ success: false })
  res.json({ success: true, data: c })
})
app.get('/api/horarios', (req, res) => res.json({ success: true, data: horarios }))
app.get('/api/noticias', (req, res) => res.json({ success: true, data: noticias }))

app.listen(PORT, () => {
  console.log(`Servidor backend en puerto ${PORT}`)
})
