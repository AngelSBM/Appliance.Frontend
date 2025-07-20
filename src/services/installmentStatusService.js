import api from './api.js'

export default {
  // Obtener todos los estados
  getAll() {
    return api.get('/InstallmentStatus')
  },

  // Obtener estado por ID
  getById(id) {
    return api.get(`/InstallmentStatus/${id}`)
  },

  // Crear nuevo estado
  create(data) {
    return api.post('/InstallmentStatus', data)
  },

  // Actualizar estado
  update(id, data) {
    return api.put(`/InstallmentStatus/${id}`, data)
  },

  // Eliminar estado
  delete(id) {
    return api.delete(`/InstallmentStatus/${id}`)
  }
} 