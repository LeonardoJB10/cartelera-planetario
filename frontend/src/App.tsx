import { Routes, Route } from 'react-router-dom'
import styled from 'styled-components'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Cartelera from './pages/Cartelera'
import Cortos from './pages/Cortos'
import Noticias from './pages/Noticias'
import MovieDetail from './pages/MovieDetail'
import Login from './pages/Login'
import Register from './pages/Register'

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #ffffff 0%, #f8f8f8 50%, #f0f0f0 100%);
`

const MainContent = styled.main`
  flex: 1;
  padding: 20px 0;
`

function App() {
  return (
    <AuthProvider>
      <AppContainer>
        <Header />
        <MainContent>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cartelera" element={<Cartelera />} />
            <Route path="/cortos" element={<Cortos />} />
            <Route path="/noticias" element={<Noticias />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </MainContent>
        <Footer />
      </AppContainer>
    </AuthProvider>
  )
}

export default App
