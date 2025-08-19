import { createPinia, defineStore, type Pinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import { type SafeResult, safe } from '@components/utils/safe'

export const enum MODULES {
  ADMIN = 'Admin',
  LECTURER = 'Lecturer',
  STUDENT = 'Student',
  UNNIVERSAL = 'Unniversal'
}

interface AuthState {
  isLoggedIn: boolean
  role: MODULES | null
  intendedRole: MODULES | null
  sender: string
  regNO: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    isLoggedIn: false,
    role: null,
    intendedRole: null,
    sender: 'Authentication Store',
    regNO: null
  }),

  actions: {
    login(role: MODULES, regNO: string | null = null): SafeResult {
      return safe(() => {
        this.isLoggedIn = true
        this.role = role
        this.intendedRole = null
        this.regNO = regNO
      }, this.sender)
    },

    logout(): SafeResult {
      return safe(() => {
        this.isLoggedIn = false
        this.role = null
        this.intendedRole = null
      }, this.sender)
    },

    setIntendedRole(role: MODULES | null): SafeResult {
      return safe(() => {
        this.intendedRole = role
      }, this.sender)
    },

    reset(): SafeResult {
      return safe(() => {
        this.$reset()
      }, this.sender)
    },
  },

  persist: true,
})

const pinia: Pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export default pinia