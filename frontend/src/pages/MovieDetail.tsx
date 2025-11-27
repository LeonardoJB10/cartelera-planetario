import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import styled from 'styled-components'
import { FaPlay, FaTicketAlt, FaClock, FaUser, FaStar, FaArrowLeft } from 'react-icons/fa'
import axios from 'axios'

const DetailContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
`

const Header = styled.div`
  background: linear-gradient(135deg, rgba(144, 12, 39, 0.9) 0%, rgba(0, 0, 0, 0.8) 100%);
  padding: 4rem 0;
  position: relative;
  min-height: 80vh;
  display: flex;
  align-items: center;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="stars" patternUnits="userSpaceOnUse" width="100" height="100"><circle cx="20" cy="20" r="1" fill="white" opacity="0.3"/><circle cx="80" cy="40" r="1" fill="white" opacity="0.2"/><circle cx="40" cy="80" r="1" fill="white" opacity="0.4"/><circle cx="90" cy="90" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23stars)"/></svg>');
    opacity: 0.1;
  }
`

const BackButton = styled(Link)`
  position: absolute;
  top: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: bold;
  padding: 0.8rem 1.5rem;
  background: rgba(144, 12, 39, 0.8);
  border-radius: 25px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  z-index: 10;
  
  &:hover {
    background: rgba(144, 12, 39, 0.9);
    transform: translateY(-2px);
  }
`

const MovieInfo = styled.div`
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 4rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 2;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`

const MovieContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const MoviePoster = styled.div`
  width: 350px;
  height: 500px;
  background: linear-gradient(135deg, #900C27, #b81434);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 4rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
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
  
  @media (max-width: 768px) {
    width: 100%;
    height: 400px;
  }
`

const MovieContent = styled.div`
  color: white;
  position: relative;
`

const StatusBadge = styled.div`
  display: inline-block;
  background: linear-gradient(45deg, #900C27, #b81434);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
`

const MovieTitle = styled.h1`
  font-size: 4rem;
  margin-bottom: 1rem;
  color: white;
  font-weight: bold;
  line-height: 1.1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`

const MovieMeta = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  align-items: center;
`

const MetaInfo = styled.div`
  color: #cccccc;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const FormatTags = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`

const FormatTag = styled.span`
  background: rgba(255, 255, 255, 0.1);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
  border: 1px solid rgba(255, 255, 255, 0.2);
`

const Synopsis = styled.div`
  margin-bottom: 2rem;
  
  h3 {
    color: #900C27;
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }
  
  p {
    color: #666;
    line-height: 1.6;
    font-size: 1.1rem;
  }
`

const MovieDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`

const DetailSection = styled.div`
  h4 {
    color: #900C27;
    margin-bottom: 0.5rem;
    font-size: 1.2rem;
  }
  
  p {
    color: #666;
    margin: 0;
  }
`

const ActionButtons = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 3rem;
`

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1.5rem 3rem;
  border: none;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  
  &.primary {
    background: linear-gradient(45deg, #900C27, #b81434);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(144, 12, 39, 0.4);
      background: linear-gradient(45deg, #b81434, #d41b42);
    }
  }
  
  &.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.5);
      transform: translateY(-2px);
    }
  }
`

const SynopsisSection = styled.div`
  background: rgba(0, 0, 0, 0.6);
  padding: 3rem 0;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(144, 12, 39, 0.1) 0%, rgba(0, 0, 0, 0.8) 100%);
  }
`

const SynopsisContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 2;
  
  h2 {
    color: white;
    font-size: 2.5rem;
    margin-bottom: 2rem;
    font-weight: bold;
  }
  
  p {
    color: #cccccc;
    font-size: 1.2rem;
    line-height: 1.8;
    max-width: 800px;
  }
`

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
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
  margin: 2rem;
`

interface Movie {
  id: number;
  titulo: string;
  director: string;
  duracionMinutos: number;
  sinopsis: string;
  clasificacion: string;
  categoria: string;
  actores?: string[];
  estado: string;
}

function MovieDetail() {
  const { id } = useParams<{ id: string }>()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        // Simular datos de película más detallados
        const mockMovie: Movie = {
          id: parseInt(id || '1'),
          titulo: id === '1' ? 'Viaje al Centro de la Tierra' : 'El Universo en 3D',
          director: id === '1' ? 'Dr. María González' : 'Prof. Carlos Ruiz',
          duracionMinutos: id === '1' ? 15 : 20,
          sinopsis: id === '1' 
            ? 'Una experiencia inmersiva que te llevará en un viaje fascinante hacia las profundidades de nuestro planeta. Descubre las capas internas de la Tierra, desde la corteza hasta el núcleo, en una aventura científica única que combina educación y entretenimiento.'
            : 'Explora el cosmos como nunca antes en esta experiencia 3D única. Desde nuestro sistema solar hasta las galaxias más lejanas, este corto te llevará en un viaje épico a través del universo, revelando los misterios del espacio y el tiempo.',
          clasificacion: id === '1' ? 'A' : 'AA',
          categoria: id === '1' ? 'Ciencia' : 'Astronomía',
          actores: id === '1' 
            ? ['Dr. Ana Martínez (Narradora)', 'Prof. Luis Herrera (Guía Virtual)', 'Dra. Sofia Chen (Experta en Geología)']
            : ['Dr. Miguel Torres (Narrador)', 'Dra. Elena Vargas (Astrofísica)', 'Prof. Roberto Silva (Cosmólogo)'],
          estado: 'publicado'
        }
        
        setMovie(mockMovie)
      } catch (err) {
        setError('Error al cargar la información de la película')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMovie()
  }, [id])

  if (loading) {
    return (
      <DetailContainer>
        <Loading>Cargando información de la película...</Loading>
      </DetailContainer>
    )
  }

  if (error || !movie) {
    return (
      <DetailContainer>
        <Error>{error || 'Película no encontrada'}</Error>
      </DetailContainer>
    )
  }

  return (
    <DetailContainer>
      <Header>
        <BackButton to="/">
          <FaArrowLeft />
          Volver al inicio
        </BackButton>
        
        <MovieInfo>
          <MoviePoster>
            <FaPlay />
          </MoviePoster>
          
          <MovieContentWrapper>
            <MovieContent>
              <StatusBadge>Estreno</StatusBadge>
              <MovieTitle>{movie.titulo}</MovieTitle>
              
              <MovieMeta>
                <MetaInfo>
                  <FaClock />
                  {movie.duracionMinutos} min • {movie.categoria.toUpperCase()}
                </MetaInfo>
              </MovieMeta>
              
              <FormatTags>
                <FormatTag>Domo Digital</FormatTag>
                <FormatTag>Inmersivo</FormatTag>
                <FormatTag>Educativo</FormatTag>
                <FormatTag>3D</FormatTag>
              </FormatTags>
              
              <ActionButtons>
                <ActionButton className="primary" onClick={() => window.open('/cartelera', '_blank')}>
                  <FaTicketAlt />
                  Comprar boletos
                </ActionButton>
                <ActionButton className="secondary" onClick={() => alert('Trailer no disponible en este momento')}>
                  <FaPlay />
                  Ver tráiler
                </ActionButton>
              </ActionButtons>
            </MovieContent>
          </MovieContentWrapper>
        </MovieInfo>
      </Header>
      
      <SynopsisSection>
        <SynopsisContent>
          <h2>Sinopsis</h2>
          <p>{movie.sinopsis}</p>
        </SynopsisContent>
      </SynopsisSection>
    </DetailContainer>
  )
}

export default MovieDetail
