import { Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { FaCalendarAlt, FaNewspaper, FaUser, FaSignInAlt, FaSignOutAlt, FaFilm } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext'
import SayabLogo from './SayabLogo'

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #900C27 0%, #b81434 100%);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(144, 12, 39, 0.3);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(144, 12, 39, 0.3);
`

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`

const LogoLink = styled(Link)`
  text-decoration: none;
  
  &:hover {
    transform: scale(1.05);
    transition: transform 0.3s ease;
  }
`

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`

const AuthLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-left: 1rem;
  padding-left: 1rem;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
`

const NavLink = styled(Link)<{ $active?: boolean }>`
  color: ${props => props.$active ? '#ffffff' : '#ffcccc'};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    color: #ffffff;
  }
`

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: #ffcccc;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    color: #ffffff;
  }
`

const UserInfo = styled.div`
  color: #ffcccc;
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
`

function Header() {
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <HeaderContainer>
      <Nav>
        <LogoLink to="/">
          <SayabLogo size="small" removeBackground={true} />
        </LogoLink>
        
        <NavLinks>
          <NavLink to="/cartelera" $active={location.pathname === '/cartelera'}>
            <FaFilm />
            Cartelera
          </NavLink>
          <NavLink to="/cortos" $active={location.pathname === '/cortos'}>
            <FaCalendarAlt />
            Horarios
          </NavLink>
          <NavLink to="/noticias" $active={location.pathname === '/noticias'}>
            <FaNewspaper />
            Noticias
          </NavLink>
          
          <AuthLinks>
            {isAuthenticated ? (
              <>
                <UserInfo>Hola, {user?.usuario}</UserInfo>
                <LogoutButton onClick={handleLogout}>
                  <FaSignOutAlt />
                  Cerrar Sesión
                </LogoutButton>
              </>
            ) : (
              <>
                <NavLink to="/login" $active={location.pathname === '/login'}>
                  <FaSignInAlt />
                  Login
                </NavLink>
                <NavLink to="/register" $active={location.pathname === '/register'}>
                  <FaUser />
                  Registro
                </NavLink>
              </>
            )}
          </AuthLinks>
        </NavLinks>
      </Nav>
    </HeaderContainer>
  )
}

export default Header
