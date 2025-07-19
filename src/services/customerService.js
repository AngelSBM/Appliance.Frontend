import api from './api'

export const customerService = {
  // Obtener todos los clientes
  getAll() {
    return api.get('/Customer')
  },

  // Obtener cliente por ID
  getById(id) {
    return api.get(`/Customer/${id}`)
  },

  // Crear nuevo cliente
  create(customer) {
    return api.post('/Customer', customer)
  },

  // Actualizar cliente
  update(id, customer) {
    return api.put(`/Customer/${id}`, customer)
  },

  // Eliminar cliente
  delete(id) {
    return api.delete(`/Customer/${id}`)
  },

  // Obtener puntos del cliente
  getPoints(id) {
    return api.get(`/Customer/${id}/points`)
  },

  // Obtener contratos del cliente
  getContracts(id) {
    return api.get(`/Customer/${id}/contracts`)
  }
} 