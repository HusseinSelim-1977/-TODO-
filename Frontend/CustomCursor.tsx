import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [cursorState, setCursorState] = useState({ scale: 1, opacity: 1 });
  
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  
  // Primary dot - very fast and responsive
  const dotConfig = { damping: 20, stiffness: 1000, mass: 0.1 };
  const dotXSpring = useSpring(cursorX, dotConfig);
  const dotYSpring = useSpring(cursorY, dotConfig);
  
  // Secondary ring - smaller and more closely aligned with dot movement
  const ringConfig = { damping: 25, stiffness: 600, mass: 0.2 };
  const ringX = useSpring(cursorX, ringConfig);
  const ringY = useSpring(cursorY, ringConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      
      if (!isVisible) setIsVisible(true);
      
      // Magnetic behavior - detect nearby interactive elements
      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (target) {
        const interactive = target.closest('button, a, input, textarea, [role="button"], .cursor-hover');
        
        if (interactive) {
          const rect = interactive.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const distanceX = e.clientX - centerX;
          const distanceY = e.clientY - centerY;
          const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
          
          // Magnetic pull within 20px proximity
          if (distance < 20) {
            const pullStrength = (20 - distance) / 20;
            cursorX.set(e.clientX - distanceX * pullStrength * 0.15);
            cursorY.set(e.clientY - distanceY * pullStrength * 0.15);
          }
        }
      }
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    // Detect interactive elements for cursor scaling
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('button, a, input, textarea, [role="button"], .cursor-hover');
      
      if (isInteractive) {
        setCursorState({ scale: 1.5, opacity: 0.6 }); // Scale up on hover
      } else {
        setCursorState({ scale: 1, opacity: 1 });
      }
    };

    const handleMouseDown = () => {
      setCursorState(prev => ({ ...prev, scale: 1.2 }));
    };

    const handleMouseUp = () => {
      const isHovering = document.querySelector(':hover');
      const isInteractive = isHovering?.closest('button, a, input, textarea, [role="button"], .cursor-hover');
      setCursorState({ scale: isInteractive ? 1.5 : 1, opacity: isInteractive ? 0.6 : 1 });
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [cursorX, cursorY, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden md:block">
      {/* Primary Dot - 4px solid circle (smaller and faster) */}
      <motion.div
        style={{
          x: dotXSpring,
          y: dotYSpring,
          translateX: "-50%",
          translateY: "-50%",
        }}
        className="absolute top-0 left-0 w-1 h-1 bg-[#2d2420] rounded-full"
      />
      
      {/* Secondary Ring - 28px circle with stroke (smaller, follows dot closely) */}
      <motion.div
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          scale: cursorState.scale,
          opacity: cursorState.opacity,
        }}
        transition={{
          scale: { 
            type: "spring", 
            damping: 25, 
            stiffness: 400,
            mass: 0.3
          },
          opacity: { 
            duration: 0.2, 
            ease: [0.2, 0.8, 0.3, 1.0] 
          }
        }}
        className="absolute top-0 left-0 w-[28px] h-[28px] border-[1.5px] border-[#2d2420]/40 rounded-full will-change-transform"
      />
    </div>
  );
}
