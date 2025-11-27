import styled from 'styled-components'

const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`

const LogoIcon = styled.div`
  width: 60px;
  height: 60px;
  border: 3px solid ${props => props.color || '#ffffff'};
  border-radius: 50%;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    border: 2px solid ${props => props.color || '#ffffff'};
    border-radius: 50%;
    opacity: 0.6;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    border: 2px solid ${props => props.color || '#ffffff'};
    border-radius: 50%;
    opacity: 0.8;
  }
`

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
`

const MainTitle = styled.h1`
  font-size: ${props => props.size === 'large' ? '2rem' : props.size === 'small' ? '1.2rem' : '1.5rem'};
  font-weight: bold;
  color: ${props => props.color || '#ffffff'};
  margin: 0;
  letter-spacing: 0.1em;
  font-family: 'Arial', sans-serif;
`

const Subtitle = styled.p`
  font-size: ${props => props.size === 'large' ? '0.8rem' : props.size === 'small' ? '0.6rem' : '0.7rem'};
  color: ${props => props.color || '#ffffff'};
  margin: 0;
  font-style: italic;
  opacity: 0.9;
  text-align: center;
`

interface LogoProps {
  color?: string;
  size?: 'small' | 'medium' | 'large';
  showSubtitle?: boolean;
}

function Logo({ color = '#ffffff', size = 'medium', showSubtitle = true }: LogoProps) {
  return (
    <LogoContainer>
      <LogoIcon color={color} />
      <LogoText>
        <MainTitle color={color} size={size}>
          Planetario
        </MainTitle>
        {showSubtitle && (
          <Subtitle color={color} size={size}>
            Domo Digital
          </Subtitle>
        )}
      </LogoText>
    </LogoContainer>
  )
}

export default Logo
