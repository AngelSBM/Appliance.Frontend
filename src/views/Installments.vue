<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Gestión de Cuotas</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="installments"
          :loading="loading"
          class="elevation-1"
          density="comfortable"
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Cuotas</v-toolbar-title>
              <v-divider class="mx-4" inset vertical></v-divider>
              <v-spacer></v-spacer>
            </v-toolbar>
          </template>

          <template v-slot:item.amount="{ item }">
            {{ formatCurrency(item.amount) }}
          </template>

          <template v-slot:item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.installmentStatusId)"
              text-color="white"
              small
            >
              {{ getStatusText(item.installmentStatusId) }}
            </v-chip>
          </template>

          <template v-slot:item.dueDate="{ item }">
            {{ formatDate(item.dueDate) }}
          </template>

          <template v-slot:item.paymentDate="{ item }">
            {{ item.paymentDate ? formatDateTime(item.paymentDate) : 'N/A' }}
          </template>

          <template v-slot:item.isOverdue="{ item }">
            <v-chip
              :color="getOverdueColor(item.isOverdue)"
              text-color="white"
              small
            >
              {{ getOverdueText(item.isOverdue) }}
            </v-chip>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  small
                  class="mr-2"
                  color="info"
                  v-bind="attrs"
                  v-on="on"
                  @click="viewInstallment(item)"
                >
                  mdi-eye
                </v-icon>
              </template>
              <span>Ver</span>
            </v-tooltip>
            
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  small
                  class="mr-2"
                  color="primary"
                  v-bind="attrs"
                  v-on="on"
                  @click="editInstallment(item)"
                >
                  mdi-pencil
                </v-icon>
              </template>
              <span>Editar</span>
            </v-tooltip>
            
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  small
                  color="error"
                  v-bind="attrs"
                  v-on="on"
                  @click="deleteInstallment(item)"
                >
                  mdi-delete
                </v-icon>
              </template>
              <span>Eliminar</span>
            </v-tooltip>
          </template>

          <template v-slot:no-data>
            <v-btn color="primary" @click="loadInstallments">
              Recargar
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- Diálogo para editar cuota -->
    <v-dialog v-model="showDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Editar Cuota</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model.number="editedItem.amount"
                  label="Monto"
                  type="number"
                  prefix="$"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="editedItem.installmentStatusId"
                  :items="statuses"
                  item-title="status"
                  item-value="id"
                  label="Estado"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.paymentDate"
                  label="Fecha de Pago"
                  type="date"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editedItem.note"
                  label="Nota"
                  rows="3"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="close">
            Cancelar
          </v-btn>
          <v-btn color="blue darken-1" text @click="save">
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo para pagar cuota -->
    <v-dialog v-model="showPaymentDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Pagar Cuota</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="paymentData.paymentDate"
                  label="Fecha de Pago"
                  type="date"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model.number="paymentData.pointsToAward"
                  label="Puntos a Otorgar"
                  type="number"
                  min="0"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="paymentData.note"
                  label="Nota"
                  rows="3"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closePayment">
            Cancelar
          </v-btn>
          <v-btn color="success" text @click="processPayment">
            Procesar Pago
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo para ver detalles de la cuota -->
    <v-dialog v-model="showDetailDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Detalles de la Cuota #{{ selectedInstallment?.id }}</span>
        </v-card-title>

        <v-card-text>
          <v-container v-if="selectedInstallment">
            <v-row>
              <v-col cols="12" md="6">
                <h3>Información de la Cuota</h3>
                <p><strong>Número:</strong> {{ selectedInstallment.installmentNumber }}</p>
                <p><strong>Monto:</strong> {{ formatCurrency(selectedInstallment.amount) }}</p>
                <p><strong>Estado:</strong> 
                  <v-chip
                    :color="getStatusColor(selectedInstallment.installmentStatusId)"
                    text-color="white"
                    small
                  >
                    {{ getStatusText(selectedInstallment.installmentStatusId) }}
                  </v-chip>
                </p>
              </v-col>
              <v-col cols="12" md="6">
                <h3>Fechas</h3>
                <p><strong>Inicio:</strong> {{ formatDate(selectedInstallment.startDate) }}</p>
                <p><strong>Vencimiento:</strong> {{ formatDate(selectedInstallment.dueDate) }}</p>
                <p v-if="selectedInstallment.paymentDate">
                  <strong>Pago:</strong> {{ formatDateTime(selectedInstallment.paymentDate) }}
                </p>
              </v-col>
            </v-row>
            
            <v-divider class="my-4"></v-divider>
            
            <v-row v-if="selectedInstallment.isOverdue">
              <v-col cols="12">
                <v-alert type="error">
                  <strong>Cuota Vencida</strong><br>
                  Esta cuota está vencida por {{ selectedInstallment.daysOverdue }} días
                </v-alert>
              </v-col>
            </v-row>
            
            <v-row v-if="selectedInstallment.note">
              <v-col cols="12">
                <h3>Nota</h3>
                <p>{{ selectedInstallment.note }}</p>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn 
            v-if="selectedInstallment && selectedInstallment.status !== 'PAID'"
            color="success" 
            @click="payInstallment(selectedInstallment)"
          >
            Pagar Cuota
          </v-btn>
          <v-btn color="blue darken-1" text @click="showDetailDialog = false">
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de confirmación -->
    <ConfirmDialog
      v-model="showConfirmDialog"
      title="Eliminar Cuota"
      message="¿Está seguro de que desea eliminar esta cuota?"
      @confirm="confirmDelete"
    />
  </v-container>
</template>

<script>
import DataTable from '@/components/DataTable.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import StatusChip from '@/components/StatusChip.vue'
import { installmentService } from '@/services/installmentService'

export default {
  name: 'Installments',
  components: {
    DataTable,
    ConfirmDialog,
    StatusChip
  },
  inject: ['toast'],
  data() {
    return {
      loading: false,
      showDialog: false,
      showPaymentDialog: false,
      showDetailDialog: false,
      showConfirmDialog: false,
      installments: [],
      statuses: [
        { id: '1', status: 'Pendiente', color: 'grey' },
        { id: '2', status: 'Próxima a vencer', color: 'warning' },
        { id: '3', status: 'Vence hoy', color: 'orange' },
        { id: '4', status: 'Vencida', color: 'error' },
        { id: '5', status: 'Pagada', color: 'success' }
      ],
      headers: [
        { title: 'ID', key: 'id', sortable: true },
        { title: 'Contrato', key: 'contractId', sortable: true },
        { title: 'Número', key: 'installmentNumber', sortable: true },
        { title: 'Monto', key: 'amount', sortable: true },
        { title: 'Estado', key: 'status', sortable: true },
        { title: 'Vencimiento', key: 'dueDate', sortable: true },
        { title: 'Pago', key: 'paymentDate', sortable: true },
        { title: 'Vencida', key: 'isOverdue', sortable: true },
        { title: 'Acciones', key: 'actions', sortable: false }
      ],
      editedIndex: -1,
      editedItem: {
        amount: null,
        installmentStatusId: '',
        paymentDate: '',
        note: ''
      },
      defaultItem: {
        amount: null,
        installmentStatusId: '',
        paymentDate: '',
        note: ''
      },
      selectedInstallment: null,
      installmentToDelete: null,
      paymentData: {
        paymentDate: '',
        pointsToAward: 0,
        note: ''
      }
    }
  },
  mounted() {
    this.loadInstallments()
  },
  methods: {
    async loadInstallments() {
      this.loading = true
      try {
        const response = await installmentService.getAll()
        this.installments = response.data
      } catch (error) {
        console.error('Error loading installments:', error)
        this.toast.error('Error al cargar las cuotas')
        // Fallback a datos dummy en caso de error
        this.installments = [
          {
            id: 1,
            contractId: 1,
            installmentNumber: 1,
            amount: 208333,
            status: 'PAID',
            startDate: '2024-01-15',
            dueDate: '2024-02-15',
            paymentDate: '2024-02-10',
            note: 'Pago realizado antes del vencimiento',
            isOverdue: false,
            daysOverdue: 0
          },
          {
            id: 2,
            contractId: 1,
            installmentNumber: 2,
            amount: 208333,
            status: 'PENDING',
            startDate: '2024-02-15',
            dueDate: '2024-03-15',
            paymentDate: null,
            note: '',
            isOverdue: false,
            daysOverdue: 0
          }
        ]
      } finally {
        this.loading = false
      }
    },

    editInstallment(item) {
      this.editedIndex = this.installments.indexOf(item)
      this.editedItem = {
        amount: item.amount,
        installmentStatusId: item.status,
        paymentDate: item.paymentDate || '',
        note: item.note || ''
      }
      this.showDialog = true
    },

    viewInstallment(item) {
      this.selectedInstallment = item
      this.showDetailDialog = true
    },

    payInstallment(item) {
      this.selectedInstallment = item
      this.paymentData = {
        paymentDate: new Date().toISOString().split('T')[0],
        pointsToAward: 10,
        note: ''
      }
      this.showDetailDialog = false
      this.showPaymentDialog = true
    },

    deleteInstallment(item) {
      this.installmentToDelete = item
      this.showConfirmDialog = true
    },

    async confirmDelete() {
      if (this.installmentToDelete) {
        try {
          await installmentService.delete(this.installmentToDelete.id)
          
          // Eliminar de la lista local
          const index = this.installments.indexOf(this.installmentToDelete)
          if (index > -1) {
            this.installments.splice(index, 1)
          }
          
          this.toast.success('Cuota eliminada exitosamente')
        } catch (error) {
          console.error('Error deleting installment:', error)
          this.toast.error('Error al eliminar la cuota')
        }
      }
      this.installmentToDelete = null
    },

    close() {
      this.showDialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    closePayment() {
      this.showPaymentDialog = false
      this.selectedInstallment = null
    },

    async save() {
      try {
        if (this.editedIndex > -1) {
          // Actualizar cuota existente
          await installmentService.update(this.editedItem.id, this.editedItem)
          const installment = this.installments[this.editedIndex]
          Object.assign(installment, {
            amount: this.editedItem.amount,
            status: this.editedItem.installmentStatusId,
            paymentDate: this.editedItem.paymentDate || null,
            note: this.editedItem.note
          })
          this.toast.success('Cuota actualizada exitosamente')
        }
        this.close()
      } catch (error) {
        console.error('Error saving installment:', error)
        this.toast.error('Error al guardar la cuota')
      }
    },

    async processPayment() {
      try {
        await installmentService.pay(this.selectedInstallment.id, this.paymentData)
        
        // Actualizar localmente
        const installment = this.installments.find(i => i.id === this.selectedInstallment.id)
        if (installment) {
          installment.status = 'PAID'
          installment.paymentDate = this.paymentData.paymentDate
          installment.note = this.paymentData.note
          installment.isOverdue = false
          installment.daysOverdue = 0
        }
        
        this.toast.success('Pago procesado exitosamente')
        this.closePayment()
      } catch (error) {
        console.error('Error processing payment:', error)
        this.toast.error('Error al procesar el pago')
      }
    },

    formatDate(date) {
      if (!date) return 'N/A'
      return new Intl.DateTimeFormat('es-DO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(new Date(date))
    },

    formatDateTime(date) {
      if (!date) return 'N/A'
      return new Intl.DateTimeFormat('es-DO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(date))
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: 'DOP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount)
    },

    getStatusColor(statusId) {
      const status = this.statuses.find(s => s.id === statusId)
      return status ? status.color : 'grey'
    },

    getStatusText(statusId) {
      const status = this.statuses.find(s => s.id === statusId)
      return status ? status.status : 'Desconocido'
    },

    getOverdueColor(isOverdue) {
      return isOverdue ? 'error' : 'success'
    },

    getOverdueText(isOverdue) {
      return isOverdue ? 'Vencida' : 'Al día'
    }
  }
}
</script> 