import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "../Frontend/input";
import { Button } from "../Frontend/button";
import { Checkbox } from "../Frontend/checkbox";
import { Trash2, Plus, Pencil, Check, X } from "lucide-react";
import { NavigationToggle } from "../Frontend/NavigationToggle";
import { ProjectCard } from "../Frontend/ProjectCard";
import { InteractiveText } from "../Frontend/InteractiveText";
import { api, Todo } from "../Backend/api";
import { toast } from "sonner";

interface TodoScreenProps {
  userName: string;
  onLogout: () => void;
}

export function TodoScreen({ userName, onLogout }: TodoScreenProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch todos on mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const fetchedTodos = await api.getTodos();
      setTodos(fetchedTodos);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      try {
        const todo = await api.createTodo(newTodo.trim());
        setTodos([todo, ...todos]);
        setNewTodo("");
        toast.success('Task added');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to add task');
      }
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t._id === id);
    if (!todo) return;

    const optimisticTodos = todos.map((t) =>
      t._id === id ? { ...t, completed: !t.completed } : t
    );
    setTodos(optimisticTodos);

    try {
      await api.updateTodo(id, { completed: !todo.completed });
    } catch (error) {
      // Revert on error
      setTodos(todos);
      toast.error('Failed to update task');
    }
  };

  const deleteTodo = async (id: string) => {
    const optimisticTodos = todos.filter((todo) => todo._id !== id);
    setTodos(optimisticTodos);

    try {
      await api.deleteTodo(id);
      toast.success('Task deleted');
    } catch (error) {
      // Revert on error
      setTodos(todos);
      toast.error('Failed to delete task');
    }
  };

  const startEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async (id: string) => {
    if (editText.trim()) {
      const optimisticTodos = todos.map((todo) =>
        todo._id === id ? { ...todo, title: editText.trim() } : todo
      );
      setTodos(optimisticTodos);
      setEditingId(null);
      setEditText("");

      try {
        await api.updateTodo(id, { title: editText.trim() });
        toast.success('Task updated');
      } catch (error) {
        // Revert on error
        setTodos(todos);
        toast.error('Failed to update task');
      }
    }
  };

  const activeTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  const navigationItems = [
    { label: "View Tasks", onClick: () => setViewMode("list") },
    { label: "Grid View", onClick: () => setViewMode("grid") },
    { label: "Sign Out", onClick: onLogout },
  ];

  return (
    <div className="min-h-screen bg-[#e8dad1] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.02, scale: 1 }}
          transition={{ duration: 2, ease: [0.19, 1, 0.22, 1] }}
          className="absolute top-40 right-10 w-[500px] h-[500px] bg-[#c9b8ab] rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.02, scale: 1 }}
          transition={{ duration: 2, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
          className="absolute bottom-40 left-10 w-[500px] h-[500px] bg-[#d4c4b8] rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        className="relative z-10 flex items-center justify-between px-8 py-6"
      >
        <div className="text-[#2d2420] tracking-tight">taskflow</div>
        <div className="flex items-center gap-6">
          <InteractiveText className="text-sm text-[#6b5d56] hidden md:block">
            {userName}
          </InteractiveText>
          <NavigationToggle items={navigationItems} userName={userName} />
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.19, 1, 0.22, 1] }}
          className="mb-16"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-[#6b5d56] text-xs uppercase tracking-widest mb-8"
          >
            Your Personal Dashboard
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            className="text-6xl md:text-7xl lg:text-8xl mb-8 text-[#2d2420]"
          >
            <span className="italic font-serif">Organizing</span> the
            <br />
            <span className="font-light tracking-tight">unexpected</span>
          </motion.h1>

          {/* Add Task Form */}
          <motion.form
            onSubmit={handleAddTodo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            className="flex gap-3 max-w-2xl"
          >
            <Input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 bg-[#f5ebe4] border-[#c9b8ab] text-[#2d2420] h-14 px-5 focus:border-[#a89185] transition-all duration-300 placeholder:text-[#a89185]"
            />
            <Button
              type="submit"
              className="bg-[#2d2420] text-[#f5ebe4] hover:bg-[#3d3430] h-14 px-8 transition-all duration-300 rounded-full"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </motion.form>
        </motion.div>

        {/* View Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
          className="flex items-center justify-between mb-12"
        >
          {/* Stats */}
          <div className="flex gap-12 text-sm">
            <div className="flex items-baseline gap-2">
              <span className="text-[#6b5d56] uppercase tracking-wider text-xs">Active</span>
              <span className="text-[#2d2420] text-lg">{activeTodos.length}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[#6b5d56] uppercase tracking-wider text-xs">Completed</span>
              <span className="text-[#2d2420] text-lg">{completedTodos.length}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[#6b5d56] uppercase tracking-wider text-xs">Total</span>
              <span className="text-[#2d2420] text-lg">{todos.length}</span>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 text-xs uppercase tracking-wider rounded-full transition-all duration-300 ${
                viewMode === "list"
                  ? "bg-[#2d2420] text-[#f5ebe4]"
                  : "bg-[#f5ebe4] text-[#6b5d56] hover:text-[#2d2420]"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 text-xs uppercase tracking-wider rounded-full transition-all duration-300 ${
                viewMode === "grid"
                  ? "bg-[#2d2420] text-[#f5ebe4]"
                  : "bg-[#f5ebe4] text-[#6b5d56] hover:text-[#2d2420]"
              }`}
            >
              Grid
            </button>
          </div>
        </motion.div>

        {/* Active Tasks - Grid View */}
        {viewMode === "grid" && activeTodos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            className="mb-12"
          >
            <h2 className="text-[#6b5d56] mb-6 uppercase tracking-widest text-xs">
              Active Tasks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {activeTodos.map((todo, index) => (
                  <motion.div
                    key={todo._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ 
                      delay: index * 0.05, 
                      duration: 0.5, 
                      ease: [0.19, 1, 0.22, 1] 
                    }}
                  >
                    <ProjectCard
                      title={todo.title}
                      label="Complete Task"
                      onClick={() => toggleTodo(todo._id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Active Tasks - List View */}
        {viewMode === "list" && activeTodos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            className="mb-12"
          >
            <h2 className="text-[#6b5d56] mb-6 uppercase tracking-widest text-xs">
              Active Tasks
            </h2>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {activeTodos.map((todo, index) => (
                  <motion.div
                    key={todo._id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    transition={{ 
                      delay: index * 0.05, 
                      duration: 0.5, 
                      ease: [0.19, 1, 0.22, 1] 
                    }}
                    className="group flex items-center gap-4 bg-[#f5ebe4] hover:bg-[#f0e4da] border border-[#d4c4b8] hover:border-[#c9b8ab] p-6 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => toggleTodo(todo._id)}
                      className="border-[#a89185] data-[state=checked]:bg-[#2d2420] data-[state=checked]:border-[#2d2420] w-5 h-5"
                    />
                    
                    {editingId === todo._id ? (
                      <>
                        <Input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="flex-1 bg-white border-[#a89185] text-[#2d2420] h-10 px-3"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(todo._id);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => saveEdit(todo._id)}
                          className="text-[#2d2420] hover:text-[#6b5d56] transition-colors duration-300"
                        >
                          <Check className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={cancelEdit}
                          className="text-[#a89185] hover:text-[#c85a54] transition-colors duration-300"
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-[#2d2420]">{todo.title}</span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => startEdit(todo._id, todo.title)}
                          className="opacity-0 group-hover:opacity-100 text-[#a89185] hover:text-[#6b5d56] transition-all duration-300"
                        >
                          <Pencil className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => deleteTodo(todo._id)}
                          className="opacity-0 group-hover:opacity-100 text-[#a89185] hover:text-[#c85a54] transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Completed Tasks */}
        {completedTodos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
          >
            <h2 className="text-[#6b5d56] mb-6 uppercase tracking-widest text-xs">
              Completed Tasks
            </h2>
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
              <AnimatePresence mode="popLayout">
                {completedTodos.map((todo, index) => (
                  <motion.div
                    key={todo._id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    transition={{ 
                      delay: index * 0.05, 
                      duration: 0.5, 
                      ease: [0.19, 1, 0.22, 1] 
                    }}
                    className="group flex items-center gap-4 bg-[#f5ebe4]/50 hover:bg-[#f5ebe4]/70 border border-[#d4c4b8]/50 hover:border-[#d4c4b8] p-6 rounded-2xl transition-all duration-300"
                  >
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => toggleTodo(todo._id)}
                      className="border-[#a89185] data-[state=checked]:bg-[#2d2420] data-[state=checked]:border-[#2d2420] w-5 h-5"
                    />
                    <span className="flex-1 text-[#6b5d56] line-through">
                      {todo.title}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => deleteTodo(todo._id)}
                      className="opacity-0 group-hover:opacity-100 text-[#a89185] hover:text-[#c85a54] transition-all duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && todos.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            className="text-center py-20"
          >
            <p className="text-[#a89185] text-lg italic font-serif">
              No tasks yet. Begin your journey.
            </p>
          </motion.div>
        )}
        </>
        )}
      </div>
    </div>
  );
}
