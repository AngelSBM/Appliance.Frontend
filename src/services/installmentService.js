import api from './api'

export const installmentService = {
  // Obtener todas las cuotas
  getAll() {
    return api.get('/Installment')
  },

  // Obtener cuota por ID
  getById(id) {
    return api.get(`/Installment/${id}`)
  },

  // Actualizar cuota
  update(id, installment) {
    return api.put(`/Installment/${id}`, installment)
  },

  // Eliminar cuota
  delete(id) {
    return api.delete(`/Installment/${id}`)
  },

  // Obtener cuotas por contrato
  getByContract(contractId) {
    return api.get(`/Installment/contract/${contractId}`)
  },

  // Obtener cuotas vencidas
  getOverdue() {
    return api.get('/Installment/overdue')
  },

  // Obtener cuotas por estado
  getByStatus(statusId) {
    return api.get(`/Installment/status/${statusId}`)
  },

  // Obtener cuotas por cliente
  getByCustomer(customerId) {
    return api.get(`/Installment/customer/${customerId}`)
  },

  // Pagar cuota
  pay(id, paymentData) {
    return api.post(`/Installment/${id}/pay`, paymentData)
  }
} 