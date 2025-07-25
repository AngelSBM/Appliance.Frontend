<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Gestión de Recordatorios</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            Recordatorios
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="generateOverdueReminders"
              :loading="generating"
            >
              <v-icon left>mdi-refresh</v-icon>
              Generar Recordatorios Vencidos
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="reminders"
              :loading="loading"
              :items-per-page="10"
            >
              <template v-slot:item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>
              <template v-slot:item.dueDate="{ item }">
                {{ formatDate(item.dueDate) }}
              </template>
              <template v-slot:item.installmentAmount="{ item }">
                ${{ formatCurrency(item.installmentAmount) }}
              </template>
              <template v-slot:item.actions="{ item }">
                <v-icon
                  small
                  @click="deleteReminder(item)"
                >
                  mdi-delete
                </v-icon>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Diálogo de confirmación -->
    <ConfirmDialog
      v-model="showConfirmDialog"
      title="Eliminar Recordatorio"
      message="¿Está seguro de que desea eliminar este recordatorio?"
      @confirm="confirmDelete"
    />
  </v-container>
</template>

<script>
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { reminderService } from '@/services/reminderService'

export default {
  name: 'Reminders',
  components: {
    ConfirmDialog
  },
  data() {
    return {
      loading: false,
      generating: false,
      showConfirmDialog: false,
      reminders: [],
      headers: [
        { text: 'ID', value: 'id' },
        { text: 'Cliente', value: 'customerName' },
        { text: 'Producto', value: 'productName' },
        { text: 'Fecha Recordatorio', value: 'date' },
        { text: 'Vencimiento', value: 'dueDate' },
        { text: 'Monto', value: 'installmentAmount' },
        { text: 'Acciones', value: 'actions', sortable: false }
      ],
      reminderToDelete: null
    }
  },
  mounted() {
    this.loadReminders()
  },
  methods: {
    async loadReminders() {
      this.loading = true
      try {
        // Datos dummy para recordatorios
        this.reminders = [
          {
            id: 1,
            customerName: 'Ana Rodríguez',
            productName: 'Lavadora LG',
            date: '2024-01-20',
            dueDate: '2024-02-14',
            installmentAmount: 300000
          },
          {
            id: 2,
            customerName: 'Luis Martínez',
            productName: 'Refrigerador Samsung',
            date: '2024-01-19',
            dueDate: '2024-02-15',
            installmentAmount: 208333
          },
          {
            id: 3,
            customerName: 'Carmen Silva',
            productName: 'Televisor Sony',
            date: '2024-01-18',
            dueDate: '2024-02-13',
            installmentAmount: 177778
          }
        ]
      } catch (error) {
        console.error('Error loading reminders:', error)
      } finally {
        this.loading = false
      }
    },

    async generateOverdueReminders() {
      this.generating = true
      try {
        // Aquí iría la llamada real al servicio
        // await reminderService.generateOverdue()
        
        // Simular generación de recordatorios
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        this.$toast.success('Recordatorios vencidos generados exitosamente')
        this.loadReminders()
      } catch (error) {
        console.error('Error generating overdue reminders:', error)
        this.$toast.error('Error al generar recordatorios vencidos')
      } finally {
        this.generating = false
      }
    },

    deleteReminder(item) {
      this.reminderToDelete = item
      this.showConfirmDialog = true
    },

    async confirmDelete() {
      if (this.reminderToDelete) {
        try {
          // Aquí iría la llamada real al servicio
          // await reminderService.delete(this.reminderToDelete.id)
          
          // Simular eliminación
          const index = this.reminders.indexOf(this.reminderToDelete)
          if (index > -1) {
            this.reminders.splice(index, 1)
          }
          
          this.$toast.success('Recordatorio eliminado exitosamente')
        } catch (error) {
          console.error('Error deleting reminder:', error)
          this.$toast.error('Error al eliminar el recordatorio')
        }
      }
      this.reminderToDelete = null
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('es-ES')
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('es-CO').format(amount)
    }
  }
}
</script> 