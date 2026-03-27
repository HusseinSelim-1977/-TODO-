'use strict'

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const path = require('path')

dotenv.config({ path: path.join(__dirname, '../.env') })

// ── Database ──────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGODB_URI
if (!MONGO_URI) {
  console.error('MONGODB_URI is not set. Please configure your .env file.')
  process.exit(1)
}

mongoose
  .connect(MONGO_URI, {
    maxPoolSize: 100,          // handle thousands of concurrent users
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => { console.error('MongoDB connection error:', err); process.exit(1) })

// ── Models ────────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
  },
  { timestamps: true },
)
userSchema.index({ email: 1 })
const User = mongoose.model('User', userSchema)

const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 500 },
    completed: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)
todoSchema.index({ user: 1, createdAt: -1 })  // compound index for fast per-user queries
const Todo = mongoose.model('Todo', todoSchema)

// ── App ───────────────────────────────────────────────────────────────────────
const app = express()

app.set('trust proxy', 1)

// Security
app.use(helmet())
app.use(mongoSanitize())

// Compression
app.use(compression())

// CORS
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
]
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))

// Body parsing
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: false, limit: '10kb' }))

// Logging (skip in test)
if (process.env.NODE_ENV !== 'test') app.use(morgan('combined'))

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 min
  max: 20,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,        // 1 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
})

// ── Auth helpers ──────────────────────────────────────────────────────────────
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d'
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10)

function signToken(id) {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRE })
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized' })
  }
  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET)
    req.userId = decoded.id
    next()
  } catch {
    res.status(401).json({ message: 'Token invalid or expired' })
  }
}

// ── Auth routes ───────────────────────────────────────────────────────────────
const authRouter = express.Router()

authRouter.post('/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }
    const exists = await User.findOne({ email }).lean()
    if (exists) return res.status(400).json({ message: 'Email already registered' })

    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS)
    const user = await User.create({ name, email, password: hashed })

    res.status(201).json({
      token: signToken(user._id),
      _id: user._id,
      name: user.name,
      email: user.email,
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

authRouter.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }
    const user = await User.findOne({ email }).select('+password').lean()
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    res.json({
      token: signToken(user._id),
      _id: user._id,
      name: user.name,
      email: user.email,
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

authRouter.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean()
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ _id: user._id, name: user.name, email: user.email })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// ── Todo routes ───────────────────────────────────────────────────────────────
const todoRouter = express.Router()
todoRouter.use(authMiddleware)

todoRouter.get('/', apiLimiter, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.userId }).sort({ createdAt: -1 }).lean()
    res.json(todos)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

todoRouter.post('/', apiLimiter, async (req, res) => {
  try {
    const { title } = req.body
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' })
    }
    const todo = await Todo.create({ title: title.trim(), user: req.userId })
    res.status(201).json(todo)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

todoRouter.put('/:id', apiLimiter, async (req, res) => {
  try {
    const { title, completed } = req.body
    const update = {}
    if (title !== undefined) update.title = title.trim()
    if (completed !== undefined) update.completed = completed

    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      update,
      { new: true, runValidators: true },
    ).lean()

    if (!todo) return res.status(404).json({ message: 'Todo not found' })
    res.json(todo)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

todoRouter.delete('/:id', apiLimiter, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, user: req.userId })
    if (!todo) return res.status(404).json({ message: 'Todo not found' })
    res.json({ message: 'Deleted' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// ── Mount routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter)
app.use('/api/todos', todoRouter)

app.get('/api/health', (req, res) => res.json({ status: 'OK' }))

// 404
app.use((req, res) => res.status(404).json({ message: 'Route not found' }))

// Error handler
app.use((err, req, res, _next) => {
  console.error(err)
  res.status(res.statusCode !== 200 ? res.statusCode : 500).json({
    message: err.message || 'Internal server error',
  })
})

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`))
