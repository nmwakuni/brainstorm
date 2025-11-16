import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'

interface User {
  id: string
  phoneNumber: string
  email?: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (token: string, user: User) => Promise<void>
  logout: () => Promise<void>
  loadAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (token: string, user: User) => {
    await SecureStore.setItemAsync('authToken', token)
    await SecureStore.setItemAsync('user', JSON.stringify(user))
    set({ token, user, isAuthenticated: true })
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('authToken')
    await SecureStore.deleteItemAsync('user')
    set({ token: null, user: null, isAuthenticated: false })
  },

  loadAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken')
      const userStr = await SecureStore.getItemAsync('user')

      if (token && userStr) {
        const user = JSON.parse(userStr)
        set({ token, user, isAuthenticated: true, isLoading: false })
      } else {
        set({ isLoading: false })
      }
    } catch (error) {
      console.error('Failed to load auth:', error)
      set({ isLoading: false })
    }
  },
}))
