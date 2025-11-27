import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import styled from 'styled-components'
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import SayabLogo from '../components/SayabLogo'

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #900C27 0%, #b81434 100%);
  padding: 20px;
`

const LoginCard = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`

const Logo = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    color: #900C27;
    font-size: 2rem;
    margin: 0;
    font-weight: bold;
  }
  
  p {
    color: #666;
    margin: 0.5rem 0 0 0;
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const InputGroup = styled.div`
  position: relative;
`

const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #900C27;
  }
`

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
`

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  
  &:hover {
    color: #900C27;
  }
`

const LoginButton = styled.button`
  background: #900C27;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;
  
  &:hover {
    background: #b81434;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid #fcc;
  text-align: center;
`

const SuccessMessage = styled.div`
  background: #efe;
  color: #3c3;
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid #cfc;
  text-align: center;
`

const LinkText = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  
  a {
    color: #900C27;
    text-decoration: none;
    font-weight: bold;
    
    &:hover {
      text-decoration: underline;
    }
  }
`

function Login() {
  const [formData, setFormData] = useState({
    usuario: '',
    contraseña: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axios.post('http://localhost:8001/api/auth/login', formData)
      
      if (response.data.success) {
        // Usar el contexto de autenticación
        login(response.data.data.user, response.data.data.token)
        
        // Redirigir según el rol
        if (response.data.data.user.rol === 'administrador') {
          navigate('/admin')
        } else {
          navigate('/')
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer>
      <LoginCard>
        <Logo>
          <SayabLogo size="large" color="#900C27" showSubtitle={true} />
          <p>Inicia sesión en tu cuenta</p>
        </Logo>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputIcon>
              <FaUser />
            </InputIcon>
            <Input
              type="text"
              name="usuario"
              placeholder="Usuario"
              value={formData.usuario}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <InputIcon>
              <FaLock />
            </InputIcon>
            <Input
              type={showPassword ? 'text' : 'password'}
              name="contraseña"
              placeholder="Contraseña"
              value={formData.contraseña}
              onChange={handleChange}
              required
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </PasswordToggle>
          </InputGroup>

          <LoginButton type="submit" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </LoginButton>
        </Form>

        <LinkText>
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </LinkText>
      </LoginCard>
    </PageContainer>
  )
}

export default Login
