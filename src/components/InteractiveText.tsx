import { useState } from 'react'
import { motion } from 'motion/react'

interface InteractiveTextProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  className?: string
  underlineColor?: string
}

export function InteractiveText({
  children,
  href,
  onClick,
  className = '',
  underlineColor = '#2d2420',
}: InteractiveTextProps) {
  const [isHovered, setIsHovered] = useState(false)
  const Comp = href ? 'a' : 'span'

  return (
    <Comp
      href={href}
      onClick={onClick}
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.span
        className="relative z-10"
        animate={{ letterSpacing: isHovered ? '0.08em' : '0em' }}
        transition={{ duration: 0.3, ease: [0.2, 0.8, 0.3, 1.0] }}
      >
        {children}
      </motion.span>
      <motion.span
        className="absolute bottom-0 left-1/2 h-[1px] -translate-x-1/2"
        style={{ backgroundColor: underlineColor }}
        initial={{ width: '0%' }}
        animate={{ width: isHovered ? '100%' : '0%' }}
        transition={{ duration: 0.3, ease: [0.2, 0.8, 0.3, 1.0] }}
      />
    </Comp>
  )
}
