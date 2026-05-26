import axios from 'axios'
import { mockApi } from './mockData'

// === PRESENTATION MODE TOGGLE ===
// Set to true to run directly in the browser via localStorage database (perfect for offline presentations!)
// Set to false to connect directly to your C# ASP.NET Core API server!
const USE_MOCK = true;

const API_BASE_URL = 'http://localhost:5000/api' // Default C# Web API Port

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Attach Bearer Token to outgoing Axios HTTP requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Global Service Object mapping all CRUD paths
export const apiService = {
  auth: {
    login: (credentials) => {
      if (USE_MOCK) {
        // High fidelity mock login checking credentials
        let role = 'Admin';
        if (credentials.email.includes('manager')) role = 'Manager';
        if (credentials.email.includes('worker')) role = 'Worker';

        const mockResponse = {
          accessToken: 'mock-jwt-token-123456789',
          refreshToken: 'mock-refresh-token-987654321',
          user: {
            id: 'mock-user-id',
            emri: credentials.email.split('@')[0],
            mbiemri: 'Kompania',
            email: credentials.email,
            role: role
          }
        }
        localStorage.setItem('token', mockResponse.accessToken)
        localStorage.setItem('user', JSON.stringify(mockResponse.user))
        return Promise.resolve({ data: mockResponse })
      }
      return axiosInstance.post('/auth/login', credentials)
    },
    register: (payload) => {
      if (USE_MOCK) {
        const mockResponse = {
          accessToken: 'mock-jwt-token-123456789',
          refreshToken: 'mock-refresh-token-987654321',
          user: {
            id: 'mock-user-id',
            emri: payload.emri,
            mbiemri: payload.mbiemri,
            email: payload.email,
            role: payload.role || 'Worker'
          }
        }
        localStorage.setItem('token', mockResponse.accessToken)
        localStorage.setItem('user', JSON.stringify(mockResponse.user))
        return Promise.resolve({ data: mockResponse })
      }
      return axiosInstance.post('/auth/register', payload)
    },
    logout: () => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return Promise.resolve()
    }
  },

  clients: {
    getAll: (params) => USE_MOCK ? mockApi.get('clients', params) : axiosInstance.get('/clients', { params }),
    getById: (id) => USE_MOCK ? mockApi.getById('clients', id) : axiosInstance.get(`/clients/${id}`),
    create: (data) => USE_MOCK ? mockApi.post('clients', data) : axiosInstance.post('/clients', data),
    update: (id, data) => USE_MOCK ? mockApi.put('clients', id, data) : axiosInstance.put(`/clients/${id}`, data),
    delete: (id) => USE_MOCK ? mockApi.delete('clients', id) : axiosInstance.delete(`/clients/${id}`)
  },

  projects: {
    getAll: (params) => USE_MOCK ? mockApi.get('projects', params) : axiosInstance.get('/projects', { params }),
    getById: (id) => USE_MOCK ? mockApi.getById('projects', id) : axiosInstance.get(`/projects/${id}`),
    create: (data) => USE_MOCK ? mockApi.post('projects', data) : axiosInstance.post('/projects', data),
    update: (id, data) => USE_MOCK ? mockApi.put('projects', id, data) : axiosInstance.put(`/projects/${id}`, data),
    delete: (id) => USE_MOCK ? mockApi.delete('projects', id) : axiosInstance.delete(`/projects/${id}`)
  },

  workers: {
    getAll: (params) => USE_MOCK ? mockApi.get('workers', params) : axiosInstance.get('/workers', { params }),
    getById: (id) => USE_MOCK ? mockApi.getById('workers', id) : axiosInstance.get(`/workers/${id}`),
    create: (data) => USE_MOCK ? mockApi.post('workers', data) : axiosInstance.post('/workers', data),
    update: (id, data) => USE_MOCK ? mockApi.put('workers', id, data) : axiosInstance.put(`/workers/${id}`, data),
    delete: (id) => USE_MOCK ? mockApi.delete('workers', id) : axiosInstance.delete(`/workers/${id}`)
  },

  projectPhases: {
    getAll: (params) => USE_MOCK ? mockApi.get('projectPhases', params) : axiosInstance.get('/projectPhases', { params }),
    getById: (id) => USE_MOCK ? mockApi.getById('projectPhases', id) : axiosInstance.get(`/projectPhases/${id}`),
    create: (data) => USE_MOCK ? mockApi.post('projectPhases', data) : axiosInstance.post('/projectPhases', data),
    update: (id, data) => USE_MOCK ? mockApi.put('projectPhases', id, data) : axiosInstance.put(`/projectPhases/${id}`, data),
    delete: (id) => USE_MOCK ? mockApi.delete('projectPhases', id) : axiosInstance.delete(`/projectPhases/${id}`)
  },

  tasks: {
    getAll: (params) => USE_MOCK ? mockApi.get('tasks', params) : axiosInstance.get('/tasks', { params }),
    getById: (id) => USE_MOCK ? mockApi.getById('tasks', id) : axiosInstance.get(`/tasks/${id}`),
    create: (data) => USE_MOCK ? mockApi.post('tasks', data) : axiosInstance.post('/tasks', data),
    update: (id, data) => USE_MOCK ? mockApi.put('tasks', id, data) : axiosInstance.put(`/tasks/${id}`, data),
    delete: (id) => USE_MOCK ? mockApi.delete('tasks', id) : axiosInstance.delete(`/tasks/${id}`)
  },

  taskAssignments: {
    getAll: (params) => USE_MOCK ? mockApi.get('taskAssignments', params) : axiosInstance.get('/taskAssignments', { params }),
    getById: (id) => USE_MOCK ? mockApi.getById('taskAssignments', id) : axiosInstance.get(`/taskAssignments/${id}`),
    create: (data) => USE_MOCK ? mockApi.post('taskAssignments', data) : axiosInstance.post('/taskAssignments', data),
    update: (id, data) => USE_MOCK ? mockApi.put('taskAssignments', id, data) : axiosInstance.put(`/taskAssignments/${id}`, data),
    delete: (id) => USE_MOCK ? mockApi.delete('taskAssignments', id) : axiosInstance.delete(`/taskAssignments/${id}`)
  },

  suppliers: {
    getAll: (params) => USE_MOCK ? mockApi.get('suppliers', params) : axiosInstance.get('/suppliers', { params }),
    getById: (id) => USE_MOCK ? mockApi.getById('suppliers', id) : axiosInstance.get(`/suppliers/${id}`),
    create: (data) => USE_MOCK ? mockApi.post('suppliers', data) : axiosInstance.post('/suppliers', data),
    update: (id, data) => USE_MOCK ? mockApi.put('suppliers', id, data) : axiosInstance.put(`/suppliers/${id}`, data),
    delete: (id) => USE_MOCK ? mockApi.delete('suppliers', id) : axiosInstance.delete(`/suppliers/${id}`)
  },

  materials: {
    getAll: (params) => USE_MOCK ? mockApi.get('materials', params) : axiosInstance.get('/materials', { params }),
    getById: (id) => USE_MOCK ? mockApi.getById('materials', id) : axiosInstance.get(`/materials/${id}`),
    create: (data) => USE_MOCK ? mockApi.post('materials', data) : axiosInstance.post('/materials', data),
    update: (id, data) => USE_MOCK ? mockApi.put('materials', id, data) : axiosInstance.put(`/materials/${id}`, data),
    delete: (id) => USE_MOCK ? mockApi.delete('materials', id) : axiosInstance.delete(`/materials/${id}`)
  },

  materialUsages: {
    getAll: (params) => USE_MOCK ? mockApi.get('materialUsages', params) : axiosInstance.get('/materialUsages', { params }),
    getById: (id) => USE_MOCK ? mockApi.getById('materialUsages', id) : axiosInstance.get(`/materialUsages/${id}`),
    create: (data) => USE_MOCK ? mockApi.post('materialUsages', data) : axiosInstance.post('/materialUsages', data),
    update: (id, data) => USE_MOCK ? mockApi.put('materialUsages', id, data) : axiosInstance.put(`/materialUsages/${id}`, data),
    delete: (id) => USE_MOCK ? mockApi.delete('materialUsages', id) : axiosInstance.delete(`/materialUsages/${id}`)
  },

  equipment: {
    getAll: (params) => USE_MOCK ? mockApi.get('equipment', params) : axiosInstance.get('/equipment', { params }),
    getById: (id) => USE_MOCK ? mockApi.getById('equipment', id) : axiosInstance.get(`/equipment/${id}`),
    create: (data) => USE_MOCK ? mockApi.post('equipment', data) : axiosInstance.post('/equipment', data),
    update: (id, data) => USE_MOCK ? mockApi.put('equipment', id, data) : axiosInstance.put(`/equipment/${id}`, data),
    delete: (id) => USE_MOCK ? mockApi.delete('equipment', id) : axiosInstance.delete(`/equipment/${id}`)
  },

  invoices: {
    getAll: (params) => USE_MOCK ? mockApi.get('invoices', params) : axiosInstance.get('/invoices', { params }),
    getById: (id) => USE_MOCK ? mockApi.getById('invoices', id) : axiosInstance.get(`/invoices/${id}`),
    create: (data) => USE_MOCK ? mockApi.post('invoices', data) : axiosInstance.post('/invoices', data),
    update: (id, data) => USE_MOCK ? mockApi.put('invoices', id, data) : axiosInstance.put(`/invoices/${id}`, data),
    delete: (id) => USE_MOCK ? mockApi.delete('invoices', id) : axiosInstance.delete(`/invoices/${id}`)
  }
}
export { USE_MOCK }
