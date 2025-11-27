import styled from 'styled-components'
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa'
import SayabLogo from './SayabLogo'

const FooterContainer = styled.footer`
  margin-top: auto;
`

const TopStrip = styled.div`
  background: #900C27;
  height: 8px;
  width: 100%;
`

const MainFooter = styled.div`
  background: #900C27;
  padding: 2rem 0;
`

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 3rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 2rem;
  }
`


const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const SocialSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
`

const LogoText = styled.div`
  h1 {
    color: white;
    font-size: 1.8rem;
    font-weight: bold;
    margin: 0;
    line-height: 1;
  }
  
  .subtitle {
    color: #ffcccc;
    font-size: 0.9rem;
    margin: 0;
  }
  
  .motto {
    color: white;
    font-size: 0.8rem;
    font-weight: bold;
    margin: 0;
  }
`

const SayabBadge = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #900C27, #b81434);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.8rem;
`

const SocialText = styled.span`
  color: #ffcccc;
  font-size: 0.9rem;
`

const SocialIcons = styled.div`
  display: flex;
  gap: 0.8rem;
`

const SocialIcon = styled.a`
  width: 35px;
  height: 35px;
  background: #900C27;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-decoration: none;
  transition: background 0.3s ease;
  
  &:hover {
    background: #b81434;
  }
`

const RightSection = styled.div`
  display: flex;
  gap: 2rem;
  align-items: flex-end;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`

const LinkColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const FooterLink = styled.a`
  color: #ffcccc;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
  
  &:hover {
    color: white;
  }
`

const MapSection = styled.div`
  width: 280px;
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  margin-left: auto;
`

const MapIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 8px;
`

function Footer() {
  return (
    <FooterContainer>
      <TopStrip />
      <MainFooter>
        <FooterContent>
          <LeftSection>
            <LogoSection>
              <SayabLogo size="medium" />
              <LogoText>
                <h1>Planetario</h1>
                <p className="subtitle">Domo Digital</p>
                <p className="motto">SAYAB</p>
              </LogoText>
            </LogoSection>
            
            <SocialSection>
              <SayabBadge>SAYAB</SayabBadge>
              <SocialText>Síguenos en</SocialText>
              <SocialIcons>
                <SocialIcon href="#" aria-label="Facebook">
                  <FaFacebook />
                </SocialIcon>
                <SocialIcon href="#" aria-label="Twitter">
                  <FaTwitter />
                </SocialIcon>
                <SocialIcon href="#" aria-label="Instagram">
                  <FaInstagram />
                </SocialIcon>
                <SocialIcon href="#" aria-label="YouTube">
                  <FaYoutube />
                </SocialIcon>
              </SocialIcons>
            </SocialSection>
          </LeftSection>
          
          <RightSection>
            <LinkColumn>
              <FooterLink href="#">Cartelera</FooterLink>
              <FooterLink href="#">Horarios</FooterLink>
              <FooterLink href="#">Eventos</FooterLink>
            </LinkColumn>
            
            <LinkColumn>
              <FooterLink href="#">Noticias</FooterLink>
              <FooterLink href="#">Galería</FooterLink>
              <FooterLink href="#">Recursos</FooterLink>
            </LinkColumn>
            
            <LinkColumn>
              <FooterLink href="#">Contacto</FooterLink>
              <FooterLink href="#">Ubicación</FooterLink>
              <FooterLink href="#">Acerca de</FooterLink>
            </LinkColumn>
            
            <MapSection>
              <MapIframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3727.5!2d-87.0753!3d20.6296!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f4e59c3c8c9c9c9%3A0x8f4e59c3c8c9c9c9!2sPlaya%20del%20Carmen%2C%20Quintana%20Roo%2C%20M%C3%A9xico!5e0!3m2!1ses!2smx!4v1234567890"
                title="Ubicación del Planetario SAYAB en Playa del Carmen"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </MapSection>
          </RightSection>
        </FooterContent>
      </MainFooter>
    </FooterContainer>
  )
}

export default Footer
