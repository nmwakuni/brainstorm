import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import Constants from 'expo-constants'

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  async config => {
    const token = await SecureStore.getItemAsync('authToken')
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
      // Token expired or invalid - clear auth and redirect to login
      await SecureStore.deleteItemAsync('authToken')
      await SecureStore.deleteItemAsync('user')
    }
    return Promise.reject(error)
  }
)

// ============================================================================
// AUTH API
// ============================================================================

export const authApi = {
  login: async (phoneNumber: string, pin: string) => {
    const { data } = await api.post('/auth/login', { phoneNumber, pin })
    return data
  },

  register: async (phoneNumber: string, pin: string, employerCode: string) => {
    const { data } = await api.post('/auth/register/employee', {
      phoneNumber,
      pin,
      employerCode,
    })
    return data
  },
}

// ============================================================================
// EMPLOYEE API
// ============================================================================

export const employeeApi = {
  getDashboard: async () => {
    const { data } = await api.get('/employees/dashboard')
    return data
  },

  getAdvances: async () => {
    const { data } = await api.get('/employees/advances')
    return data
  },
}

// ============================================================================
// ADVANCE API
// ============================================================================

export const advanceApi = {
  request: async (amount: number) => {
    const { data } = await api.post('/advances/request', { amount })
    return data
  },

  getDetails: async (id: string) => {
    const { data } = await api.get(`/advances/${id}`)
    return data
  },
}

export default api
