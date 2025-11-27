import styled from 'styled-components'
import logoImage from '../assets/logoPLanetario.jpg'

const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background: transparent;
  padding: 0.5rem;
  border-radius: 8px;
`

const LogoImage = styled.img<{ size?: string; removeBackground?: boolean }>`
  width: ${props => props.size === 'large' ? '200px' : props.size === 'small' ? '100px' : '150px'};
  height: auto;
  object-fit: contain;
  background: transparent;
  border: none;
  outline: none;
  transition: transform 0.3s ease;
  
  /* Cambiar el fondo negro del logo a color rojo */
  filter: ${props => props.removeBackground ? 
    'sepia(1) saturate(2) hue-rotate(320deg) brightness(1.1)' : 
    'sepia(1) saturate(2) hue-rotate(320deg) brightness(1.1)'
  };
  
  
`

interface SayabLogoProps {
  size?: 'small' | 'medium' | 'large';
  removeBackground?: boolean;
}

function SayabLogo({ size = 'medium', removeBackground = false }: SayabLogoProps) {
  return (
    <LogoContainer>
      <LogoImage 
        src={logoImage} 
        alt="SAYAB - Planetario de Playa del Carmen" 
        size={size}
        removeBackground={removeBackground}
      />
    </LogoContainer>
  )
}

export default SayabLogo
