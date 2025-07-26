import api from './api'

export default {
  getAll() {
    return api.get('/Installment')
  },
  getById(id) {
    return api.get(`/Installment/${id}`)
  },
  create(data) {
    return api.post('/Installment', data)
  },
  update(id, data) {
    return api.put(`/Installment/${id}`, data)
  },
  delete(id) {
    return api.delete(`/Installment/${id}`)
  },
  getByContract(contractId) {
    return api.get(`/Installment/contract/${contractId}`)
  },
  getOverdue() {
    return api.get('/Installment/overdue')
  },
  getByStatus(statusId) {
    return api.get(`/Installment/status/${statusId}`)
  },
  getByCustomer(customerId) {
    return api.get(`/Installment/customer/${customerId}`)
  },
  pay(id, data) {
    return api.post(`/Installment/${id}/pay`, data)
  },
  getSummary(params) {
    return api.get('/Installment/summary', { params })
  },
  getUpcomingDue(params) {
    return api.get('/Installment/upcoming-due', { params })
  },
  getFiltered(params) {
    return api.get('/Installment/filtered', { params })
  },
  getPaymentDetails(id) {
    return api.get(`/Installment/${id}/payment-details`)
  }
} 