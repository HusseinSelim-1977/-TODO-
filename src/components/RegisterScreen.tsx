import { useState } from "react"
import { motion } from "motion/react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
  if (!password) return { label: "", color: "", width: "0%" }
  if (password.length < 8) return { label: "Too short", color: "#c85a54", width: "25%" }
  const score = [/[A-Za-z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password), /[A-Z]/.test(password), password.length >= 12].filter(Boolean).length
  if (score <= 2) return { label: "Weak", color: "#c85a54", width: "40%" }
  if (score === 3) return { label: "Fair", color: "#d4a017", width: "65%" }
  if (score === 4) return { label: "Good", color: "#6b9e6b", width: "80%" }
  return { label: "Strong", color: "#2d7a2d", width: "100%" }
}

interface RegisterScreenProps {
  onRegister: (email: string, password: string, name: string) => Promise<void>
  onSwitchToLogin: () => void
}

export function RegisterScreen({ onRegister, onSwitchToLogin }: RegisterScreenProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({})

  const ease = [0.19, 1, 0.22, 1] as [number, number, number, number]

  const validate = () => {
    const e: typeof errors = {}
    if (!name.trim()) e.name = "Name is required"
    else if (name.trim().length > 100) e.name = "Name must be under 100 characters"
    if (!email) e.email = "Email is required"
    else if (!EMAIL_REGEX.test(email.trim())) e.email = "Please enter a valid email address"
    if (!password) e.password = "Password is required"
    else if (!PASSWORD_REGEX.test(password)) e.password = "Min 8 characters with at least one letter and one number"
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    if (isLoading) return
    setIsLoading(true)
    try {
      await onRegister(email, password, name)
    } catch (error) {
      // Error is handled in parent component
    } finally {
      setIsLoading(false)
    }
  }

  const strength = getPasswordStrength(password)

  return (
    <div className="min-h-screen bg-[#e8dad1] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.03, scale: 1 }}
          transition={{ duration: 2, ease }}
          className="absolute top-20 left-20 w-96 h-96 bg-[#d4c4b8] rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.03, scale: 1 }}
          transition={{ duration: 2, delay: 0.3, ease }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-[#c9b8ab] rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease }}
        className="relative z-10 flex items-center justify-between px-8 py-6"
      >
        <div className="text-[#2d2420] tracking-tight">-TODO-</div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-[#6b5d56]">©2025</div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center px-6" style={{ minHeight: "calc(100vh - 88px)" }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease }}
          className="w-full max-w-md"
        >
          {/* Label */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-[#6b5d56] text-xs uppercase tracking-widest mb-8 text-center"
          >
            Your Personal Task Manager
          </motion.p>

          {/* Hero Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease }}
            className="mb-8 text-center"
          >
            <h1 className="text-6xl md:text-7xl mb-4 text-[#2d2420]">
              <span className="italic font-serif">Begin your</span>
              <br />
              <span className="font-light tracking-tight">journey</span>
            </h1>
          </motion.div>

          {/* Helpful Notice */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.8 }}
            className="mb-8 p-5 bg-[#c9b8ab]/20 border-2 border-[#c9b8ab] rounded-2xl"
          >
            <p className="text-sm text-[#2d2420] text-center">
              <span className="block mb-2 text-base">✨ <strong>Step 1: Create Your Account</strong></span>
              <span className="block mb-2">Fill in the form below with any email and password (8+ characters)</span>
              <span className="block text-xs text-[#6b5d56]">Example: test@example.com / password123</span>
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease }}
            >
              <label htmlFor="name" className="block mb-3 text-[#6b5d56] text-sm">Name</label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); if (errors.name) setErrors(p => ({ ...p, name: undefined })) }}
                className={`bg-[#f5ebe4] border-[#c9b8ab] text-[#2d2420] h-14 px-5 focus:border-[#a89185] transition-all duration-300 placeholder:text-[#a89185] ${errors.name ? "border-[#c85a54]" : ""}`}
                placeholder="Your name"
                autoComplete="name"
                required
              />
              {errors.name && <p className="mt-2 text-xs text-[#c85a54]">{errors.name}</p>}
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8, ease }}
            >
              <label htmlFor="email" className="block mb-3 text-[#6b5d56] text-sm">Email</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: undefined })) }}
                className={`bg-[#f5ebe4] border-[#c9b8ab] text-[#2d2420] h-14 px-5 focus:border-[#a89185] transition-all duration-300 placeholder:text-[#a89185] ${errors.email ? "border-[#c85a54]" : ""}`}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
              {errors.email && <p className="mt-2 text-xs text-[#c85a54]">{errors.email}</p>}
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8, ease }}
            >
              <label htmlFor="password" className="block mb-3 text-[#6b5d56] text-sm">Password</label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: undefined })) }}
                  className={`bg-[#f5ebe4] border-[#c9b8ab] text-[#2d2420] h-14 px-5 pr-12 focus:border-[#a89185] transition-all duration-300 placeholder:text-[#a89185] ${errors.password ? "border-[#c85a54]" : ""}`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a89185] hover:text-[#6b5d56] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength bar */}
              {password && (
                <div className="mt-2">
                  <div className="h-1 w-full bg-[#d4c4b8] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: strength.color }}
                      initial={{ width: "0%" }}
                      animate={{ width: strength.width }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="mt-1 text-xs" style={{ color: strength.color }}>{strength.label}</p>
                </div>
              )}
              {errors.password && <p className="mt-1 text-xs text-[#c85a54]">{errors.password}</p>}
            </motion.div>

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8, ease }}
              className="pt-4"
            >
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#2d2420] text-[#f5ebe4] hover:bg-[#3d3430] h-14 transition-all duration-300 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating account..." : "Create account →"}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="text-center pt-6"
            >
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-[#6b5d56] hover:text-[#2d2420] transition-colors duration-300 text-sm"
              >
                Already have an account? <span className="underline underline-offset-4">Sign in</span>
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
