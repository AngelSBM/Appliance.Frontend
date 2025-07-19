import api from './api'

export const installmentStatusService = {
  // Obtener todos los estados
  getAll() {
    return api.get('/InstallmentStatus')
  },

  // Obtener estado por ID
  getById(id) {
    return api.get(`/InstallmentStatus/${id}`)
  },

  // Crear nuevo estado
  create(status) {
    return api.post('/InstallmentStatus', status)
  },

  // Actualizar estado
  update(id, status) {
    return api.put(`/InstallmentStatus/${id}`, status)
  },

  // Eliminar estado
  delete(id) {
    return api.delete(`/InstallmentStatus/${id}`)
  }
} 