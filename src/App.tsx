import { useState, useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import { LoginScreen } from './components/LoginScreen'
import { RegisterScreen } from './components/RegisterScreen'
import { TodoScreen } from './components/TodoScreen'
import { CustomCursor } from './components/CustomCursor'
import { api } from './api'

type Screen = 'login' | 'register' | 'todos'

export default function App() {
  const [screen, setScreen] = useState<Screen>('login')
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const name = localStorage.getItem('userName')
    if (token && name) {
      setUserName(name)
      setScreen('todos')
    }
  }, [])

  const handleLogin = async (email: string, password: string) => {
    const data = await api.login(email, password)
    localStorage.setItem('token', data.token)
    localStorage.setItem('userName', data.name)
    setUserName(data.name)
    setScreen('todos')
    toast.success(`Welcome back, ${data.name}`)
  }

  const handleRegister = async (name: string, email: string, password: string) => {
    const data = await api.register(name, email, password)
    localStorage.setItem('token', data.token)
    localStorage.setItem('userName', data.name)
    setUserName(data.name)
    setScreen('todos')
    toast.success(`Account created! Welcome, ${data.name}`)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    setUserName('')
    setScreen('login')
    toast.success('Signed out')
  }

  return (
    <>
      <CustomCursor />
      <Toaster position="bottom-right" richColors />
      {screen === 'login' && (
        <LoginScreen
          onLogin={handleLogin}
          onSwitchToRegister={() => setScreen('register')}
        />
      )}
      {screen === 'register' && (
        <RegisterScreen
          onRegister={handleRegister}
          onSwitchToLogin={() => setScreen('login')}
        />
      )}
      {screen === 'todos' && (
        <TodoScreen userName={userName} onLogout={handleLogout} />
      )}
    </>
  )
}
