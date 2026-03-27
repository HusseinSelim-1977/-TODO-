import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "motion/react"
import { LoginScreen } from "./components/LoginScreen"
import { RegisterScreen } from "./components/RegisterScreen"
import { TodoScreen } from "./components/TodoScreen"
import { CustomCursor } from "./components/CustomCursor"
import { Toaster, toast } from "sonner"
import { api } from "./services/api"

interface User {
  _id: string
  email: string
  name: string
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<"login" | "register" | "todo">("login")
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const userData = await api.getMe()
          setUser(userData)
          setCurrentScreen("todo")
        } catch (error) {
          console.log('Auto-login failed, clearing token:', error)
          localStorage.removeItem('token')
        }
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password)
      localStorage.setItem('token', response.token)
      setUser({ _id: response._id, email: response.email, name: response.name })
      setCurrentScreen("todo")
      toast.success('Welcome back! 🎉')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      if (errorMessage.includes('Cannot connect to server')) {
        toast.error('Cannot connect to server. Is the backend running?', { duration: 8000 })
      } else if (errorMessage.toLowerCase().includes('invalid')) {
        toast.error('Invalid email or password', { duration: 5000 })
      } else {
        toast.error(errorMessage)
      }
      throw error
    }
  }

  const handleRegister = async (email: string, password: string, name: string) => {
    try {
      const response = await api.register(name, email, password)
      localStorage.setItem('token', response.token)
      setUser({ _id: response._id, email: response.email, name: response.name })
      setCurrentScreen("todo")
      toast.success('Account created successfully! 🎉')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      if (errorMessage.includes('Cannot connect to server')) {
        toast.error('Cannot connect to server. Is the backend running?', { duration: 8000 })
      } else {
        toast.error(errorMessage)
      }
      throw error
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setCurrentScreen("login")
    toast.success('Logged out successfully')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#e8dad1] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#2d2420]/20 border-t-[#2d2420] rounded-full animate-spin" />
      </div>
    )
  }

  const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.5, ease: [0.19, 1, 0.22, 1] as [number, number, number, number] },
  }

  return (
    <>
      <CustomCursor />
      <Toaster position="top-center" richColors />
      <AnimatePresence mode="wait">
        {currentScreen === "login" && (
          <motion.div key="login" {...pageTransition}>
            <LoginScreen
              onLogin={handleLogin}
              onSwitchToRegister={() => setCurrentScreen("register")}
            />
          </motion.div>
        )}
        {currentScreen === "register" && (
          <motion.div key="register" {...pageTransition}>
            <RegisterScreen
              onRegister={handleRegister}
              onSwitchToLogin={() => setCurrentScreen("login")}
            />
          </motion.div>
        )}
        {currentScreen === "todo" && user && (
          <motion.div key="todo" {...pageTransition}>
            <TodoScreen userName={user.name} onLogout={handleLogout} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
