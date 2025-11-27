import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { FaNewspaper, FaCalendarAlt } from 'react-icons/fa'
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

const NoticiasGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`

const NoticiaCard = styled.div`
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

const NoticiaTitle = styled.h3`
  color: #900C27;
  margin-bottom: 1rem;
  font-size: 1.3rem;
`

const NoticiaResumen = styled.p`
  color: #666666;
  margin-bottom: 1rem;
  line-height: 1.5;
`

const NoticiaMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #888888;
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

interface Noticia {
  id: number;
  titulo: string;
  resumen: string;
  contenido: string;
  tipo: string;
  fechaPublicacion: string;
  destacada: boolean;
}

function Noticias() {
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const response = await axios.get('http://localhost:8001/api/noticias')
        setNoticias(response.data.data)
      } catch (err) {
        setError('Error al cargar las noticias')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchNoticias()
  }, [])

  if (loading) {
    return (
      <PageContainer>
        <PageTitle>
          <FaNewspaper />
          Noticias
        </PageTitle>
        <Loading>Cargando noticias...</Loading>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <PageTitle>
          <FaNewspaper />
          Noticias
        </PageTitle>
        <Error>{error}</Error>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageTitle>
        <FaNewspaper />
        Noticias
      </PageTitle>
      
      <NoticiasGrid>
        {noticias.map((noticia) => (
          <NoticiaCard key={noticia.id}>
            <NoticiaTitle>{noticia.titulo}</NoticiaTitle>
            <NoticiaResumen>{noticia.resumen}</NoticiaResumen>
            <NoticiaMeta>
              <FaCalendarAlt />
              {new Date(noticia.fechaPublicacion).toLocaleDateString('es-ES')}
              {noticia.destacada && (
                <span style={{ color: '#ffd700', marginLeft: '1rem' }}>
                  ⭐ Destacada
                </span>
              )}
            </NoticiaMeta>
          </NoticiaCard>
        ))}
      </NoticiasGrid>
    </PageContainer>
  )
}

export default Noticias
