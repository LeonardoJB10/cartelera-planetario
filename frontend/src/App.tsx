import './App.css'
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import jsPDF from 'jspdf'
import { MdEventSeat, MdPerson, MdShoppingCart, MdAdd, MdRemove, MdClose } from 'react-icons/md'
import { FaFacebook } from 'react-icons/fa'

function Header() {
  const loc = useLocation()
  const isAuth = loc.pathname === '/login' || loc.pathname === '/register'
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
          <Link className="ActionLink" to="/login">Iniciar sesión</Link>
          <Link className="ActionLink" to="/register">Registro</Link>
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
          <Link className="PrimaryBtn" to="/comprar/0">Adquiere tickets</Link>
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

function Catalog() {
  const [tab, setTab] = useState<'cartelera' | 'horarios'>('cartelera')
  return (
    <div className="Page">
      <div className="Tabs">
        <a className={`Tab ${tab === 'cartelera' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setTab('cartelera') }}>Cartelera</a>
        <a className={`Tab ${tab === 'horarios' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setTab('horarios') }}>Horarios</a>
      </div>
      {tab === 'cartelera' ? (
        <div className="Grid MoviesGrid">
          {ITEMS.map((m, i) => (
            <div key={i} className="Card Movie">
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
                <Link className="FootLink" to={`/detalle/${i}`}>Ver detalle</Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="ScheduleList">
          {ITEMS.map((m, i) => (
            <div key={i} className="ScheduleItem">
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
                <Link className="FootLink" to={`/detalle/${i}`}>Ver detalle</Link>
                <div className="TimesLang">Español</div>
                <div className="TimesRow">
                  {[
                    { time: '7:20 p.m.', format: 'REAL D 3D' },
                    { time: '8:20 p.m.' },
                    { time: '9:00 p.m.' },
                    { time: '9:40 p.m.', format: 'REAL D 3D' },
                  ].map((st, idx2) => (
                    <Link key={idx2} className="TimeChip" to={`/comprar/${i}?t=${encodeURIComponent(st.time)}`}>
                      {st.format && <span className="TimeFormat">{st.format}</span>}
                      <span className="TimeText">{st.time}</span>
                      <span className="SeatBadge"><MdEventSeat size={16} /></span>
                    </Link>
                  ))}
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
  const idx = Number(id)
  const m = Number.isFinite(idx) && ITEMS[idx] ? ITEMS[idx] : ITEMS[0]
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
              <Link className="PrimaryBtn" to={`/comprar/${Number.isFinite(idx) ? idx : 0}`}>Comprar boletos</Link>
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
  const idx = Number(id)
  const m = Number.isFinite(idx) && ITEMS[idx] ? ITEMS[idx] : ITEMS[0]
  const showTimes = [
    { time: '7:20 p.m.', format: 'REAL D 3D' },
    { time: '8:20 p.m.' },
    { time: '9:00 p.m.' },
    { time: '9:40 p.m.', format: 'REAL D 3D' },
  ]
  const [selTime, setSelTime] = useState<string>(selectedTime || showTimes[0].time)
  const rows = ['A','B','C','D','E']
  const cols = [1,2,3,4,5]
  const [seats, setSeats] = useState<{ id: string; status: 'available' | 'selected' | 'occupied' }[]>(() => {
    const all: { id: string; status: 'available' | 'selected' | 'occupied' }[] = []
    rows.forEach(r => cols.forEach(c => all.push({ id: `${r}${c}`, status: 'available' })))
    return all
  })
  const toggleSeat = (id: string) => {
    setSeats(prev => {
      const selectedCount = prev.filter(s => s.status === 'selected').length
      return prev.map(seat => {
        if (seat.id !== id) return seat
        if (seat.status === 'selected') return { ...seat, status: 'available' }
        if (seat.status === 'available' && selectedCount < 4) return { ...seat, status: 'selected' }
        return seat
      })
    })
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
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Completa todos los campos'); return }
    setError('')
    navigate('/')
  }
  return (
    <div className="AuthWrap">
      <div className="BackTop">
        <button className="BackBtn" onClick={() => navigate(-1)}>← Atrás</button>
      </div>
      {!showForm ? (
        <div className="LoginLanding">
          <h1 className="LoginTitle">Inicia sesión o crea una cuenta en <span className="BrandClub">CLUB</span> <span className="BrandSayab">SAYAB</span></h1>
          <p className="LoginSubtitle">¿Ya tienes tu cuenta digital?</p>
          <button className="LoginPrimary" onClick={() => setShowForm(true)}>Inicia sesión</button>
          <div className="LoginOr">O</div>
          <Link className="LoginSecondary" to="/register">Crea tu cuenta</Link>
        </div>
      ) : (
        <div className="AuthCard">
          <h1 className="AuthTitle">Iniciar sesión</h1>
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
    setError('')
    navigate('/login')
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
        <Route path="/comprar/:id" element={<Buy />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      <Footer />
    </Router>
  )
}
const ITEMS = [
  { title: 'Viaje por el Sistema Solar', status: 'En Cartelera', statusColor: 'green', rating: 'AA', ratingColor: 'green', mins: 12, poster: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Solar_sys8.jpg', genres: 'Divulgación, Astronomía', synopsis: 'Recorre los planetas y descubre sus características principales en un viaje rápido por el sistema solar.' },
  { title: 'Auroras Boreales: Luz en el cielo', status: 'En Cartelera', statusColor: 'green', rating: 'A', ratingColor: 'green', mins: 9, poster: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Polarlicht_2.jpg', genres: 'Naturaleza, Espacio', synopsis: 'Conoce el fenómeno de las auroras y por qué pintan el cielo con espectaculares colores.' },
  { title: 'Nebulosas: Fábricas de Estrellas', status: 'En Cartelera', statusColor: 'green', rating: 'A', ratingColor: 'green', mins: 15, poster: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Carina_Nebula.jpg', genres: 'Astronomía, Cosmos', synopsis: 'Explora el nacimiento de estrellas dentro de grandes nubes de gas y polvo.' },
  { title: 'Hubble: Ventana al Universo', status: 'En Cartelera', statusColor: 'green', rating: 'AA', ratingColor: 'green', mins: 10, poster: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/HubbleUltraDeepField.jpg', genres: 'Documental, Astronomía', synopsis: 'Las imágenes más profundas del universo y lo que revelan acerca de su evolución.' },
  { title: 'Colisiones Cósmicas', status: 'En Cartelera', statusColor: 'green', rating: 'B', ratingColor: 'yellow', mins: 18, poster: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/NGC_2207_and_IC_2163.jpg', genres: 'Ciencia, Espacio', synopsis: 'Galaxias que interactúan y se fusionan: un espectáculo cósmico lleno de energía.' },
]
