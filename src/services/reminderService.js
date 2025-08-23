import api from './api'

export default {
  // Obtener resumen de recordatorios
  getSummary() {
    return api.get('/Reminder/summary')
  },

  // Obtener recordatorios próximos
  getUpcoming() {
    return api.get('/Reminder/upcoming')
  },

  // Obtener recordatorios vencidos
  getOverdue() {
    return api.get('/Reminder/overdue')
  },

  // Enviar recordatorios
  sendReminders() {
    return api.post('/Reminder/send')
  },

  // Procesar recordatorios
  processReminders() {
    return api.post('/Reminder/process')
  },

  // Enviar email de prueba
  testEmail(testEmailRequest) {
    return api.post('/Reminder/test-email', testEmailRequest)
  },

  // Obtener historial de recordatorios (nuevo endpoint)
  getHistory(fromDate, toDate) {
    const params = {}
    if (fromDate) params.fromDate = fromDate
    if (toDate) params.toDate = toDate
    return api.get('/Reminder/history', { params })
  }
} 