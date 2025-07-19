import api from './api'

export const pointTransactionService = {
  // Obtener todas las transacciones de puntos
  getAll() {
    return api.get('/PointTransaction')
  },

  // Obtener transacción por ID
  getById(id) {
    return api.get(`/PointTransaction/${id}`)
  },

  // Crear nueva transacción
  create(transaction) {
    return api.post('/PointTransaction', transaction)
  },

  // Eliminar transacción
  delete(id) {
    return api.delete(`/PointTransaction/${id}`)
  },

  // Obtener transacciones por cliente
  getByCustomer(customerId) {
    return api.get(`/PointTransaction/customer/${customerId}`)
  },

  // Obtener transacciones por cuota
  getByInstallment(installmentId) {
    return api.get(`/PointTransaction/installment/${installmentId}`)
  },

  // Obtener resumen de puntos del cliente
  getCustomerSummary(customerId) {
    return api.get(`/PointTransaction/customer/${customerId}/summary`)
  }
} 