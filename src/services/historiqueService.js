import api from './api' // instance Axios configurée avec baseURL

// Service pour l'historique
export const historiqueService = {
    // Récupère tous les historiques
    async getAll() {
        try {
            const response = await api.get('/historique')
            return response.data
        } catch (error) {
            console.error('Erreur service Historique:', error)
            throw error
        }
    }
}

export default historiqueService