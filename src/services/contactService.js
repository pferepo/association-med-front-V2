import api from '@/services/api'

const contactService = {

    // envoyer formulaire contact
    async sendContactForm(data) {
        const response = await api.post('/contacts', data)
        return response.data
    },

    // récupérer tous les messages (admin inbox)
    async getAllContacts() {
        const response = await api.get('/contacts')
        return response.data
    },

    // supprimer un message
    async deleteContact(id) {
        const response = await api.delete(`/contacts/${id}`)
        return response.data
    }

}

export default contactService