import { useEffect, useState } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false)
  const [scale, setScale] = useState(1)

  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)

  const dotX = useSpring(cursorX, { damping: 20, stiffness: 1000, mass: 0.1 })
  const dotY = useSpring(cursorY, { damping: 20, stiffness: 1000, mass: 0.1 })
  const ringX = useSpring(cursorX, { damping: 25, stiffness: 600, mass: 0.2 })
  const ringY = useSpring(cursorY, { damping: 25, stiffness: 600, mass: 0.2 })

  useEffect(() => {
    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      if (!isVisible) setIsVisible(true)
    }
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      setScale(t.closest('button, a, input, textarea, [role="button"]') ? 1.5 : 1)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseover', over)
    window.addEventListener('mouseenter', () => setIsVisible(true))
    window.addEventListener('mouseleave', () => setIsVisible(false))
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', over)
    }
  }, [cursorX, cursorY, isVisible])

  if (!isVisible) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden md:block">
      <motion.div
        style={{ x: dotX, y: dotY, translateX: '-50%', translateY: '-50%' }}
        className="absolute top-0 left-0 w-1 h-1 bg-[#2d2420] rounded-full"
      />
      <motion.div
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%', scale }}
        transition={{ scale: { type: 'spring', damping: 25, stiffness: 400 } }}
        className="absolute top-0 left-0 w-7 h-7 border border-[#2d2420]/40 rounded-full"
      />
    </div>
  )
}
