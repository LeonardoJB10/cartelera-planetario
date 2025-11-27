import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTicketAlt, FaUser, FaLock, FaFilm } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`

const PageTitle = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: #900C27;
  font-size: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`

const HorariosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`

const HorarioCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  padding: 0;
  border-radius: 12px;
  border: 1px solid rgba(144, 12, 39, 0.2);
  transition: transform 0.3s ease;
  box-shadow: 0 4px 15px rgba(144, 12, 39, 0.1);
  cursor: pointer;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-5px);
    border-color: #900C27;
    box-shadow: 0 8px 25px rgba(144, 12, 39, 0.2);
  }
`

const MovieImage = styled.div`
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #900C27, #b81434);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
  }
`

const MoviePoster = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  ${HorarioCard}:hover & {
    transform: scale(1.05);
  }
`

const HorarioContent = styled.div`
  padding: 1.5rem;
`

const HorarioHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`

const HorarioTime = styled.div`
  color: #900C27;
  font-size: 1.2rem;
  font-weight: bold;
`

const HorarioDate = styled.div`
  color: #666666;
  font-size: 0.9rem;
`

const HorarioTitle = styled.h3`
  color: #900C27;
  margin-bottom: 0.5rem;
`

const HorarioDetails = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #666666;
`

const HorarioDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`

const LoginPrompt = styled.div`
  background: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  border-radius: 12px;
  border: 2px solid #900C27;
  text-align: center;
  margin: 2rem 0;
  box-shadow: 0 4px 15px rgba(144, 12, 39, 0.1);
`

const LoginPromptTitle = styled.h3`
  color: #900C27;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`

const LoginPromptText = styled.p`
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
`

const LoginButton = styled.button`
  background: #900C27;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
  
  &:hover {
    background: #b81434;
  }
`

const SeatSelectionButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;
  margin-top: 1rem;
  width: 100%;
  
  &:hover {
    background: #218838;
  }
`

const Loading = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #900C27;
  font-size: 1.2rem;
`

const Error = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(144, 12, 39, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(144, 12, 39, 0.3);
  color: #900C27;
`

interface Horario {
  id: number;
  cortoId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  sala: string;
  precioEntrada: number;
  capacidadDisponible: number;
  estado: string;
  corto: {
    titulo: string;
    duracionMinutos: number;
    clasificacion: string;
    imagenUrl?: string;
  };
}

function Cortos() {
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const fetchHorarios = async () => {
      try {
        const response = await axios.get('http://localhost:8001/api/horarios')
        
        // Agregar URLs de imágenes simuladas a los horarios
        const horariosConImagenes = response.data.data.map((horario: any) => ({
          ...horario,
          corto: {
            ...horario.corto,
            imagenUrl: getMovieImage(horario.cortoId)
          }
        }))
        
        setHorarios(horariosConImagenes)
      } catch (err) {
        setError('Error al cargar los horarios')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchHorarios()
  }, [])

  // Función para obtener la imagen de la película
  const getMovieImage = (cortoId: number) => {
    const movieImages: { [key: number]: string } = {
      1: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop&crop=center',
      2: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=600&fit=crop&crop=center',
      3: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop&crop=center',
      4: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=600&fit=crop&crop=center',
      5: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=center',
    }
    return movieImages[cortoId] || 'https://images.unsplash.com/photo-1489599804644-8f8f8f8f8f8f?w=400&h=600&fit=crop&crop=center'
  }

  if (loading) {
    return (
      <PageContainer>
        <PageTitle>
          <FaCalendarAlt />
          Horarios de Funciones
        </PageTitle>
        <Loading>Cargando horarios...</Loading>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <PageTitle>
          <FaCalendarAlt />
          Horarios de Funciones
        </PageTitle>
        <Error>{error}</Error>
      </PageContainer>
    )
  }

  const handleSeatSelection = (horario: Horario) => {
    // Aquí implementarías la lógica para seleccionar asientos
    // Por ahora, navegamos a una página de selección de asientos
    navigate(`/seats/${horario.id}`)
  }

  return (
    <PageContainer>
      <PageTitle>
        <FaCalendarAlt />
        Horarios de Funciones
      </PageTitle>
      
      {!isAuthenticated && (
        <LoginPrompt>
          <LoginPromptTitle>
            <FaLock />
            Acceso Restringido
          </LoginPromptTitle>
          <LoginPromptText>
            Para seleccionar asientos y realizar reservas, necesitas iniciar sesión.
            <br />
            Los usuarios no registrados solo pueden ver los horarios disponibles.
          </LoginPromptText>
          <LoginButton onClick={() => navigate('/login')}>
            <FaUser />
            Iniciar Sesión
          </LoginButton>
        </LoginPrompt>
      )}
      
      <HorariosGrid>
        {horarios.map((horario) => (
          <HorarioCard 
            key={horario.id}
            onClick={() => !isAuthenticated ? navigate(`/movie/${horario.cortoId}`) : null}
            style={{ cursor: !isAuthenticated ? 'pointer' : 'default' }}
          >
            <MovieImage>
              {horario.corto.imagenUrl ? (
                <MoviePoster 
                  src={horario.corto.imagenUrl} 
                  alt={horario.corto.titulo}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextElementSibling!.style.display = 'flex'
                  }}
                />
              ) : null}
              <div style={{ display: horario.corto.imagenUrl ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                <FaFilm />
              </div>
            </MovieImage>
            
            <HorarioContent>
              <HorarioHeader>
                <HorarioTime>{horario.horaInicio} - {horario.horaFin}</HorarioTime>
                <HorarioDate>{horario.fecha}</HorarioDate>
              </HorarioHeader>
              
              <HorarioTitle>{horario.corto.titulo}</HorarioTitle>
              
              <HorarioDetails>
                <HorarioDetail>
                  <FaMapMarkerAlt />
                  {horario.sala}
                </HorarioDetail>
                <HorarioDetail>
                  <FaClock />
                  {horario.corto.duracionMinutos} min
                </HorarioDetail>
                <HorarioDetail>
                  <FaTicketAlt />
                  ${horario.precioEntrada}
                </HorarioDetail>
              </HorarioDetails>
              
              <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666666' }}>
                Clasificación: {horario.corto.clasificacion} | 
                Capacidad: {horario.capacidadDisponible} lugares disponibles
              </div>

              {isAuthenticated && (
                <SeatSelectionButton onClick={(e) => {
                  e.stopPropagation()
                  handleSeatSelection(horario)
                }}>
                  Seleccionar Asientos
                </SeatSelectionButton>
              )}
            </HorarioContent>
          </HorarioCard>
        ))}
      </HorariosGrid>
    </PageContainer>
  )
}

export default Cortos
