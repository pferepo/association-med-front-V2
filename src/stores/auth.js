import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(authService.getUser())
  const token = ref(authService.getToken())
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const isMembre = computed(() => user.value?.role === 'MEMBRE')
  const isInvite = computed(() => user.value?.role === 'INVITE')
  const userRole = computed(() => user.value?.role)
  const userName = computed(() => {
    if (user.value) {
      return `${user.value.prenom} ${user.value.nom}`
    }
    return ''
  })

  async function login(email, password) {
    loading.value = true
    error.value = null
    try {
      const response = await authService.login(email, password)
      token.value = response.token || response
      authService.setToken(token.value)
      
      // Fetch current user after login
      const currentUser = await authService.getCurrentUser()
      user.value = currentUser
      authService.setUser(currentUser)
      
      return currentUser
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur de connexion'
      throw err
    } finally {
      loading.value = false
    }
  }

  function logout() {
    authService.logout()
    user.value = null
    token.value = null
  }

  async function fetchCurrentUser() {
    if (!token.value) return null
    try {
      const currentUser = await authService.getCurrentUser()
      user.value = currentUser
      authService.setUser(currentUser)
      return currentUser
    } catch (err) {
      logout()
      throw err
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isMembre,
    isInvite,
    userRole,
    userName,
    login,
    logout,
    fetchCurrentUser
  }
})
