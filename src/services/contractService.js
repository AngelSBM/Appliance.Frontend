import api from './api'

export default {
  // Obtener todos los contratos
  getAll() {
    return api.get('/Contract')
  },

  // Obtener contrato por ID
  getById(id) {
    return api.get(`/Contract/${id}`)
  },

  // Obtener contrato con detalles (incluye cuotas)
  getDetail(id) {
    return api.get(`/Contract/${id}/detail`)
  },

  // Crear nuevo contrato
  create(contract) {
    return api.post('/Contract', contract)
  },

  // Actualizar contrato
  update(id, contract) {
    return api.put(`/Contract/${id}`, contract)
  },

  // Eliminar contrato
  delete(id) {
    return api.delete(`/Contract/${id}`)
  },

  // Obtener contratos vencidos
  getOverdue() {
    return api.get('/Contract/overdue')
  },

  // Obtener contratos por cliente
  getByCustomer(customerId) {
    return api.get(`/Contract/customer/${customerId}`)
  },

  // Obtener contratos por producto
  getByProduct(productId) {
    return api.get(`/Contract/product/${productId}`)
  }
} 