import api from './api'

export const userService = {
  async getAll() {
    const response = await api.get('/users/all')
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
  },

  async update(id) {
    const response = await api.put(`/users/admin/${id}/toggle-active`)
    return response.data
  },

  // ✅ IMPORTANT: envoi reset code (email seul)
  async sendResetCode(email) {
    const response = await api.post('/users/send-reset-code', {
      email: email
    })
    return response.data
  },

  // ✅ reset password final
  async resetPassword(data) {
    const response = await api.post('/users/reset-password', data)
    return response.data
  }
}



export default userService