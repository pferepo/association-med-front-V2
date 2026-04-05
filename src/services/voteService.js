import api from './api'

export const voteService = {
  async getAll() {
    const response = await api.get('/votes')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/votes/${id}`)
    return response.data
  },

  async closeVote(id, approve) {
    const response = await api.put(`/votes/${id}/close`, null, {
      params: { approve }
    })
    return response.data
  },

  async participate(voteId, choix) {
    const response = await api.post(`/votes/${voteId}/participer?choix=${choix}`)
    return response.data
  },

  async submitVote(utilisateurId, voteId, choix) {
    const response = await api.post('/participation-votes', {
      utilisateurId,
      voteId,
      choix
    })
    return response.data
  },

  async getVoteResults(voteId) {
    const response = await api.get(`/participation-votes/vote/${voteId}`)
    return response.data
  },

  async deleteVote(id) {
    const response = await api.delete(`/votes/${id}`)
    return response.data
  }
}

export default voteService
