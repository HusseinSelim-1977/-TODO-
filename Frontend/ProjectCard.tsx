import { useState } from "react";
import { motion } from "framer-motion";

interface ProjectCardProps {
  title: string;
  label?: string;
  description?: string;
  gradient?: string;
  onClick?: () => void;
  className?: string;
}

export function ProjectCard({ 
  title, 
  label = "View Task", 
  description, 
  gradient,
  onClick,
  className = ""
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Default gradient if none provided
  const backgroundGradient = gradient || "linear-gradient(135deg, #2d2420 0%, #3d3430 100%)";

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl border border-[#d4c4b8] gpu-accelerated ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        duration: 0.15,
        ease: [0.2, 0.8, 0.3, 1.0]
      }}
    >
      {/* Background Layer - Gradient slides from left with 0ms delay */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{ 
          background: backgroundGradient,
          left: 0,
          transformOrigin: "left center"
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ 
          duration: 0.4, 
          ease: [0.33, 1, 0.68, 1], // ease-out
          delay: 0 
        }}
      />

      {/* Content Layer */}
      <div className="relative p-6 min-h-[160px] flex flex-col justify-between">
        {description && (
          <motion.p
            className="text-sm mb-4"
            animate={{ 
              color: isHovered ? "#f5ebe4" : "#6b5d56" 
            }}
            transition={{ 
              duration: 0.3, 
              delay: 0.1, // 100ms delay
              ease: [0.2, 0.8, 0.3, 1.0]
            }}
          >
            {description}
          </motion.p>
        )}
        
        <div>
          <motion.h3
            className="text-2xl mb-2 will-change-auto"
            animate={{ 
              color: isHovered ? "#f5ebe4" : "#2d2420" 
            }}
            transition={{ 
              duration: 0.3, 
              delay: 0.1, // 100ms delay
              ease: [0.2, 0.8, 0.3, 1.0]
            }}
          >
            {title}
          </motion.h3>
          
          {/* Label - Fades in on hover with 300ms delay */}
          <motion.div
            className="text-sm tracking-wider uppercase flex items-center gap-2"
            initial={{ opacity: 0, y: 5 }}
            animate={{ 
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : 5,
              color: "#f5ebe4"
            }}
            transition={{ 
              duration: 0.3, 
              delay: 0.3, // 300ms delay
              ease: [0.2, 0.8, 0.3, 1.0]
            }}
          >
            {label}
            <motion.span
              animate={{ x: isHovered ? 4 : 0 }}
              transition={{ 
                duration: 0.3, 
                delay: 0.3,
                ease: [0.2, 0.8, 0.3, 1.0]
              }}
            >
              →
            </motion.span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
