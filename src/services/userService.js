import api from './api'

export const userService = {
  async getAll() {
    const response = await api.get('/users')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  async create(userData) {
    const response = await api.post('/users/register', userData)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/users/${id}`)
    return response.data
  }
}

export default userService
