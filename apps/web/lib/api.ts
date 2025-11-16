import axios from 'axios'
import { useAuthStore } from './auth-store'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  config => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// Response interceptor to handle errors
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  register: async (data: {
    email: string
    password: string
    companyName: string
    phoneNumber: string
  }) => {
    const response = await api.post('/auth/register', data)
    return response.data
  },
}

// Employer API
export const employerApi = {
  getDashboard: async () => {
    const response = await api.get('/employers/dashboard')
    return response.data
  },

  getEmployees: async () => {
    const response = await api.get('/employers/employees')
    return response.data
  },

  addEmployee: async (employeeData: {
    firstName: string
    lastName: string
    employeeNumber: string
    phoneNumber: string
    mpesaNumber: string
    monthlySalary: number
  }) => {
    const response = await api.post('/employers/employees', employeeData)
    return response.data
  },

  updateEmployee: async (id: string, data: Partial<any>) => {
    const response = await api.patch(`/employers/employees/${id}`, data)
    return response.data
  },

  deleteEmployee: async (id: string) => {
    const response = await api.delete(`/employers/employees/${id}`)
    return response.data
  },

  getAdvances: async (status?: string) => {
    const params = status ? { status } : {}
    const response = await api.get('/employers/advances', { params })
    return response.data
  },

  updateAdvanceStatus: async (id: string, status: string, reason?: string) => {
    const response = await api.patch(`/employers/advances/${id}`, {
      status,
      reason,
    })
    return response.data
  },

  processPayroll: async () => {
    const response = await api.post('/employers/payroll/process')
    return response.data
  },

  getPayrollHistory: async () => {
    const response = await api.get('/employers/payroll')
    return response.data
  },
}
