import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { FaFilm, FaClock, FaUser, FaCalendar, FaInfoCircle } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import axios from 'axios'

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

const CortosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`

const CortoCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(144, 12, 39, 0.2);
  transition: transform 0.3s ease;
  box-shadow: 0 4px 15px rgba(144, 12, 39, 0.1);
  
  &:hover {
    transform: translateY(-5px);
    border-color: #900C27;
    box-shadow: 0 8px 25px rgba(144, 12, 39, 0.2);
  }
`

const CortoTitle = styled.h3`
  color: #900C27;
  margin-bottom: 1rem;
  font-size: 1.3rem;
`

const CortoDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #666666;
`

const CortoDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const CortoDescription = styled.p`
  color: #666666;
  margin-top: 1rem;
  line-height: 1.5;
`

const CortoActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  align-items: center;
`

const DetailLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #900C27;
  text-decoration: none;
  font-size: 0.9rem;
  
  &:hover {
    color: #b81434;
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

interface Corto {
  id: number;
  titulo: string;
  director: string;
  duracionMinutos: number;
  sinopsis: string;
  clasificacion: string;
  categoria: string;
}

function Cartelera() {
  const [cortos, setCortos] = useState<Corto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCortos = async () => {
      try {
        const response = await axios.get('http://localhost:8001/api/cortos')
        setCortos(response.data.data)
      } catch (err) {
        setError('Error al cargar los cortos')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCortos()
  }, [])

  if (loading) {
    return (
      <PageContainer>
        <PageTitle>
          <FaFilm />
          Catálogo de Películas
        </PageTitle>
        <Loading>Cargando películas...</Loading>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <PageTitle>
          <FaFilm />
          Catálogo de Películas
        </PageTitle>
        <Error>{error}</Error>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageTitle>
        <FaFilm />
        Catálogo de Películas
      </PageTitle>
      
      <CortosGrid>
        {cortos.map((corto) => (
          <CortoCard key={corto.id}>
            <CortoTitle>{corto.titulo}</CortoTitle>
            
            <CortoDetails>
              <CortoDetail>
                <FaUser />
                Director: {corto.director}
              </CortoDetail>
              <CortoDetail>
                <FaClock />
                Duración: {corto.duracionMinutos} minutos
              </CortoDetail>
              <CortoDetail>
                <FaCalendar />
                Categoría: {corto.categoria}
              </CortoDetail>
              <CortoDetail>
                Clasificación: {corto.clasificacion}
              </CortoDetail>
            </CortoDetails>
            
            <CortoDescription>{corto.sinopsis}</CortoDescription>
            
            <CortoActions>
              <DetailLink to={`/movie/${corto.id}`}>
                <FaInfoCircle />
                Ver detalle completo
              </DetailLink>
            </CortoActions>
          </CortoCard>
        ))}
      </CortosGrid>
    </PageContainer>
  )
}

export default Cartelera
