import { useState } from 'react'
import { motion } from 'framer-motion'
import { Input } from './input'
import { Button } from './button'
import { toast } from 'sonner'

interface RegisterScreenProps {
  onRegister: (name: string, email: string, password: string) => Promise<void>
  onSwitchToLogin: () => void
}

export function RegisterScreen({ onRegister, onSwitchToLogin }: RegisterScreenProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password || isLoading) return
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setIsLoading(true)
    try {
      await onRegister(name, email, password)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#e8dad1] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.03, scale: 1 }}
          transition={{ duration: 2, ease: [0.19, 1, 0.22, 1] }}
          className="absolute top-20 right-20 w-96 h-96 bg-[#c9b8ab] rounded-full blur-3xl"
        />
      </div>

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        className="relative z-10 flex items-center justify-between px-8 py-6"
      >
        <div className="text-[#2d2420] tracking-tight font-medium">-TODO-</div>
        <div className="text-sm text-[#6b5d56]">©2025</div>
      </motion.header>

      <div className="relative z-10 flex items-center justify-center px-6" style={{ minHeight: 'calc(100vh - 88px)' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
          className="w-full max-w-md"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-[#6b5d56] text-xs uppercase tracking-widest mb-8 text-center"
          >
            Create your account
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            className="mb-8 text-center"
          >
            <h1 className="text-6xl md:text-7xl mb-4 text-[#2d2420]">
              <span className="italic font-serif">Join</span>
              <br />
              <span className="font-light tracking-tight">today</span>
            </h1>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.8 }}>
              <label htmlFor="name" className="block mb-3 text-[#6b5d56] text-sm">Name</label>
              <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="h-14 px-5" placeholder="Your name" required />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}>
              <label htmlFor="reg-email" className="block mb-3 text-[#6b5d56] text-sm">Email</label>
              <Input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-14 px-5" placeholder="you@example.com" required />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }}>
              <label htmlFor="reg-password" className="block mb-3 text-[#6b5d56] text-sm">Password</label>
              <Input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 px-5" placeholder="Min. 6 characters" required />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8 }} className="pt-4">
              <Button type="submit" disabled={isLoading} className="w-full bg-[#2d2420] text-[#f5ebe4] hover:bg-[#3d3430] h-14 transition-all duration-300 rounded-full disabled:opacity-50">
                {isLoading ? 'Creating account...' : 'Create account →'}
              </Button>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.8 }} className="text-center pt-2">
              <button type="button" onClick={onSwitchToLogin} className="w-full bg-[#c9b8ab] text-[#2d2420] hover:bg-[#a89185] h-14 transition-all duration-300 rounded-full">
                Already have an account? Sign in →
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
