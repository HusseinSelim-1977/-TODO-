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
    name:     { type: String, required: true, trim: true, maxlength: 100 },
    // unique: true already creates the index — no need for userSchema.index({ email: 1 })
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
  },
  { timestamps: true },
)
// ✅ No duplicate index — unique:true above handles it
const User = mongoose.model('User', userSchema)

const todoSchema = new mongoose.Schema(
  {
    title:     { type: String, required: true, trim: true, maxlength: 500 },
    completed: { type: Boolean, default: false, index: true },  // filter by status fast
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)
// Compound index: all todo queries are scoped to a user, sorted by newest first.
// Covers: find({user}) sort({createdAt:-1}), find({user,completed}), findOneAndUpdate/Delete({user,_id})
todoSchema.index({ user: 1, createdAt: -1 })
// Partial index for active todos — speeds up "show active tasks" queries at scale
todoSchema.index({ user: 1, completed: 1 }, { partialFilterExpression: { completed: false } })
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

// RFC 5322 compliant email regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/
// Password: min 8 chars, at least one letter and one number
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

function validateEmail(email) {
  return typeof email === 'string' && EMAIL_REGEX.test(email.trim())
}

function validatePassword(password) {
  return typeof password === 'string' && PASSWORD_REGEX.test(password)
}

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

    // Presence check
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' })
    }
    // Sanitize name — strip any HTML/script tags
    const safeName = String(name).trim().replace(/<[^>]*>/g, '')
    if (!safeName || safeName.length > 100) {
      return res.status(400).json({ message: 'Name must be between 1 and 100 characters' })
    }
    // Email format validation
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' })
    }
    // Password strength: min 8 chars, at least one letter and one number
    if (!validatePassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters and contain at least one letter and one number' })
    }

    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS)
    let user
    try {
      user = await User.create({ name: safeName, email: email.toLowerCase().trim(), password: hashed })
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ message: 'Email already registered' })
      }
      throw err
    }

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
    // Validate email format before hitting the DB
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' })
    }
    const user = await User.findOne(
      { email: email.toLowerCase().trim() },
      { name: 1, email: 1, password: 1 },
    ).lean()
    // Always run bcrypt compare to prevent timing attacks (even if user not found)
    const dummyHash = '$2b$12$invalidhashfortimingprotectiononly000000000000000000000'
    const passwordMatch = await bcrypt.compare(password, user ? user.password : dummyHash)
    if (!user || !passwordMatch) {
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
    // Project only needed fields — avoids fetching password hash or timestamps
    const user = await User.findById(req.userId, { name: 1, email: 1 }).lean()
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
    // Hits compound index {user:1, createdAt:-1} perfectly — covered query, no collection scan
    const todos = await Todo.find(
      { user: req.userId },
      { title: 1, completed: 1, createdAt: 1, updatedAt: 1 },  // project only client-needed fields
    ).sort({ createdAt: -1 }).lean()
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
    // Return only the fields the client needs
    res.status(201).json({
      _id: todo._id,
      title: todo.title,
      completed: todo.completed,
      user: todo.user,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    })
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

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: 'No fields to update' })
    }

    // {user,_id} filter ensures ownership — hits the compound index
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $set: update },  // explicit $set is more efficient than implicit
      { new: true, runValidators: true, projection: { title: 1, completed: 1, createdAt: 1, updatedAt: 1 } },
    ).lean()

    if (!todo) return res.status(404).json({ message: 'Todo not found' })
    res.json(todo)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

todoRouter.delete('/:id', apiLimiter, async (req, res) => {
  try {
    // findOneAndDelete with ownership check — no extra read needed
    const todo = await Todo.findOneAndDelete(
      { _id: req.params.id, user: req.userId },
      { projection: { _id: 1 } },  // we only need to confirm it existed
    ).lean()
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
