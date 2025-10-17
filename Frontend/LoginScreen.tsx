import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "./Frontend/input";
import { Button } from "../Frontend/button";

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSwitchToRegister: () => void;
}

export function LoginScreen({ onLogin, onSwitchToRegister }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password && !isLoading) {
      setIsLoading(true);
      try {
        await onLogin(email, password);
      } catch (error) {
        // Error is handled in parent component
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#e8dad1] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.03, scale: 1 }}
          transition={{ duration: 2, ease: [0.19, 1, 0.22, 1] }}
          className="absolute top-20 right-20 w-96 h-96 bg-[#c9b8ab] rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.03, scale: 1 }}
          transition={{ duration: 2, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
          className="absolute bottom-20 left-20 w-96 h-96 bg-[#d4c4b8] rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
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
          transition={{ duration: 0.8, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
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
            transition={{ delay: 0.4, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            className="mb-8 text-center"
          >
            <h1 className="text-6xl md:text-7xl mb-4 text-[#2d2420]">
              <span className="italic font-serif">Welcome</span>
              <br />
              <span className="font-light tracking-tight">back</span>
            </h1>
          </motion.div>

        

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            >
              <label htmlFor="email" className="block mb-3 text-[#6b5d56] text-sm">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#f5ebe4] border-[#c9b8ab] text-[#2d2420] h-14 px-5 focus:border-[#a89185] transition-all duration-300 placeholder:text-[#a89185]"
                placeholder="you@example.com"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            >
              <label htmlFor="password" className="block mb-3 text-[#6b5d56] text-sm">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#f5ebe4] border-[#c9b8ab] text-[#2d2420] h-14 px-5 focus:border-[#a89185] transition-all duration-300 placeholder:text-[#a89185]"
                placeholder="••••••••"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
              className="pt-4"
            >
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#2d2420] text-[#f5ebe4] hover:bg-[#3d3430] h-14 transition-all duration-300 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign in →'}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-center pt-6"
            >
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="w-full bg-[#c9b8ab] text-[#2d2420] hover:bg-[#a89185] h-14 transition-all duration-300 rounded-full flex items-center justify-center gap-2"
              >
                <span>👉</span>
                <span><strong>FIRST TIME? CREATE ACCOUNT HERE</strong></span>
                <span>👈</span>
              </button>
              <p className="mt-3 text-xs text-[#6b5d56]">
                Already have an account? Use the form above to sign in.
              </p>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
