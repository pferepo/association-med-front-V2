import api from './api'

export const participationService = {
  async getAll() {
    const response = await api.get('/participations')
    return response.data
  },

  async create(participationData) {
    const response = await api.post('/participations', participationData)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/participations/${id}`)
    return response.data
  }
}

export default participationService
