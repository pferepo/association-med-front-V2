import api from './api'

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  async getCurrentUser() {
    const response = await api.get('/users/me')
    return response.data
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  async sendResetCode(email) {
    return axios.post('/api/auth/send-reset-code', { email })
  },

  async resetPassword(data) {
    return axios.post('/api/auth/reset-password', data)
  },

  getToken() {
    return localStorage.getItem('token')
  },

  setToken(token) {
    localStorage.setItem('token', token)
  },

  getUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user))
  },

  isAuthenticated() {
    return !!this.getToken()
  },

  async register(userData) {
    const response = await api.post('/users/register', userData)
    return response.data
  }
}

export default authService
