import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Input } from './input'
import { Button } from './button'
import { Checkbox } from './checkbox'
import { Trash2, Plus, Pencil, Check, X } from 'lucide-react'
import { NavigationToggle } from './NavigationToggle'
import { ProjectCard } from './ProjectCard'
import { InteractiveText } from './InteractiveText'
import { api, type Todo } from '../services/api'
import { toast } from 'sonner'

interface TodoScreenProps {
  userName: string
  onLogout: () => void
}

export function TodoScreen({ userName, onLogout }: TodoScreenProps) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.getTodos()
      .then(setTodos)
      .catch(() => toast.error('Failed to fetch tasks'))
      .finally(() => setIsLoading(false))
  }, [])

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return
    try {
      const todo = await api.createTodo(newTodo.trim())
      setTodos((prev) => [todo, ...prev])
      setNewTodo('')
      toast.success('Task added')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add task')
    }
  }

  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t._id === id)
    if (!todo) return
    setTodos((prev) => prev.map((t) => t._id === id ? { ...t, completed: !t.completed } : t))
    try {
      await api.updateTodo(id, { completed: !todo.completed })
    } catch {
      setTodos((prev) => prev.map((t) => t._id === id ? { ...t, completed: todo.completed } : t))
      toast.error('Failed to update task')
    }
  }

  const deleteTodo = async (id: string) => {
    const prev = todos
    setTodos((t) => t.filter((x) => x._id !== id))
    try {
      await api.deleteTodo(id)
      toast.success('Task deleted')
    } catch {
      setTodos(prev)
      toast.error('Failed to delete task')
    }
  }

  const saveEdit = async (id: string) => {
    if (!editText.trim()) return
    const prev = todos
    setTodos((t) => t.map((x) => x._id === id ? { ...x, title: editText.trim() } : x))
    setEditingId(null)
    try {
      await api.updateTodo(id, { title: editText.trim() })
      toast.success('Task updated')
    } catch {
      setTodos(prev)
      toast.error('Failed to update task')
    }
  }

  const activeTodos = todos.filter((t) => !t.completed)
  const completedTodos = todos.filter((t) => t.completed)

  const navItems = [
    { label: 'List View', onClick: () => setViewMode('list') },
    { label: 'Grid View', onClick: () => setViewMode('grid') },
    { label: 'Sign Out', onClick: onLogout },
  ]

  return (
    <div className="min-h-screen bg-[#e8dad1] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.02, scale: 1 }}
          transition={{ duration: 2, ease: [0.19, 1, 0.22, 1] }}
          className="absolute top-40 right-10 w-[500px] h-[500px] bg-[#c9b8ab] rounded-full blur-3xl"
        />
      </div>

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        className="relative z-10 flex items-center justify-between px-8 py-6"
      >
        <div className="text-[#2d2420] tracking-tight font-medium">-TODO-</div>
        <div className="flex items-center gap-6">
          <InteractiveText className="text-sm text-[#6b5d56] hidden md:block">
            {userName}
          </InteractiveText>
          <NavigationToggle items={navItems} userName={userName} />
        </div>
      </motion.header>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-[#c9b8ab] border-t-[#2d2420] rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.19, 1, 0.22, 1] }}
              className="mb-16"
            >
              <p className="text-[#6b5d56] text-xs uppercase tracking-widest mb-8">Your Personal Dashboard</p>
              <h1 className="text-6xl md:text-7xl lg:text-8xl mb-8 text-[#2d2420]">
                <span className="italic font-serif">Organizing</span> the
                <br />
                <span className="font-light tracking-tight">unexpected</span>
              </h1>

              <form onSubmit={handleAddTodo} className="flex gap-3 max-w-2xl">
                <Input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Add a new task..."
                  className="flex-1 h-14 px-5"
                />
                <Button type="submit" className="bg-[#2d2420] text-[#f5ebe4] hover:bg-[#3d3430] h-14 px-8 rounded-full">
                  <Plus className="w-5 h-5" />
                </Button>
              </form>
            </motion.div>

            <div className="flex items-center justify-between mb-12">
              <div className="flex gap-12 text-sm">
                {[['Active', activeTodos.length], ['Completed', completedTodos.length], ['Total', todos.length]].map(([label, count]) => (
                  <div key={label} className="flex items-baseline gap-2">
                    <span className="text-[#6b5d56] uppercase tracking-wider text-xs">{label}</span>
                    <span className="text-[#2d2420] text-lg">{count}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                {(['list', 'grid'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-2 text-xs uppercase tracking-wider rounded-full transition-all duration-300 ${
                      viewMode === mode ? 'bg-[#2d2420] text-[#f5ebe4]' : 'bg-[#f5ebe4] text-[#6b5d56] hover:text-[#2d2420]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Tasks */}
            {activeTodos.length > 0 && (
              <div className="mb-12">
                <h2 className="text-[#6b5d56] mb-6 uppercase tracking-widest text-xs">Active Tasks</h2>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence mode="popLayout">
                      {activeTodos.map((todo, i) => (
                        <motion.div
                          key={todo._id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: i * 0.05, duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                        >
                          <ProjectCard title={todo.title} label="Complete Task" onClick={() => toggleTodo(todo._id)} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {activeTodos.map((todo, i) => (
                        <motion.div
                          key={todo._id}
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                          transition={{ delay: i * 0.05, duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                          className="group flex items-center gap-4 bg-[#f5ebe4] hover:bg-[#f0e4da] border border-[#d4c4b8] hover:border-[#c9b8ab] p-6 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                          <Checkbox checked={todo.completed} onCheckedChange={() => toggleTodo(todo._id)} />
                          {editingId === todo._id ? (
                            <>
                              <Input
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="flex-1 h-10 px-3"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEdit(todo._id)
                                  if (e.key === 'Escape') setEditingId(null)
                                }}
                              />
                              <button onClick={() => saveEdit(todo._id)} className="text-[#2d2420] hover:text-[#6b5d56]"><Check className="w-4 h-4" /></button>
                              <button onClick={() => setEditingId(null)} className="text-[#a89185] hover:text-[#c85a54]"><X className="w-4 h-4" /></button>
                            </>
                          ) : (
                            <>
                              <span className="flex-1 text-[#2d2420]">{todo.title}</span>
                              <button onClick={() => { setEditingId(todo._id); setEditText(todo.title) }} className="opacity-0 group-hover:opacity-100 text-[#a89185] hover:text-[#6b5d56] transition-all duration-300"><Pencil className="w-4 h-4" /></button>
                              <button onClick={() => deleteTodo(todo._id)} className="opacity-0 group-hover:opacity-100 text-[#a89185] hover:text-[#c85a54] transition-all duration-300"><Trash2 className="w-4 h-4" /></button>
                            </>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}

            {/* Completed Tasks */}
            {completedTodos.length > 0 && (
              <div>
                <h2 className="text-[#6b5d56] mb-6 uppercase tracking-widest text-xs">Completed Tasks</h2>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                  <AnimatePresence mode="popLayout">
                    {completedTodos.map((todo, i) => (
                      <motion.div
                        key={todo._id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        transition={{ delay: i * 0.05, duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                        className="group flex items-center gap-4 bg-[#f5ebe4]/50 border border-[#d4c4b8]/50 p-6 rounded-2xl transition-all duration-300"
                      >
                        <Checkbox checked={todo.completed} onCheckedChange={() => toggleTodo(todo._id)} />
                        <span className="flex-1 text-[#6b5d56] line-through">{todo.title}</span>
                        <button onClick={() => deleteTodo(todo._id)} className="opacity-0 group-hover:opacity-100 text-[#a89185] hover:text-[#c85a54] transition-all duration-300"><Trash2 className="w-4 h-4" /></button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {todos.length === 0 && (
              <div className="text-center py-20">
                <p className="text-[#a89185] text-lg italic font-serif">No tasks yet. Begin your journey.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
