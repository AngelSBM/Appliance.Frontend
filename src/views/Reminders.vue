<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
                 <h1 class="text-h4 mb-4">Recordatorios Enviados</h1>
         <p class="text-body-1 mb-4">
           Visualización de recordatorios automáticos enviados a clientes. El sistema procesa y envía recordatorios automáticamente cada 5 minutos.
         </p>
      </v-col>
    </v-row>

         <!-- Información de fecha del sistema y estado automático -->
     <v-row>
       <v-col cols="12">
         <v-alert
           :type="systemDate.isDateModified ? 'warning' : 'success'"
           border="left"
           colored-border
           elevation="2"
         >
           <div class="d-flex align-center">
             <v-icon left>{{ systemDate.isDateModified ? 'mdi-clock-alert' : 'mdi-clock-check' }}</v-icon>
             <div>
               <strong>Fecha del Sistema:</strong> {{ formatDate(systemDate.currentSystemDate) }}
               <span v-if="systemDate.isDateModified" class="ml-2">
                 (Fecha modificada para pruebas)
               </span>
               <div class="text-caption mt-1">
                 <v-icon size="small" :color="automaticServiceActive ? 'success' : 'error'" class="mr-1">
                   {{ automaticServiceActive ? 'mdi-auto-fix' : 'mdi-auto-fix-off' }}
                 </v-icon>
                 {{ automaticServiceActive ? 
                   'Servicio automático activo - Los recordatorios se procesan cada 5 minutos' : 
                   'Servicio automático inactivo' }}
               </div>
             </div>
           </div>
         </v-alert>
       </v-col>
     </v-row>

    <!-- Resumen de recordatorios -->
    <v-row>
      <v-col cols="12" md="3">
        <v-card color="primary" dark>
          <v-card-text>
            <div class="text-h4">{{ summary.totalUpcomingReminders || 0 }}</div>
            <div>Recordatorios Próximos</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card color="error" dark>
          <v-card-text>
            <div class="text-h4">{{ summary.totalOverdueReminders || 0 }}</div>
            <div>Recordatorios Vencidos</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card color="success" dark>
          <v-card-text>
            <div class="text-h4">{{ summary.emailsSentToday || 0 }}</div>
            <div>Emails Enviados Hoy</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card color="info" dark>
          <v-card-text>
            <div class="text-h4">${{ formatCurrency(summary.totalOverdueAmount || 0) }}</div>
            <div>Monto Total Vencido</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

         <!-- Información del servicio automático -->
     <v-row>
       <v-col cols="12">
         <v-card>
           <v-card-title>
             Estado del Sistema
             <v-spacer></v-spacer>
             <v-btn
               color="info"
               @click="showHistoryDialog = true"
               class="mr-2"
             >
               <v-icon left>mdi-history</v-icon>
               Ver Historial Completo
             </v-btn>
           </v-card-title>
           <v-card-text>
             <div class="d-flex align-center">
               <v-icon :color="automaticServiceActive ? 'success' : 'error'" class="mr-2">
                 {{ automaticServiceActive ? 'mdi-auto-fix' : 'mdi-auto-fix-off' }}
               </v-icon>
               <span>
                 <strong>Servicio Automático:</strong> 
                 {{ automaticServiceActive ? 'Activo - Los recordatorios se procesan automáticamente cada 5 minutos' : 'Inactivo' }}
               </span>
             </div>
           </v-card-text>
         </v-card>
       </v-col>
     </v-row>

    <!-- Tabs para diferentes tipos de recordatorios -->
    <v-row>
      <v-col cols="12">
        <v-card>
                     <v-tabs v-model="activeTab" background-color="primary" dark>
             <v-tab>Por Vencer</v-tab>
             <v-tab>Vencidos</v-tab>
           </v-tabs>

          <v-tabs-items v-model="activeTab">
            <!-- Tab de recordatorios próximos -->
            <v-tab-item>
              <v-card-text>
                <v-data-table
                  :headers="headers"
                  :items="upcomingReminders"
                  :loading="loading"
                  :items-per-page="10"
                >
                  <template v-slot:item.dueDate="{ item }">
                    {{ formatDate(item.dueDate) }}
                  </template>
                  <template v-slot:item.amount="{ item }">
                    ${{ formatCurrency(item.amount) }}
                  </template>
                  <template v-slot:item.daysUntilDue="{ item }">
                    <v-chip
                      :color="item.daysUntilDue <= 3 ? 'warning' : 'success'"
                      small
                    >
                      {{ item.daysUntilDue }} días
                    </v-chip>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-tab-item>

            <!-- Tab de recordatorios vencidos -->
            <v-tab-item>
              <v-card-text>
                <v-data-table
                  :headers="headers"
                  :items="overdueReminders"
                  :loading="loading"
                  :items-per-page="10"
                >
                  <template v-slot:item.dueDate="{ item }">
                    {{ formatDate(item.dueDate) }}
                  </template>
                  <template v-slot:item.amount="{ item }">
                    ${{ formatCurrency(item.amount) }}
                  </template>
                  <template v-slot:item.daysOverdue="{ item }">
                    <v-chip color="error" small>
                      {{ item.daysOverdue }} días vencido
                    </v-chip>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-tab-item>
          </v-tabs-items>
        </v-card>
      </v-col>
    </v-row>

    

     <!-- Diálogo para historial de recordatorios -->
     <v-dialog v-model="showHistoryDialog" max-width="1200px">
       <v-card>
         <v-card-title>
           <span class="text-h5">Historial Completo de Recordatorios Enviados</span>
           <v-spacer></v-spacer>
           <v-btn color="primary" @click="loadReminderHistory" :loading="loading">
             <v-icon left>mdi-refresh</v-icon> Actualizar
           </v-btn>
         </v-card-title>

         <v-card-text>
                       <v-data-table
              :headers="historyHeaders"
              :items="reminderHistory"
              :loading="loading"
              :items-per-page="15"
            >
                           <template v-slot:item.date="{ item }">
                {{ formatDateTime(item.date) }}
              </template>
              <template v-slot:item.dueDate="{ item }">
                {{ formatDate(item.dueDate) }}
              </template>
              <template v-slot:item.amount="{ item }">
                ${{ formatCurrency(item.amount) }}
              </template>
              <template v-slot:item.isOverdue="{ item }">
                <v-chip v-if="item.isOverdue" color="error" small>
                  {{ item.daysOverdue }} días vencido
                </v-chip>
                <v-chip v-else color="success" small>
                  Al día
                </v-chip>
              </template>
           </v-data-table>
         </v-card-text>

         <v-card-actions>
           <v-spacer></v-spacer>
           <v-btn color="blue darken-1" text @click="showHistoryDialog = false">
             Cerrar
           </v-btn>
         </v-card-actions>
       </v-card>
     </v-dialog>
   </v-container>
 </template>

<script>
import reminderService from '@/services/reminderService'
import systemDateService from '@/services/systemDateService'
import automaticReminderService from '@/services/automaticReminderService'

export default {
  name: 'Reminders',
  inject: ['toast'],
    data() {
    return {
      loading: false,
      activeTab: 0,
      showHistoryDialog: false,
      summary: {
        totalUpcomingReminders: 0,
        totalOverdueReminders: 0,
        emailsSentToday: 0,
        totalOverdueAmount: 0,
        totalUpcomingAmount: 0
      },
      reminderHistory: [],
      systemDate: {
        currentSystemDate: new Date(),
        isDateModified: false
      },
      automaticServiceActive: false,
      upcomingReminders: [],
      overdueReminders: [],
                            headers: [
          { text: 'Cliente', value: 'customerName' },
          { text: 'Email', value: 'customerEmail' },
          { text: 'Producto', value: 'productName' },
          { text: 'Vencimiento', value: 'dueDate' },
          { text: 'Monto', value: 'amount' },
          { text: 'Días Restantes', value: 'daysUntilDue' },
          { text: 'Días Vencido', value: 'daysOverdue' },
          { text: 'Cuota', value: 'installmentNumber' },
          { text: 'Total Cuotas', value: 'totalInstallments' },
          { text: 'Contrato', value: 'contractNumber' }
        ],
        historyHeaders: [
          { text: 'Fecha Envío', value: 'date' },
          { text: 'Cliente', value: 'customerName' },
          { text: 'Email', value: 'customerEmail' },
          { text: 'Producto', value: 'productName' },
          { text: 'Vencimiento', value: 'dueDate' },
          { text: 'Monto', value: 'amount' },
          { text: 'Cuota', value: 'installmentNumber' },
          { text: 'Total Cuotas', value: 'totalInstallments' },
          { text: 'Contrato', value: 'contractNumber' },
          { text: 'Estado', value: 'isOverdue' }
        ]
    }
  },
                                           mounted() {
         // Hacer el servicio disponible globalmente en el componente
         this.$automaticReminderService = automaticReminderService
         this.automaticServiceActive = automaticReminderService.isActive()
         this.loadReminders()
       },
   computed: {
     automaticReminderService() {
       return this.$automaticReminderService || { 
         isActive: () => false,
         start: () => {},
         stop: () => {}
       }
     }
   },
   watch: {
     showHistoryDialog(newVal) {
       if (newVal) {
         this.loadReminderHistory()
       }
     }
   },
     methods: {

                               async loadReminders() {
         this.loading = true
         try {
           // Cargar fecha del sistema
           const systemDateResponse = await systemDateService.getSystemDate()
           this.systemDate = systemDateResponse.data
           
           // Cargar resumen de recordatorios
           const summaryResponse = await reminderService.getSummary()
           this.summary = summaryResponse.data

           // Cargar recordatorios próximos
           const upcomingResponse = await reminderService.getUpcoming()
           this.upcomingReminders = upcomingResponse.data

           // Cargar recordatorios vencidos
           const overdueResponse = await reminderService.getOverdue()
           this.overdueReminders = overdueResponse.data
         } catch (error) {
           console.error('Error loading reminders:', error)
           this.toast.error('Error al cargar los recordatorios')
         } finally {
           this.loading = false
         }
       },

    

         formatDate(date) {
       return new Date(date).toLocaleDateString('es-ES')
     },

     formatDateTime(date) {
       return new Date(date).toLocaleString('es-ES', {
         year: 'numeric',
         month: '2-digit',
         day: '2-digit',
         hour: '2-digit',
         minute: '2-digit'
       })
     },

     formatCurrency(amount) {
       return new Intl.NumberFormat('es-CO').format(amount)
     },

    

                                               async loadReminderHistory() {
         try {
           const response = await reminderService.getHistory()
           this.reminderHistory = response.data
         } catch (error) {
           console.error('Error loading reminder history:', error)
           this.toast.error('Error al cargar el historial de recordatorios')
         }
       }
  }
}
</script> 