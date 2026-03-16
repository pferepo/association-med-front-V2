import api from './api'

export const activityService = {
  async getAll() {
    const response = await api.get('/activites')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/activites/${id}`)
    return response.data
  },

  async getForGuests() {
    const response = await api.get('/activites/invite')
    return response.data
  },

  async create(activityData) {
    const response = await api.post('/activites', activityData)
    return response.data
  },

  async update(id, activityData) {
    const response = await api.put(`/activites/${id}`, activityData)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/activites/${id}`)
    return response.data
  }
}

export default activityService
