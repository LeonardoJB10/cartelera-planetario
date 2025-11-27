import styled from 'styled-components'
import { FaPlay, FaCalendarAlt, FaNewspaper, FaTicketAlt, FaInfoCircle, FaChevronRight } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const HeroSection = styled.section`
  background: linear-gradient(135deg, #900C27 0%, #b81434 100%);
  padding: 6rem 0;
  min-height: 70vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
`

const HeroContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
`

const HeroText = styled.div`
  z-index: 2;
`

const HeroTitle = styled.h1`
  font-size: 4rem;
  margin-bottom: 1.5rem;
  color: #ffffff;
  font-weight: bold;
  line-height: 1.1;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`

const HeroSubtitle = styled.p`
  font-size: 1.4rem;
  color: #ffcccc;
  margin-bottom: 2.5rem;
  line-height: 1.6;
`

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`

const ActionButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1.2rem 2.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  text-decoration: none;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }
`

const HeroImage = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  
  img {
    max-width: 100%;
    height: auto;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
`

const MoviesSection = styled.section`
  padding: 4rem 0;
  background: #ffffff;
`

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: 3rem;
  color: #900C27;
  font-size: 2.5rem;
  font-weight: bold;
`

const MoviesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 0 1rem;
  }
`

const MovieCard = styled.div`
  display: flex;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(144, 12, 39, 0.1);
  border: 1px solid rgba(144, 12, 39, 0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 35px rgba(144, 12, 39, 0.2);
  }
`

const MoviePoster = styled.div`
  width: 150px;
  height: 200px;
  background: linear-gradient(135deg, #900C27, #b81434);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  flex-shrink: 0;
`

const MovieDetails = styled.div`
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const MovieBadges = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`

const Badge = styled.span`
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  
  &.rating {
    background: #ffd700;
    color: #000;
  }
  
  &.duration {
    background: #f0f0f0;
    color: #666;
  }
  
  &.status {
    background: #28a745;
    color: white;
  }
`

const MovieTitle = styled.h3`
  color: #900C27;
  font-size: 1.3rem;
  margin: 0 0 1rem 0;
  font-weight: bold;
`

const MovieActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: auto;
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

const BuyButton = styled.button`
  background: #f0f0f0;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  color: #666;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;
  
  &:hover {
    background: #e0e0e0;
  }
`

const OtherCinemasLink = styled(Link)`
  color: #0066cc;
  text-decoration: none;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.5rem;
  
  &:hover {
    color: #004499;
  }
`

const FeaturesSection = styled.section`
  padding: 4rem 0;
  background: #f8f8f8;
`

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(144, 12, 39, 0.2);
  transition: transform 0.3s ease;
  box-shadow: 0 4px 15px rgba(144, 12, 39, 0.1);
  
  &:hover {
    transform: translateY(-5px);
    border-color: #900C27;
    box-shadow: 0 8px 25px rgba(144, 12, 39, 0.2);
  }
  
  svg {
    font-size: 3rem;
    color: #900C27;
    margin-bottom: 1rem;
  }
  
  h3 {
    color: #900C27;
    margin-bottom: 1rem;
  }
  
  p {
    color: #666666;
  }
`

function Home() {
  return (
    <>
      <HeroSection>
        <HeroContent>
          <HeroText>
            <HeroTitle>Comienza la aventura espacial</HeroTitle>
            <HeroSubtitle>
              El universo te espera en SAYAB Planetario de Playa del Carmen. ¡Prepárate para una experiencia inmersiva única de aprendizaje y entretenimiento!
            </HeroSubtitle>
            <ActionButtons>
              <ActionButton to="/cartelera">
                <FaTicketAlt />
                Adquirir tickets
              </ActionButton>
            </ActionButtons>
          </HeroText>
          <HeroImage>
            <div style={{ 
              width: '100%', 
              height: '400px', 
              background: 'linear-gradient(135deg, #900C27, #b81434)', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '3rem',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
            }}>
              <FaPlay />
            </div>
          </HeroImage>
        </HeroContent>
      </HeroSection>
      
      <MoviesSection>
        <SectionTitle>Cartelera Destacada</SectionTitle>
        <MoviesGrid>
          <MovieCard>
            <MoviePoster>
              <FaPlay />
            </MoviePoster>
            <MovieDetails>
              <MovieBadges>
                <Badge className="rating">A</Badge>
                <Badge className="duration">15 min</Badge>
                <Badge className="status">Estreno</Badge>
              </MovieBadges>
              <MovieTitle>Viaje al Centro de la Tierra</MovieTitle>
              <MovieActions>
                <DetailLink to="/movie/1">
                  <FaInfoCircle />
                  Ver detalle
                </DetailLink>
                <BuyButton>Comprar boletos</BuyButton>
              </MovieActions>
              <OtherCinemasLink to="/cartelera">
                Horarios en otros cines <FaChevronRight />
              </OtherCinemasLink>
            </MovieDetails>
          </MovieCard>
          
          <MovieCard>
            <MoviePoster>
              <FaPlay />
            </MoviePoster>
            <MovieDetails>
              <MovieBadges>
                <Badge className="rating">AA</Badge>
                <Badge className="duration">20 min</Badge>
                <Badge className="status">En Cartelera</Badge>
              </MovieBadges>
              <MovieTitle>El Universo en 3D</MovieTitle>
              <MovieActions>
                <DetailLink to="/movie/2">
                  <FaInfoCircle />
                  Ver detalle
                </DetailLink>
                <BuyButton>Comprar boletos</BuyButton>
              </MovieActions>
              <OtherCinemasLink to="/cartelera">
                Horarios en otros cines <FaChevronRight />
              </OtherCinemasLink>
            </MovieDetails>
          </MovieCard>
        </MoviesGrid>
      </MoviesSection>
      
      <FeaturesSection>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#900C27' }}>
            ¿Qué puedes hacer aquí?
          </h2>
          <FeaturesGrid>
            <FeatureCard>
              <FaCalendarAlt />
              <h3>Consultar Horarios</h3>
              <p>Revisa la programación actualizada de funciones y horarios de proyección.</p>
            </FeatureCard>
            
            <FeatureCard>
              <FaPlay />
              <h3>Explorar Cortos</h3>
              <p>Descubre nuestra colección de cortos educativos y entretenidos.</p>
            </FeatureCard>
            
            <FeatureCard>
              <FaNewspaper />
              <h3>Leer Noticias</h3>
              <p>Mantente informado sobre las últimas novedades del planetario.</p>
            </FeatureCard>
          </FeaturesGrid>
        </div>
      </FeaturesSection>
    </>
  )
}

export default Home
