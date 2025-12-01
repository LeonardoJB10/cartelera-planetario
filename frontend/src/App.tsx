import './App.css'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, useLocation, Navigate } from 'react-router-dom'
import jsPDF from 'jspdf'
import { MdEventSeat, MdPerson, MdShoppingCart, MdAdd, MdRemove, MdClose } from 'react-icons/md'
import { FaFacebook } from 'react-icons/fa'
const API = 'http://localhost:8000'
const api = axios.create({ baseURL: 'http://localhost:8000/api' })

function Header() {
  const loc = useLocation()
  const navigate = useNavigate()
  const isAuth = loc.pathname === '/login' || loc.pathname === '/register'
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
  let user: { name: string } | null = null
  let isAdmin = false
  if (token) {
    try {
      const base = token.split('.')[1] || ''
      const json = JSON.parse(atob(base.replace(/-/g, '+').replace(/_/g, '/')))
      if (json && json.name) user = { name: String(json.name) }
      if (json && typeof json.admin !== 'undefined') isAdmin = !!json.admin
    } catch { user = null }
  }
  const doLogout = () => {
    if (typeof window !== 'undefined') localStorage.removeItem('auth_token')
    navigate('/login')
  }
  void navigate
  return (
    <header className={`HeaderBar ${isAuth ? 'red' : ''}`}>
      <div className="HeaderInner">
        <div className="LogoArea">
          <div className="LogoBrand">
            <div className="LogoMark">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M2 20h20v-6a10 10 0 0 0-20 0v6z" />
                <rect x="6" y="16" width="12" height="2" rx="1" />
              </svg>
            </div>
            <div className="LogoText">
              <div className="LogoTitle">Planetario Sayab</div>
              <div className="LogoSub">Playa del Carmen</div>
            </div>
          </div>
        </div>
        <nav className="Nav">
          <Link className="ActionLink" to="/">Noticias</Link>
          {isAdmin && <Link className="ActionLink" to="/admin">Admin</Link>}
          {user ? (
            <>
              <Link className="ActionLink" to="/perfil" aria-label="Perfil"><MdPerson size={18} /></Link>
              <button className="ActionLink" onClick={doLogout}>Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link className="ActionLink" to="/login">Iniciar sesión</Link>
              <Link className="ActionLink" to="/register">Registro</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

function Hero() {
  const slides = [
    {
      title: 'Directo al corazón',
      desc: 'Entre soledad y confusión, Agnes intenta recuperar ritmo y claridad, buscando un nuevo inicio.',
      poster: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Blue_Gradient.png'
    },
    {
      title: 'Ventana al Universo',
      desc: 'Observa imágenes del cosmos y descubre cómo se forman las estrellas y galaxias.',
      poster: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/HubbleUltraDeepField.jpg'
    },
    {
      title: 'Auroras Boreales',
      desc: 'Fenómenos luminosos que pintan el cielo nocturno con colores y movimiento.',
      poster: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Polarlicht_2.jpg'
    }
  ]
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % slides.length), 4500)
    return () => clearInterval(id)
  }, [slides.length])
  const s = slides[index]
  return (
    <section className="Hero hero-red">
      <div className="HeroInner">
        <div>
          <h1 className="HeroTitle Large">{s.title}</h1>
          <p className="HeroText">{s.desc}</p>
          <Link className="PrimaryBtn" to="/comprar/1">Adquiere tickets</Link>
        </div>
        <div className="PosterWrap">
          <div className="PosterCard">
            <img className="PosterImg" src={s.poster} alt={s.title} loading="lazy" />
          </div>
        </div>
      </div>
      
      <div className="Dots">
        {slides.map((_, i) => (
          <span key={i} className={`Dot ${i === index ? 'active' : ''}`} />
        ))}
      </div>
    </section>
  )
}


function Actions() {
  return (
    <div className="Page">
      <h2 className="SectionTitle">¿Qué puedes hacer aquí?</h2>
      <div className="Grid">
        {[
          { title: 'Consultar Horarios', text: 'Revisa la programación actualizada de funciones y horarios de proyección.', icon: '🗓️' },
          { title: 'Explorar Cortos', text: 'Descubre nuestra colección de cortos educativos y entretenidos.', icon: '▶' },
          { title: 'Leer Noticias', text: 'Mantente informado sobre las últimas novedades del planetario.', icon: '📰' },
        ].map((a, i) => (
          <div key={i} className="Card">
            <div className="ActionIcon">{a.icon}</div>
            <h3 className="ActionTitle">{a.title}</h3>
            <p className="ActionText">{a.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export interface HorarioDashboard { id: number; fecha: string; id_sala: number }
type MovieItem = { id: number; title: string; status: string; statusColor: string; rating: string; ratingColor: string; mins: number; poster: string; genres: string; synopsis: string }

export function Dashboard() {
  const [horarios, setHorarios] = useState<HorarioDashboard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState<{ titulo: string; fecha: string; horaInicio: string; id_sala: string; descripcion?: string; duracion_minutos?: string }>({ titulo: '', fecha: '', horaInicio: '', id_sala: '' })
  const [editId, setEditId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<{ titulo?: string; fecha?: string; horaInicio?: string; id_sala?: string; descripcion?: string; duracion_minutos?: string }>({})
  const [adminForm, setAdminForm] = useState<{ name: string; email: string; password: string }>({ name: '', email: '', password: '' })
  const [activeTab, setActiveTab] = useState('horarios' as 'horarios' | 'admins')
  const [admins, setAdmins] = useState<{ id: number; name: string; email: string }[]>([])

  const fetchHorarios = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/horarios')
      setHorarios((res.data?.data ?? []) as HorarioDashboard[])
    } catch {
      setError('No se pudo cargar los horarios')
    } finally {
      setLoading(false)
    }
  }

  const fetchAdmins = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
      const res = await api.get('/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      setAdmins((res.data?.data ?? []) as { id: number; name: string; email: string }[])
    } catch {
      setError('No se pudo cargar administradores')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchHorarios() }, [])
  useEffect(() => { if (activeTab === 'admins') fetchAdmins() }, [activeTab])

  const handleDelete = async (id: number) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
      await api.delete(`/horarios/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      setHorarios(prev => prev.filter(h => h.id !== id))
    } catch {
      setError('No se pudo eliminar el horario')
    }
  }

  const handleCreate = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
    try {
      await api.post('/horarios', { titulo: form.titulo, fecha: form.fecha, horaInicio: form.horaInicio, id_sala: Number(form.id_sala), descripcion: form.descripcion || undefined, duracion_minutos: form.duracion_minutos ? Number(form.duracion_minutos) : undefined }, { headers: { Authorization: `Bearer ${token}` } })
      setShowCreate(false)
      setForm({ titulo: '', fecha: '', horaInicio: '', id_sala: '' })
      fetchHorarios()
    } catch {
      setError('No se pudo crear el horario')
    }
  }

  const handleEdit = async () => {
    if (editId === null) return
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
    try {
      await api.put(`/horarios/${editId}`, { ...editForm, id_sala: editForm.id_sala ? Number(editForm.id_sala) : undefined }, { headers: { Authorization: `Bearer ${token}` } })
      setEditId(null)
      setEditForm({})
      fetchHorarios()
    } catch {
      setError('No se pudo editar el horario')
    }
  }

  const handleCreateAdmin = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
    try {
      await api.post('/admin/users', adminForm, { headers: { Authorization: `Bearer ${token}` } })
      setAdminForm({ name: '', email: '', password: '' })
      fetchAdmins()
      alert('Administrador creado')
    } catch {
      setError('No se pudo crear el administrador')
    }
  }

  return (
    <div className="AdminLayout">
      <aside className="AdminSidebar">
        <div className="AdminSubtitle">Panel</div>
        <div className="AdminNav">
          <button className={`AdminNavBtn ${activeTab==='horarios'?'active':''}`} onClick={() => setActiveTab('horarios')}>Horarios</button>
          <button className={`AdminNavBtn ${activeTab==='admins'?'active':''}`} onClick={() => setActiveTab('admins')}>Administradores</button>
        </div>
      </aside>
      <div className="AdminContent">
        <div className="AdminHeader">
          <h1 className="AdminTitle">Panel de Administración</h1>
          <div className="AdminActions">
            {activeTab==='horarios' && <button className="Primary" onClick={() => setShowCreate(true)}>Crear Nueva Función</button>}
          </div>
        </div>

        {loading && <p>Cargando...</p>}
        {error && <p className="Error">{error}</p>}

        {activeTab==='horarios' && showCreate && (
        <div className="Card">
          <div className="FormRow">
            <input className="TextInput" placeholder="Título" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
          </div>
          <div className="FormRow">
            <input className="TextInput" placeholder="Fecha (YYYY-MM-DD)" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
          </div>
          <div className="FormRow">
            <input className="TextInput" placeholder="Hora (HH:MM:SS)" value={form.horaInicio} onChange={(e) => setForm({ ...form, horaInicio: e.target.value })} />
          </div>
          <div className="FormRow">
            <input className="TextInput" placeholder="Sala" value={form.id_sala} onChange={(e) => setForm({ ...form, id_sala: e.target.value })} />
          </div>
          <div className="FormRow">
            <input className="TextInput" placeholder="Descripción (opcional)" value={form.descripcion || ''} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <div className="FormRow">
            <input className="TextInput" placeholder="Duración (min, opcional)" value={form.duracion_minutos || ''} onChange={(e) => setForm({ ...form, duracion_minutos: e.target.value })} />
          </div>
          <div className="FormActions">
            <button className="SubmitBtn" onClick={handleCreate}>Guardar</button>
            <button className="SecondaryBtn" onClick={() => setShowCreate(false)}>Cancelar</button>
          </div>
        </div>
      )}
      {activeTab==='horarios' && (
      <table className="Table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Sala</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {horarios.map(h => (
            <tr key={h.id}>
              <td>{h.id}</td>
              <td>{h.fecha}</td>
              <td>{h.id_sala}</td>
              <td>
                <button onClick={() => { setEditId(h.id); setEditForm({}) }}>Editar (PUT)</button>
                <button onClick={() => handleDelete(h.id)}>Eliminar (DELETE)</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      )}

      {activeTab==='horarios' && editId !== null && (
        <div className="Card">
          <div className="FormRow">
            <input className="TextInput" placeholder="Título" value={editForm.titulo || ''} onChange={(e) => setEditForm({ ...editForm, titulo: e.target.value })} />
          </div>
          <div className="FormRow">
            <input className="TextInput" placeholder="Fecha (YYYY-MM-DD)" value={editForm.fecha || ''} onChange={(e) => setEditForm({ ...editForm, fecha: e.target.value })} />
          </div>
          <div className="FormRow">
            <input className="TextInput" placeholder="Hora (HH:MM:SS)" value={editForm.horaInicio || ''} onChange={(e) => setEditForm({ ...editForm, horaInicio: e.target.value })} />
          </div>
          <div className="FormRow">
            <input className="TextInput" placeholder="Sala" value={editForm.id_sala || ''} onChange={(e) => setEditForm({ ...editForm, id_sala: e.target.value })} />
          </div>
          <div className="FormRow">
            <input className="TextInput" placeholder="Descripción (opcional)" value={editForm.descripcion || ''} onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })} />
          </div>
          <div className="FormRow">
            <input className="TextInput" placeholder="Duración (min, opcional)" value={editForm.duracion_minutos || ''} onChange={(e) => setEditForm({ ...editForm, duracion_minutos: e.target.value })} />
          </div>
          <div className="FormActions">
            <button className="SubmitBtn" onClick={handleEdit}>Guardar cambios</button>
            <button className="SecondaryBtn" onClick={() => { setEditId(null); setEditForm({}) }}>Cancelar</button>
          </div>
        </div>
      )}

      {activeTab==='admins' && (
      <div>
        <div className="Card">
          <div className="FormRow">
            <input className="TextInput" placeholder="Nombre" value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} />
          </div>
          <div className="FormRow">
            <input className="TextInput" placeholder="Correo" type="email" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} />
          </div>
          <div className="FormRow">
            <input className="TextInput" placeholder="Contraseña" type="password" value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} />
          </div>
          <div className="FormActions">
            <button className="SubmitBtn" onClick={handleCreateAdmin}>Crear administrador</button>
          </div>
        </div>
        <table className="Table" style={{ marginTop: 12 }}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(a => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{a.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
      </div>
    </div>
  )
}

function Catalog() {
  const [tab, setTab] = useState('cartelera' as 'cartelera' | 'horarios')
  const [items, setItems] = useState(ITEMS.map((it, i) => ({ id: i + 1, ...it })) as MovieItem[])
  const [horarios, setHorarios] = useState([] as { id: number; cortoId: number; fecha: string; horaInicio: string; horaFin: string; sala: string; precioEntrada: number; capacidadDisponible: number }[])
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`${API}/api/cortos`)
        const json: { success: boolean; data: { id: number; titulo: string; clasificacion?: string; duracionMinutos?: number; categoria?: string; sinopsis?: string }[] } = await res.json()
        if (json && json.success && Array.isArray(json.data)) {
          const posters = [
            'https://upload.wikimedia.org/wikipedia/commons/c/c3/Solar_sys8.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/6/60/Polarlicht_2.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/4/47/Carina_Nebula.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/5/5f/HubbleUltraDeepField.jpg',
          ]
          const mapped: MovieItem[] = json.data.map((c, i) => ({
            id: c.id,
            title: c.titulo,
            status: 'En Cartelera',
            statusColor: 'green',
            rating: c.clasificacion || 'A',
            ratingColor: (c.clasificacion === 'B' ? 'yellow' : 'green'),
            mins: c.duracionMinutos || 10,
            poster: posters[i % posters.length],
            genres: c.categoria || 'Divulgación',
            synopsis: c.sinopsis || '',
          }))
          setItems(mapped)
        }
      } catch { void 0 }
      try {
        const res2 = await fetch(`${API}/api/horarios`)
        const json2: { success: boolean; data: { id: number; cortoId: number; fecha: string; horaInicio: string; horaFin: string; sala: string; precioEntrada: number; capacidadDisponible: number }[] } = await res2.json()
        if (json2 && json2.success && Array.isArray(json2.data)) setHorarios(json2.data)
      } catch { void 0 }
    })()
  }, [])
  return (
    <div className="Page">
      <div className="Tabs">
        <a className={`Tab ${tab === 'cartelera' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setTab('cartelera') }}>Cartelera</a>
        <a className={`Tab ${tab === 'horarios' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setTab('horarios') }}>Horarios</a>
      </div>
      {tab === 'cartelera' ? (
        <div className="Grid MoviesGrid">
          {items.map((m) => (
            <div key={m.id} className="Card Movie">
              <div className="MovieMedia">
                <img className="MoviePoster" src={m.poster} alt={m.title} loading="lazy" />
              </div>
              <div className="MovieBody">
                <div className="MovieChips">
                  <span className={`Chip rating ${m.ratingColor}`}>{m.rating}</span>
                  <span className="Chip time">{m.mins} min</span>
                  <span className={`Chip status ${m.statusColor}`}>{m.status}</span>
                </div>
                <h3 className="MovieTitle">{m.title}</h3>
                <Link className="FootLink" to={`/detalle/${m.id}`}>Ver detalle</Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="ScheduleList">
          {items.map((m) => (
            <div key={m.id} className="ScheduleItem">
              <div className="SchedulePoster">
                <img className="MoviePoster" src={m.poster} alt={m.title} loading="lazy" />
              </div>
              <div className="ScheduleRight">
                <div className="MovieChips">
                  <span className={`Chip rating ${m.ratingColor}`}>{m.rating}</span>
                  <span className="Chip time">{m.mins} min</span>
                 <span className={`Chip status ${m.statusColor}`}>{m.status}</span>
                </div>
                <h3 className="ScheduleTitle">{m.title}</h3>
                <Link className="FootLink" to={`/detalle/${m.id}`}>Ver detalle</Link>
                <div className="TimesLang">Español</div>
                <div className="TimesRow">
                  {horarios.filter(h => h.cortoId === m.id).map((h, idx2) => {
                    const [hh, mm] = h.horaInicio.split(':')
                    const hour = Number(hh)
                    const ampm = hour >= 12 ? 'p.m.' : 'a.m.'
                    const displayHour = hour % 12 === 0 ? 12 : hour % 12
                    const timeText = `${displayHour}:${mm} ${ampm}`
                    return (
                      <Link key={idx2} className="TimeChip" to={`/comprar/${m.id}?t=${encodeURIComponent(timeText)}`}>
                        <span className="TimeText">{timeText}</span>
                        <span className="SeatBadge"><MdEventSeat size={16} /></span>
                      </Link>
                    )
                  })}
                </div>
                <a className="FootLink" href="#">Horarios en otros cines →</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Detail() {
  const { id } = useParams()
  const numId = Number(id)
  const [m, setM] = useState<{ id: number; title: string; status: string; statusColor: string; rating: string; ratingColor: string; mins: number; poster: string; genres: string; synopsis: string }>(() => ({ id: 1, ...ITEMS[0] }))
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`${API}/api/cortos/${numId}`)
        const json: { success: boolean; data?: { id: number; titulo: string; clasificacion?: string; duracionMinutos?: number; categoria?: string; sinopsis?: string } } = await res.json()
        if (json && json.success && json.data) {
          const posters = [
            'https://upload.wikimedia.org/wikipedia/commons/c/c3/Solar_sys8.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/6/60/Polarlicht_2.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/4/47/Carina_Nebula.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/5/5f/HubbleUltraDeepField.jpg',
          ]
          const poster = posters[(json.data.id - 1) % posters.length]
          setM({ id: json.data.id, title: json.data.titulo, status: 'En Cartelera', statusColor: 'green', rating: json.data.clasificacion || 'A', ratingColor: (json.data.clasificacion === 'B' ? 'yellow' : 'green'), mins: json.data.duracionMinutos || 10, poster, genres: json.data.categoria || 'Divulgación', synopsis: json.data.sinopsis || '' })
        }
      } catch { void 0 }
    })()
  }, [numId])
  const navigate = useNavigate()
  return (
    <div>
      <section className="DetailHero">
        <div className="BackTop">
          <button className="BackBtn" onClick={() => navigate(-1)}>← Atrás</button>
        </div>
        <div className="DetailBackdrop" style={{ backgroundImage: `url(${m.poster})` }} />
        <div className="Page DetailInner">
          <div className="DetailPoster">
            <img className="MoviePoster" src={m.poster} alt={m.title} loading="lazy" />
          </div>
          <div className="DetailContent">
            <div className="Badge">{m.status}</div>
            <h1 className="DetailTitle">{m.title}</h1>
            <div className="DetailMeta">
              <span className={`Chip rating ${m.ratingColor}`}>{m.rating}</span>
              <span className="DotSep">•</span>
              <span className="Chip time">{m.mins} min</span>
            </div>
            <div className="CTAGroup">
              <Link className="PrimaryBtn" to={(localStorage.getItem('auth_token') ? `/comprar/${Number.isFinite(numId) ? numId : 1}` : '/login')}>Comprar boletos</Link>
              <button className="OutlineBtn">Ver tráiler</button>
            </div>
          </div>
        </div>
      </section>
      <section className="Page DetailBelow">
        <div className="DetailCol">
          <h3 className="DetailHeading">Dirección</h3>
          <div className="DetailList">Byron Howard<br/>Jared Bush</div>
          <h3 className="DetailHeading">Actores</h3>
          <div className="DetailList">Ginnifer Goodwin<br/>Ke Huy Quan<br/>Jason Bateman</div>
        </div>
        <div className="DetailCol">
          <h3 className="DetailHeading">Sinopsis</h3>
          <p className="DetailText">{m.synopsis}</p>
        </div>
        <div className="DetailCol">
          <h3 className="DetailHeading">Clasificación</h3>
          <div className="DetailStat">{m.rating}</div>
          <h3 className="DetailHeading">Duración</h3>
          <div className="DetailStat">{m.mins} min</div>
          <div className="DetailGenres">{m.genres}</div>
        </div>
      </section>
    </div>
  )
}

function Buy() {
  const { id } = useParams()
  const loc = useLocation()
  const qs = new URLSearchParams(loc.search)
  const selectedTime = qs.get('t') || ''
  const navigate = useNavigate()
  const numId = Number(id)
  const [m, setM] = useState<{ id: number; title: string; status: string; statusColor: string; rating: string; ratingColor: string; mins: number; poster: string; genres: string; synopsis: string }>(() => ({ id: 1, ...ITEMS[0] }))
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`${API}/api/cortos/${numId}`)
        const json: { success: boolean; data?: { id: number; titulo: string; clasificacion?: string; duracionMinutos?: number; categoria?: string; sinopsis?: string } } = await res.json()
        if (json && json.success && json.data) {
          const posters = [
            'https://upload.wikimedia.org/wikipedia/commons/c/c3/Solar_sys8.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/6/60/Polarlicht_2.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/4/47/Carina_Nebula.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/5/5f/HubbleUltraDeepField.jpg',
          ]
          const poster = posters[(json.data.id - 1) % posters.length]
          setM({ id: json.data.id, title: json.data.titulo, status: 'En Cartelera', statusColor: 'green', rating: json.data.clasificacion || 'A', ratingColor: (json.data.clasificacion === 'B' ? 'yellow' : 'green'), mins: json.data.duracionMinutos || 10, poster, genres: json.data.categoria || 'Divulgación', synopsis: json.data.sinopsis || '' })
        }
      } catch { void 0 }
    })()
  }, [numId])
  const [showTimes, setShowTimes] = useState<{ time: string; id?: number; format?: string }[]>([])
  const [selTime, setSelTime] = useState<string>(selectedTime || '')
  const [selHorarioId, setSelHorarioId] = useState<number | null>(null)
  const rows = ['A','B','C','D','E']
  const cols = [1,2,3,4,5]
  const [seats, setSeats] = useState<{ id: string; status: 'available' | 'selected' | 'occupied' }[]>(() => {
    const all: { id: string; status: 'available' | 'selected' | 'occupied' }[] = []
    rows.forEach(r => cols.forEach(c => all.push({ id: `${r}${c}`, status: 'available' })))
    return all
  })
  async function fetchSeats(hid: number) {
    try {
      const res = await fetch(`${API}/api/asientos?horario=${hid}`)
      const json: { success: boolean; data: { id_asiento: string; estado: string }[] } = await res.json()
      if (json && json.success && Array.isArray(json.data)) {
        setSeats(prev => prev.map(s => {
          const row = json.data.find(r => r.id_asiento === s.id)
          if (!row) return { ...s, status: s.status === 'selected' ? 'selected' : 'available' }
          const occupied = row.estado !== 'libre'
          if (occupied) return { ...s, status: 'occupied' }
          return { ...s, status: s.status === 'selected' ? 'selected' : 'available' }
        }))
      }
    } catch { /* ignore */ }
  }
  
  
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`${API}/api/horarios`)
        const json: { success: boolean; data: { id: number; cortoId: number; fecha: string; horaInicio: string }[] } = await res.json()
        if (json && json.success && Array.isArray(json.data)) {
          const list = json.data.filter((h) => h.cortoId === (Number.isFinite(numId) ? numId : 1)).map((h) => {
            const [hh, mm] = String(h.horaInicio).split(':')
            const hour = Number(hh)
            const ampm = hour >= 12 ? 'p.m.' : 'a.m.'
            const displayHour = hour % 12 === 0 ? 12 : hour % 12
            const timeText = `${displayHour}:${mm} ${ampm}`
            return { time: timeText, id: h.id }
          })
          setShowTimes(list)
          let chosen = selTime
          if (!chosen && list[0]) chosen = list[0].time
          setSelTime(chosen)
          const match = list.find(x => x.time === chosen)
          const hid = (match && match.id) || (list[0] && list[0].id) || null
          setSelHorarioId(hid)
          if (hid) await fetchSeats(hid)
        }
      } catch { void 0 }
    })()
  }, [numId, selTime])
  useEffect(() => {
    const id = setInterval(() => {
      if (selHorarioId) fetchSeats(selHorarioId)
    }, 10000)
    return () => clearInterval(id)
  }, [selHorarioId])
  const toggleSeat = (id: string) => {
    const seat = seats.find(s => s.id === id)
    if (!seat) return
    if (seat.status === 'occupied') return
    const selectedCount = seats.filter(s => s.status === 'selected').length
    setSeats(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'selected' ? 'available' : (selectedCount >= 4 ? s.status : 'selected') } : s))
  }
  const selectedSeats = seats.filter(s => s.status === 'selected')
  const pricePerSeat = 45
  const total = selectedSeats.length * pricePerSeat
  const totalMXN = total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
  const [showModal, setShowModal] = useState(false)
  const [tickets, setTickets] = useState<{ label: string; price: number; count: number }[]>([
    { label: 'Adulto', price: 65, count: 0 },
    { label: 'Niños', price: 55, count: 0 },
    { label: 'Tercera Edad', price: 55, count: 0 },
  ])
  const ticketsTotal = tickets.reduce((a, t) => a + t.count, 0)
  const remaining = Math.max(0, selectedSeats.length - ticketsTotal)
  const inc = (i: number) => setTickets(ts => {
    const total = ts.reduce((a, t) => a + t.count, 0)
    const maxAllowed = Math.min(selectedSeats.length, 4)
    if (total >= maxAllowed) return ts
    return ts.map((t, idx) => idx === i ? { ...t, count: t.count + 1 } : t)
  })
  const dec = (i: number) => setTickets(ts => ts.map((t, idx) => idx === i ? { ...t, count: Math.max(0, t.count - 1) } : t))
  const loadImageDataUrl = async (url: string) => {
    try {
      const res = await fetch(url, { mode: 'cors' })
      const blob = await res.blob()
      return await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(String(reader.result))
        reader.readAsDataURL(blob)
      })
    } catch {
      return ''
    }
  }
  const makePDF = async () => {
    if (!selHorarioId) { alert('Selecciona un horario'); return }
    const toBlock = selectedSeats.map(s => s.id)
    try {
      const res = await fetch(`${API}/api/reservas/bloquear-multiple`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ seats: toBlock, id_horario: selHorarioId }) })
      const ok = res.ok
      const json = ok ? await res.json() : null
      if (ok && json && json.success) {
        setSeats(prev => prev.map(s => toBlock.includes(s.id) ? { ...s, status: 'occupied' } : s))
      } else {
        alert('Algunos asientos ya están usados')
        await fetchSeats(selHorarioId)
        return
      }
    } catch { alert('Error de red'); return }
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const margin = 40
    const width = doc.internal.pageSize.getWidth()
    // Header
    doc.setFillColor(17,17,17)
    doc.rect(0,0,width,70,'F')
    doc.setTextColor(255,255,255)
    doc.setFont('helvetica','bold')
    doc.setFontSize(16)
    doc.text('Planetario SAYAB • Confirmación de boletos', margin, 44)
    // Poster
    const imgY = 100
    const imgSize = 160
    const dataUrl = await loadImageDataUrl(m.poster)
    if (dataUrl) {
      try { doc.addImage(dataUrl, 'JPEG', margin, imgY, imgSize, imgSize, undefined, 'FAST') } catch { doc.setDrawColor(200) }
    } else {
      doc.setDrawColor(200)
      doc.setFillColor(241, 245, 249)
      doc.rect(margin, imgY, imgSize, imgSize, 'FD')
      doc.setTextColor(120)
      doc.setFontSize(12)
      doc.text('Portada no disponible', margin + 16, imgY + imgSize/2)
    }
    // Details
    const left = margin + imgSize + 20
    doc.setTextColor(17,24,39)
    doc.setFontSize(18)
    doc.setFont('helvetica','bold')
    doc.text(m.title, left, imgY + 16)
    doc.setFontSize(12)
    doc.setFont('helvetica','normal')
    const dateStr = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    doc.text(`Fecha: ${dateStr}`, left, imgY + 42)
    doc.text(`Hora: ${selTime}`, left, imgY + 62)
    doc.text(`Cine: Plaza Comercial Apizaco`, left, imgY + 82)
    doc.text(`Sala: 5`, left, imgY + 102)
    doc.text(`Clasificación: ${m.rating} • Duración: ${m.mins} min`, left, imgY + 122)
    // Seats list
    doc.setFont('helvetica','bold')
    doc.setFontSize(14)
    doc.text('Asientos', margin, imgY + imgSize + 32)
    doc.setFont('helvetica','normal')
    doc.setFontSize(12)
    let y = imgY + imgSize + 52
    selectedSeats.forEach((s, idx) => {
      const row = s.id[0]
      const num = s.id.slice(1)
      doc.text(`${idx+1}. Fila ${row} • Asiento ${num}`, margin, y)
      y += 18
    })
    if (selectedSeats.length === 0) {
      doc.text('No hay asientos seleccionados', margin, y)
    }
    // Total
    doc.setFont('helvetica','bold')
    doc.setFontSize(14)
    doc.text(`Total asientos: ${selectedSeats.length} • Importe: ${totalMXN}`, margin, y + 24)
    doc.save(`boletos_${m.title.replace(/\s+/g,'_')}.pdf`)
    setShowModal(false)
  }
  return (
    <div>
      <section className="BuyHero">
        <div className="BackTop">
          <button className="BackBtn" onClick={() => navigate(-1)}>← Atrás</button>
        </div>
        <div className="BuyHeroBackdrop" style={{ backgroundImage: `url(${m.poster})` }} />
        <div className="Page BuyHeroInner">
          <div className="BuyBrand">
            <img className="BuyLogo" src={m.poster} alt={m.title} />
          </div>
          <h1 className="BuyTitle">{m.title}</h1>
        </div>
      </section>
      <section className="Page BuyLayout">
        <div className="BuyLeft">
          <div className="DatesBar">
            {['Hoy 28 NOV','Mañana 29 NOV','Domingo 30 NOV','Lunes 1 DIC','Martes 2 DIC','Miércoles 3 DIC'].map((d,i) => (
              <span key={i} className={`DateChip ${i===0?'active':''}`}>{d}</span>
            ))}
          </div>
        <div className="TimesLang">Español</div>
        <div className="TimesRow">
          {showTimes.map((st,i) => (
            <button key={i} className={`TimeChip ${selTime === st.time ? 'active' : ''}`} onClick={() => setSelTime(st.time)}>
              {st.format && <span className="TimeFormat">{st.format}</span>}
              <span className="TimeText">{st.time}</span>
              <span className="SeatBadge"><MdEventSeat size={16} /></span>
            </button>
          ))}
        </div>
        <div className="DomeWrap">
          <div className="Dome"><span className="DomeText">Pantalla • Sala 4</span></div>
        </div>
        <div className="SeatGrid">
          {rows.map(r => (
            <div key={r} className="SeatRow">
              <div className="SeatRowLabel">{r}</div>
              {cols.map(c => {
                const id = `${r}${c}`
                const seat = seats.find(s => s.id === id)!
                return (
                  <button key={id} className={`Seat ${seat.status}`} onClick={() => toggleSeat(id)}>{c}</button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
          <div className="CartPanel">
          <div className="CartHeader">
            <div className="CartHeaderTitle"><MdShoppingCart size={18} /> Tu carrito</div>
            <span className="CartPrice">{totalMXN}</span>
          </div>
          <div className="CartItem">
            <div className="CartBody">
              <h4 className="CartTitle">{m.title}</h4>
              <div className="MovieChips">
                <span className={`Chip rating ${m.ratingColor}`}>{m.rating}</span>
                <span className="Chip time">{m.mins} min</span>
              </div>
              <div className="CartMeta">Cine: Plaza Comercial Apizaco</div>
              <div className="CartMeta">Fecha y hora: Hoy, 28 de noviembre{selTime ? `, ${selTime}` : ''}</div>
              <div className="CartMeta">Sala: 5</div>
              <div className="SeatsTitle">Asientos ({selectedSeats.length})</div>
              <div className="SeatsList">
                {selectedSeats.map(s => {
                  const row = s.id[0]
                  const num = s.id.slice(1)
                  return (
                  <div key={s.id} className="SeatItem">
                    <div className="SeatIcon"><MdEventSeat size={16} /></div>
                    <div className="SeatLine">Fila {row} • Asiento {num} <span className="SeatPerson"><MdPerson size={14} /> 1 persona</span></div>
                  </div>
                  )
                })}
                {selectedSeats.length === 0 && (
                  <div className="SeatItem muted">No has seleccionado asientos</div>
                )}
              </div>
              <div className="CartActions">
                <button className="CartPrimary" disabled={selectedSeats.length===0} onClick={() => setShowModal(true)}>Seleccionar mis boletos</button>
                <button className="CartSecondary" onClick={() => navigate(-1)}>Volver</button>
              </div>
            </div>
          </div>
        </div>
        {showModal && (
          <div className="ModalOverlay" role="dialog" aria-modal="true">
            <div className="ModalCard">
              <div className="ModalHeader">
                <div className="ModalTitle">Selecciona tus boletos</div>
                <button className="ModalClose" aria-label="Cerrar" onClick={() => setShowModal(false)}><MdClose size={20} /></button>
              </div>
              <div className="ModalBody">
                <div className="ModalSectionTitle">Boletos</div>
                <div className="TicketList">
                  {tickets.map((t, i) => (
                    <div key={i} className="TicketRow">
                      <div className="TicketLeft">{t.label}</div>
                      <div className="TicketMid">{t.price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</div>
                      <div className="TicketRight">
                        <button className="CircleBtn" onClick={() => dec(i)}><MdRemove size={18} /></button>
                        <span className="TicketCount">{t.count}</span>
                        <button className="CircleBtn primary" onClick={() => inc(i)}><MdAdd size={18} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="ModalFooter">
                <button className="ModalPrimary" disabled={remaining > 0} onClick={makePDF}>Continuar</button>
                <div className="ModalNote">{remaining > 0 ? `Falta(n) ${remaining} boleto(s) por seleccionar` : 'Listo para continuar'}</div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function Home() {
  return (
    <>
      <Hero />
      <Catalog />
      <Actions />
    </>
  )
}

function Login() {
  const navigate = useNavigate()
  const loc = useLocation()
  const qs = new URLSearchParams(loc.search)
  const initialMsg = qs.get('msg') || ''
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [success, setSuccess] = useState(initialMsg)
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Completa todos los campos'); return }
    ;(async () => {
      try {
        const res = await fetch(`${API}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
        const json = await res.json()
        if (!res.ok || !json.success) { setError(json.message || 'Error al iniciar sesión'); return }
        localStorage.setItem('auth_token', String(json.token))
        setError('')
        setSuccess('Inicio de sesión exitoso')
        try {
          const base = String(json.token).split('.')[1] || ''
          const payload = JSON.parse(atob(base.replace(/-/g, '+').replace(/_/g, '/')))
          const admin = !!payload.admin
          setTimeout(() => navigate(admin ? '/admin' : '/'), 600)
        } catch { navigate('/') }
      } catch { setError('Error de red') }
    })()
  }
  return (
    <div className="AuthWrap">
      <div className="BackTop">
        <button className="BackBtn" onClick={() => navigate(-1)}>← Atrás</button>
      </div>
      {!showForm ? (
        <div className="LoginLanding">
          {success && <div className="FormSuccess">{success}</div>}
          <h1 className="LoginTitle">Inicia sesión o crea una cuenta en <span className="BrandClub">CLUB</span> <span className="BrandSayab">SAYAB</span></h1>
          <p className="LoginSubtitle">¿Ya tienes tu cuenta digital?</p>
          <button className="LoginPrimary" onClick={() => setShowForm(true)}>Inicia sesión</button>
          <div className="LoginOr">O</div>
          <Link className="LoginSecondary" to="/register">Crea tu cuenta</Link>
        </div>
      ) : (
        <div className="AuthCard">
          <h1 className="AuthTitle">Iniciar sesión</h1>
          {success && <div className="FormSuccess">{success}</div>}
          <form className="AuthForm" onSubmit={submit}>
            <div className="InputRow">
              <label className="InputLabel">Correo</label>
              <input className="TextInput" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" />
            </div>
            <div className="InputRow">
              <label className="InputLabel">Contraseña</label>
              <input className="TextInput" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            {error && <div className="FormError">{error}</div>}
            <div className="FormActions">
              <button className="SubmitBtn" type="submit">Entrar</button>
              <button className="SecondaryBtn" type="button" onClick={() => setShowForm(false)}>Volver</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password || !confirm) { setError('Completa todos los campos'); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    ;(async () => {
      try {
        const res = await fetch(`${API}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) })
        const json = await res.json()
        if (!res.ok || !json.success) { setError(json.message || 'Error al registrar'); return }
        setError('')
        navigate('/login?msg=Registro%20exitoso')
      } catch { setError('Error de red') }
    })()
  }
  return (
    <div className="AuthWrap">
      <div className="BackTop">
        <button className="BackBtn" onClick={() => navigate(-1)}>← Atrás</button>
      </div>
      {!showForm ? (
        <div className="LoginLanding">
          <h1 className="LoginTitle">Crea una cuenta en <span className="BrandClub">CLUB</span> <span className="BrandSayab">SAYAB</span></h1>
          <p className="LoginSubtitle">¿Ya tienes tu cuenta digital?</p>
          <button className="LoginPrimary" onClick={() => setShowForm(true)}>Crear cuenta</button>
          <div className="LoginOr">O</div>
          <Link className="LoginSecondary" to="/login">Inicia sesión</Link>
        </div>
      ) : (
        <div className="AuthCard">
          <h1 className="AuthTitle">Registro</h1>
          <form className="AuthForm" onSubmit={submit}>
            <div className="InputRow">
              <label className="InputLabel">Nombre</label>
              <input className="TextInput" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre completo" />
            </div>
            <div className="InputRow">
              <label className="InputLabel">Correo</label>
              <input className="TextInput" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" />
            </div>
            <div className="InputRow">
              <label className="InputLabel">Contraseña</label>
              <input className="TextInput" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="InputRow">
              <label className="InputLabel">Confirmar contraseña</label>
              <input className="TextInput" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
            </div>
            {error && <div className="FormError">{error}</div>}
            <div className="FormActions">
              <button className="SubmitBtn" type="submit">Crear cuenta</button>
              <button className="SecondaryBtn" type="button" onClick={() => setShowForm(false)}>Volver</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function Footer() {
  return (
    <footer className="FooterBar">
      <div className="FooterAccent" />
      <div className="Page FooterGrid">
        <div className="FooterCol">
          <div className="FooterBrands">
            <span className="FooterBrand">Planetario Sayab</span>
            <span className="FooterBrand">Playa del Carmen</span>
          </div>
          <div className="FooterFollow">Síguenos en</div>
          <div className="FooterSocial">
            <a className="SocialIcon" href="https://www.facebook.com/Planetariodeplayadelcarmen?locale=es_LA" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebook size={18} />
            </a>
          </div>
        </div>
        <div className="FooterCol">
          <div className="FooterMap">
            <iframe title="Ubicación Planetario Sayab Playa del Carmen" src="https://www.google.com/maps?q=Planetario+SAYAB+Playa+del+Carmen&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/detalle/:id" element={<Detail />} />
        <Route path="/comprar/:id" element={<RequireAuth><Buy /></RequireAuth>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/admin" element={<RequireAdmin><Dashboard /></RequireAdmin>} />
      </Routes>
      <Footer />
    </Router>
  )
}
function RequireAuth({ children }: { children: React.ReactElement }) {
  const has = typeof window !== 'undefined' ? !!localStorage.getItem('auth_token') : false
  if (!has) return <Navigate to="/login" replace />
  return children
}
function RequireAdmin({ children }: { children: React.ReactElement }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
  if (!token) return <Navigate to="/login" replace />
  const base = token.split('.')[1] || ''
  let payload: unknown = null
  try { payload = JSON.parse(atob(base.replace(/-/g, '+').replace(/_/g, '/'))) } catch { payload = null }
  const p = payload as { admin?: boolean } | null
  if (!p) return <Navigate to="/login" replace />
  if (p && p.admin) return children
  return <Navigate to="/" replace />
}
function Profile() {
  const navigate = useNavigate()
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        const json = await res.json()
        if (!res.ok || !json.success) { setError('No autenticado'); return }
        setName(String(json.data.name || ''))
        setEmail(String(json.data.email || ''))
      } catch { setError('Error de red') }
    })()
  }, [token])
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    ;(async () => {
      try {
        const res = await fetch(`${API}/api/auth/me`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name, password: password || undefined }) })
        const json = await res.json()
        if (!res.ok || !json.success) { setError('No se pudo actualizar'); return }
        if (json.token) localStorage.setItem('auth_token', String(json.token))
        setPassword('')
        setError('')
        navigate('/')
      } catch { setError('Error de red') }
    })()
  }
  return (
    <div className="Page">
      <h2 className="SectionTitle">Mi perfil</h2>
      <div className="AuthCard">
        <form className="AuthForm" onSubmit={submit}>
          <div className="InputRow">
            <label className="InputLabel">Nombre</label>
            <input className="TextInput" type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="InputRow">
            <label className="InputLabel">Correo</label>
            <input className="TextInput" type="email" value={email} readOnly />
          </div>
          <div className="InputRow">
            <label className="InputLabel">Nueva contraseña</label>
            <input className="TextInput" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Opcional" />
          </div>
          {error && <div className="FormError">{error}</div>}
          <div className="FormActions">
            <button className="SubmitBtn" type="submit">Guardar cambios</button>
            <button className="SecondaryBtn" type="button" onClick={() => navigate('/')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
const ITEMS = [
  { title: 'Viaje por el Sistema Solar', status: 'En Cartelera', statusColor: 'green', rating: 'AA', ratingColor: 'green', mins: 12, poster: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Solar_sys8.jpg', genres: 'Divulgación, Astronomía', synopsis: 'Recorre los planetas y descubre sus características principales en un viaje rápido por el sistema solar.' },
  { title: 'Auroras Boreales: Luz en el cielo', status: 'En Cartelera', statusColor: 'green', rating: 'A', ratingColor: 'green', mins: 9, poster: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Polarlicht_2.jpg', genres: 'Naturaleza, Espacio', synopsis: 'Conoce el fenómeno de las auroras y por qué pintan el cielo con espectaculares colores.' },
  { title: 'Nebulosas: Fábricas de Estrellas', status: 'En Cartelera', statusColor: 'green', rating: 'A', ratingColor: 'green', mins: 15, poster: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Carina_Nebula.jpg', genres: 'Astronomía, Cosmos', synopsis: 'Explora el nacimiento de estrellas dentro de grandes nubes de gas y polvo.' },
  { title: 'Hubble: Ventana al Universo', status: 'En Cartelera', statusColor: 'green', rating: 'AA', ratingColor: 'green', mins: 10, poster: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/HubbleUltraDeepField.jpg', genres: 'Documental, Astronomía', synopsis: 'Las imágenes más profundas del universo y lo que revelan acerca de su evolución.' },
  { title: 'Colisiones Cósmicas', status: 'En Cartelera', statusColor: 'green', rating: 'B', ratingColor: 'yellow', mins: 18, poster: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/NGC_2207_and_IC_2163.jpg', genres: 'Ciencia, Espacio', synopsis: 'Galaxias que interactúan y se fusionan: un espectáculo cósmico lleno de energía.' },
]
