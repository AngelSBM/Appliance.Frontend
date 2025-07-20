import api from './api'

export default {
  // Obtener todos los productos
  getAll() {
    return api.get('/Product')
  },

  // Obtener producto por ID
  getById(id) {
    return api.get(`/Product/${id}`)
  },

  // Crear nuevo producto
  create(product) {
    return api.post('/Product', product)
  },

  // Actualizar producto
  update(id, product) {
    return api.put(`/Product/${id}`, product)
  },

  // Eliminar producto
  delete(id) {
    return api.delete(`/Product/${id}`)
  },

  // Obtener contratos de un producto
  getContracts(id) {
    return api.get(`/Product/${id}/contracts`)
  }
} 