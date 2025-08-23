import reminderService from './reminderService'
import systemDateService from './systemDateService'

class AutomaticReminderService {
  constructor() {
    this.isRunning = false
    this.interval = null
    this.checkInterval = 5 * 60 * 1000 // 5 minutos
  }

  // Iniciar el servicio automático
  start() {
    if (this.isRunning) return
    
    try {
      this.isRunning = true
      console.log('Servicio de recordatorios automáticos iniciado')
      
      // Ejecutar inmediatamente
      this.processReminders()
      
      // Configurar intervalo para ejecutar cada 5 minutos
      this.interval = setInterval(() => {
        if (this.isRunning) {
          this.processReminders()
        }
      }, this.checkInterval)
    } catch (error) {
      console.error('Error iniciando servicio automático:', error)
      this.isRunning = false
    }
  }

  // Detener el servicio
  stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
    this.isRunning = false
    console.log('Servicio de recordatorios automáticos detenido')
  }

  // Procesar recordatorios automáticamente
  async processReminders() {
    try {
      // Verificar que el servicio esté activo antes de procesar
      if (!this.isRunning) {
        return
      }
      
      // Obtener fecha del sistema
      const systemDateResponse = await systemDateService.getSystemDate()
      const systemDate = systemDateResponse.data
      
      console.log('Procesando recordatorios automáticos - Fecha:', new Date(systemDate.currentSystemDate).toLocaleDateString('es-ES'))
      
             // Procesar recordatorios
       const processResponse = await reminderService.processReminders()
       const summary = processResponse.data
       
       // Si hay recordatorios para enviar, enviarlos automáticamente
       if (summary.totalUpcomingReminders > 0 || summary.totalOverdueReminders > 0) {
         console.log(`Enviando ${summary.totalUpcomingReminders + summary.totalOverdueReminders} recordatorios automáticamente`)
         const sendResponse = await reminderService.sendReminders()
         if (sendResponse.data) {
           console.log('Recordatorios enviados automáticamente')
         } else {
           console.log('Error al enviar recordatorios automáticamente')
         }
       } else {
         console.log('No hay recordatorios para enviar')
       }
      
    } catch (error) {
      console.error('Error en procesamiento automático de recordatorios:', error)
    }
  }

  // Verificar si el servicio está ejecutándose
  isActive() {
    return this.isRunning
  }

  // Cambiar el intervalo de verificación
  setCheckInterval(minutes) {
    this.checkInterval = minutes * 60 * 1000
    
    if (this.isRunning) {
      this.stop()
      this.start()
    }
  }
}

// Crear una instancia singleton
const automaticReminderService = new AutomaticReminderService()

export default automaticReminderService
