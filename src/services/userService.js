import api from './api'

export const userService = {

  async getAll() {
    const response = await api.get('/users/all')
    return response.data
  },

  async getAllEmails() {
    const response = await api.get('/users/emails')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/users/${id}`)
    return response.data
  },
  async getBureauMembers() {
    const response = await api.get('/users/users?role=MEMBRE_BUREAU_EXECUTIF')
    return response.data
  },
  async getCompteAppli() {
    const response = await api.get('/users/compte-appli')
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

  async updateActivation(id) {
    const response = await api.put(`/users/admin/${id}/toggle-active`)
    return response.data
  },

  async updateUser(id, userData) {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  },

  // UPLOAD IMAGE CORRIGÉ
  async uploadImage(id, file) {
    const formData = new FormData()
    formData.append('file', file)

    return await api.post(`/users/${id}/image`, formData)
  },

  async sendResetCode(email) {
    const response = await api.post('/users/send-reset-code', {
      email
    })
    return response.data
  },

  async resetPassword(data) {
    const response = await api.post('/users/reset-password', data)
    return response.data
  }
}

export default userService