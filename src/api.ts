const API_URL = '/api'

interface AuthResponse {
  token: string
  _id: string
  name: string
  email: string
}

export interface Todo {
  _id: string
  title: string
  completed: boolean
  user: string
  createdAt: string
  updatedAt: string
}

class ApiService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let msg = `HTTP error! status: ${response.status}`
      try {
        const err = await response.json()
        msg = err.message || msg
      } catch {}
      throw new Error(msg)
    }
    return response.json()
  }

  private async fetch<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options?.headers as Record<string, string>),
      }
      if (token) headers.Authorization = `Bearer ${token}`
      const res = await fetch(url, { ...options, headers })
      return this.handleResponse<T>(res)
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection.')
      }
      throw error
    }
  }

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    return this.fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async getTodos(): Promise<Todo[]> {
    return this.fetch(`${API_URL}/todos`)
  }

  async createTodo(title: string): Promise<Todo> {
    return this.fetch(`${API_URL}/todos`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    })
  }

  async updateTodo(id: string, updates: Partial<Pick<Todo, 'title' | 'completed'>>): Promise<Todo> {
    return this.fetch(`${API_URL}/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deleteTodo(id: string): Promise<void> {
    return this.fetch(`${API_URL}/todos/${id}`, { method: 'DELETE' })
  }
}

export const api = new ApiService()
