import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface NavItem {
  label: string
  onClick: () => void
}

interface NavigationToggleProps {
  items: NavItem[]
  userName?: string
}

export function NavigationToggle({ items, userName }: NavigationToggleProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col gap-1.5 p-2 group"
        aria-label="Toggle navigation"
      >
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 8 : 0 }}
          className="block w-6 h-[1.5px] bg-[#2d2420] origin-center transition-colors"
        />
        <motion.span
          animate={{ opacity: isOpen ? 0 : 1 }}
          className="block w-6 h-[1.5px] bg-[#2d2420]"
        />
        <motion.span
          animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -8 : 0 }}
          className="block w-6 h-[1.5px] bg-[#2d2420] origin-center"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.19, 1, 0.22, 1] }}
              className="absolute right-0 top-12 z-50 min-w-[200px] bg-[#f5ebe4] border border-[#d4c4b8] rounded-2xl shadow-lg overflow-hidden"
            >
              {userName && (
                <div className="px-5 py-4 border-b border-[#d4c4b8]">
                  <p className="text-xs text-[#6b5d56] uppercase tracking-widest">Signed in as</p>
                  <p className="text-sm text-[#2d2420] mt-1 font-medium">{userName}</p>
                </div>
              )}
              {items.map((item, i) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => { item.onClick(); setIsOpen(false) }}
                  className="w-full text-left px-5 py-3 text-sm text-[#2d2420] hover:bg-[#e8dad1] transition-colors duration-200"
                >
                  {item.label}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
