import api from './api.js'

export default {
  // Obtener todas las cuotas
  getAll() {
    return api.get('/Installment')
  },

  // Obtener cuota por ID
  getById(id) {
    return api.get(`/Installment/${id}`)
  },

  // Actualizar cuota
  update(id, data) {
    return api.put(`/Installment/${id}`, data)
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
  pay(id, data) {
    return api.post(`/Installment/${id}/pay`, data)
  },

  // NUEVOS ENDPOINTS

  // Obtener resumen estadístico
  getSummary(filters = {}) {
    return api.get('/Installment/summary', { params: filters })
  },

  // Obtener cuotas próximas a vencer
  getUpcomingDue(filters = {}) {
    return api.get('/Installment/upcoming-due', { params: filters })
  },

  // Obtener cuotas filtradas con paginación
  getFiltered(filters = {}) {
    return api.get('/Installment/filtered', { params: filters })
  }
} 