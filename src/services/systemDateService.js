import api from './api'

export default {
  // Obtener información de la fecha del sistema
  getSystemDate() {
    return api.get('/SystemDate')
  }
}
