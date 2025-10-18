// api.ts

const API_URL = '/api'; // Set to your Express/Mongoose backend route root

interface AuthResponse {
  token: string;
  _id: string;
  name: string;
  email: string;
}

interface UserResponse {
  _id: string;
  name: string;
  email: string;
}

export interface Todo {
  _id: string;
  title: string;
  completed: boolean;
  user: string;
  createdAt: string;
  updatedAt: string;
}

class ApiService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {}
      throw new Error(errorMessage);
    }
    return response.json();
  }

  private async fetchWithErrorHandling<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      const token = localStorage.getItem('token');
      // Always build headers object with only defined properties
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options && options.headers ? options.headers as Record<string, string> : {}),
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await fetch(url, {
        ...options,
        headers,
      });
      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection.');
      }
      throw error;
    }
  }

  // Auth endpoints
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    return await this.fetchWithErrorHandling<AuthResponse>(`${API_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return await this.fetchWithErrorHandling<AuthResponse>(`${API_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe(): Promise<UserResponse> {
    return await this.fetchWithErrorHandling<UserResponse>(`${API_URL}/auth/me`, {
      method: 'GET',
    });
  }

  // Todo endpoints
  async getTodos(): Promise<Todo[]> {
    return await this.fetchWithErrorHandling<Todo[]>(`${API_URL}/todos`, {
      method: 'GET',
    });
  }

  async createTodo(title: string): Promise<Todo> {
    return await this.fetchWithErrorHandling<Todo>(`${API_URL}/todos`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  }

  async updateTodo(id: string, updates: Partial<Pick<Todo, 'title' | 'completed'>>): Promise<Todo> {
    return await this.fetchWithErrorHandling<Todo>(`${API_URL}/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTodo(id: string): Promise<void> {
    return await this.fetchWithErrorHandling<void>(`${API_URL}/todos/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();
