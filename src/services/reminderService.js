import api from './api'

export const reminderService = {
  // Obtener todos los recordatorios
  getAll() {
    return api.get('/Reminder')
  },

  // Obtener recordatorio por ID
  getById(id) {
    return api.get(`/Reminder/${id}`)
  },

  // Crear nuevo recordatorio
  create(reminder) {
    return api.post('/Reminder', reminder)
  },

  // Eliminar recordatorio
  delete(id) {
    return api.delete(`/Reminder/${id}`)
  },

  // Obtener recordatorios por cuota
  getByInstallment(installmentId) {
    return api.get(`/Reminder/installment/${installmentId}`)
  },

  // Obtener recordatorios por cliente
  getByCustomer(customerId) {
    return api.get(`/Reminder/customer/${customerId}`)
  },

  // Obtener recordatorios vencidos
  getOverdue() {
    return api.get('/Reminder/overdue')
  },

  // Generar recordatorios vencidos
  generateOverdue() {
    return api.post('/Reminder/generate-overdue')
  }
} 