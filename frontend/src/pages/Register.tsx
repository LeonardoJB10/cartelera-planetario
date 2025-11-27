import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import styled from 'styled-components'
import { FaUser, FaLock, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa'
import axios from 'axios'
import SayabLogo from '../components/SayabLogo'

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #900C27 0%, #b81434 100%);
  padding: 20px;
`

const RegisterCard = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
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

const RegisterButton = styled.button`
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

const PasswordStrength = styled.div`
  margin-top: 0.5rem;
  font-size: 0.8rem;
  
  &.weak { color: #c33; }
  &.medium { color: #cc3; }
  &.strong { color: #3c3; }
`

function Register() {
  const [formData, setFormData] = useState({
    nombre: '',
    usuario: '',
    correo: '',
    contraseña: '',
    confirmarContraseña: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
    setSuccess('')
  }

  const getPasswordStrength = (password: string) => {
    if (password.length < 4) return { level: 'weak', text: 'Débil' }
    if (password.length < 6) return { level: 'medium', text: 'Media' }
    return { level: 'strong', text: 'Fuerte' }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validaciones
    if (formData.contraseña !== formData.confirmarContraseña) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    if (formData.contraseña.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres')
      setLoading(false)
      return
    }

    try {
      const { confirmarContraseña, ...registerData } = formData
      const response = await axios.post('http://localhost:8001/api/auth/register', registerData)
      
      if (response.data.success) {
        setSuccess('Usuario registrado exitosamente. Redirigiendo al login...')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar usuario')
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = getPasswordStrength(formData.contraseña)

  return (
    <PageContainer>
      <RegisterCard>
        <Logo>
          <SayabLogo size="large" color="#900C27" showSubtitle={true} />
          <p>Crea tu cuenta</p>
        </Logo>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputIcon>
              <FaUser />
            </InputIcon>
            <Input
              type="text"
              name="nombre"
              placeholder="Nombre completo"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <InputIcon>
              <FaUser />
            </InputIcon>
            <Input
              type="text"
              name="usuario"
              placeholder="Nombre de usuario"
              value={formData.usuario}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <InputIcon>
              <FaEnvelope />
            </InputIcon>
            <Input
              type="email"
              name="correo"
              placeholder="Correo electrónico"
              value={formData.correo}
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
            {formData.contraseña && (
              <PasswordStrength className={passwordStrength.level}>
                Fortaleza: {passwordStrength.text}
              </PasswordStrength>
            )}
          </InputGroup>

          <InputGroup>
            <InputIcon>
              <FaLock />
            </InputIcon>
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmarContraseña"
              placeholder="Confirmar contraseña"
              value={formData.confirmarContraseña}
              onChange={handleChange}
              required
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </PasswordToggle>
          </InputGroup>

          <RegisterButton type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </RegisterButton>
        </Form>

        <LinkText>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </LinkText>
      </RegisterCard>
    </PageContainer>
  )
}

export default Register
