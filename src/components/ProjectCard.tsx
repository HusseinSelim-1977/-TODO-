import { useState } from 'react'
import { motion } from 'motion/react'

interface ProjectCardProps {
  title: string
  label?: string
  description?: string
  onClick?: () => void
  className?: string
}

export function ProjectCard({ title, label = 'View Task', description, onClick, className = '' }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl border border-[#d4c4b8] gpu-accelerated cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, #2d2420 0%, #3d3430 100%)', transformOrigin: 'left center' }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
      />
      <div className="relative p-6 min-h-[160px] flex flex-col justify-between">
        {description && (
          <motion.p
            className="text-sm mb-4"
            animate={{ color: isHovered ? '#f5ebe4' : '#6b5d56' }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {description}
          </motion.p>
        )}
        <div>
          <motion.h3
            className="text-2xl mb-2"
            animate={{ color: isHovered ? '#f5ebe4' : '#2d2420' }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {title}
          </motion.h3>
          <motion.div
            className="text-sm tracking-wider uppercase flex items-center gap-2"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 5, color: '#f5ebe4' }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            {label} <span>→</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
