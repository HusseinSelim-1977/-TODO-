import { useState } from "react";
import { motion } from "framer-motion";

interface InteractiveTextProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  underlineColor?: string;
  gradient?: boolean;
}

export function InteractiveText({
  children,
  href,
  onClick,
  className = "",
  underlineColor = "#2d2420",
  gradient = false,
}: InteractiveTextProps) {
  const [isHovered, setIsHovered] = useState(false);

  const Component = href ? "a" : "span";
  const props = href ? { href } : {};

  // Only set style for gradient on hover
  const textStyle =
    gradient && isHovered
      ? {
          background:
            "linear-gradient(135deg, #6b5d56 0%, #a89185 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }
      : {};

  return (
    <Component
      {...props}
      onClick={onClick}
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={textStyle}
    >
      <motion.span
        className="relative z-10"
        animate={{
          letterSpacing: isHovered ? "0.08em" : "0em",
          color: !gradient && isHovered ? "#6b5d56" : undefined,
        }}
        transition={{
          duration: 0.3,
          ease: [0.2, 0.8, 0.3, 1.0],
        }}
      >
        {children}
      </motion.span>
      {/* Underline animation from center outwards */}
      <motion.span
        className="absolute bottom-0 left-1/2 h-[1px] -translate-x-1/2 will-change-transform"
        style={{ backgroundColor: underlineColor }}
        initial={{ width: "0%" }}
        animate={{ width: isHovered ? "100%" : "0%" }}
        transition={{
          duration: 0.3,
          ease: [0.2, 0.8, 0.3, 1.0],
        }}
      />
    </Component>
  );
}