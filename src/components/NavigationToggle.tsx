import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { LogOut } from "lucide-react"

interface NavigationItem {
  label: string
  onClick: () => void
}

interface NavigationToggleProps {
  items: NavigationItem[]
  userName?: string
}

export function NavigationToggle({ items, userName }: NavigationToggleProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      document.body.style.pointerEvents = "none"
    } else {
      document.body.style.overflow = "unset"
      document.body.style.pointerEvents = "auto"
      document.body.style.userSelect = "auto"
    }
    return () => {
      document.body.style.overflow = "unset"
      document.body.style.pointerEvents = "auto"
      document.body.style.userSelect = "auto"
    }
  }, [isOpen])

  const closeAndAction = (action?: () => void, e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    setIsOpen(false)
    if (action) setTimeout(action, 200)
  }

  const signOutItem = items.find(item => item.label === "Sign Out")

  const ease = [0.2, 0.8, 0.3, 1.0] as [number, number, number, number]

  return (
    <div className="relative">
      {/* Sign Out Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="relative flex items-center gap-2 px-5 py-2.5 bg-[#f5ebe4] border border-[#d4c4b8] rounded-full transition-all duration-300 gpu-accelerated overflow-hidden select-none z-50"
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.15 }}
        animate={{ backgroundColor: isOpen ? "#e8dad1" : "#f5ebe4" }}
        type="button"
      >
        <motion.div
          className="absolute inset-0 bg-[#e8dad1]"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
        <div className="relative z-10 flex items-center gap-2">
          <motion.div className="flex items-center gap-2" initial={{ opacity: 1 }} animate={{ opacity: 1 }}>
            <LogOut className="w-4 h-4 text-[#2d2420]" />
            <span className="text-sm text-[#2d2420]">Sign Out</span>
          </motion.div>
        </div>
      </motion.button>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-lg"
              style={{ zIndex: 9998, pointerEvents: "auto" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease }}
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              className="fixed inset-0 flex items-center justify-center"
              style={{ zIndex: 9999, pointerEvents: "auto" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease }}
            >
              <motion.div
                className="relative w-full max-w-md mx-4 px-8 pt-12 pb-8 select-none"
                style={{
                  background: "rgba(38,34,28,0.95)",
                  borderRadius: "1.2rem",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.48)",
                  backdropFilter: "blur(10px)",
                  pointerEvents: "auto",
                }}
                initial={{ y: -60, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -40, opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  onClick={(e) => closeAndAction(undefined, e)}
                  className="absolute top-4 right-4 text-[#f5ebe4] hover:text-white transition-colors z-50 select-none"
                  aria-label="Close confirmation"
                  type="button"
                  style={{ pointerEvents: "auto" }}
                >
                  <LogOut size={28} />
                </button>

                {/* User Info */}
                {userName && (
                  <motion.p
                    className="text-[#f5ebe4]/60 text-xs uppercase tracking-widest mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: 0.15, duration: 0.4, ease }}
                  >
                    Signed in as {userName}
                  </motion.p>
                )}

                {/* Confirmation Content */}
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: 0.25, duration: 0.4, ease }}
                  >
                    <h3 className="text-2xl md:text-3xl text-[#f5ebe4] mb-4 text-center font-medium">
                      Ready to sign out?
                    </h3>
                    <p className="text-[#f5ebe4]/70 text-sm text-center mb-6">
                      You'll need to sign in again to access your account.
                    </p>
                  </motion.div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-center">
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ delay: 0.35, duration: 0.4, ease }}
                      onClick={(e) => closeAndAction(undefined, e)}
                      className="px-6 py-3 bg-[#f5ebe4] text-[#2d2420] rounded-full hover:bg-[#e8dad1] transition-colors duration-300 font-medium select-none"
                      type="button"
                      style={{ pointerEvents: "auto" }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ delay: 0.4, duration: 0.4, ease }}
                      onClick={(e) => closeAndAction(signOutItem?.onClick, e)}
                      className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-300 font-medium select-none"
                      type="button"
                      style={{ pointerEvents: "auto" }}
                    >
                      Sign Out
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
