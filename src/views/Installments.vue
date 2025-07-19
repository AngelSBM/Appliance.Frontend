<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Gestión de Cuotas</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <DataTable
          :headers="headers"
          :items="installments"
          :loading="loading"
          title="Cuotas"
          :show-add-button="false"
          @edit="editInstallment"
          @view="viewInstallment"
          @delete="deleteInstallment"
          @refresh="loadInstallments"
        />
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
                  item-text="status"
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
                <p><strong>Monto:</strong> ${{ formatCurrency(selectedInstallment.amount) }}</p>
                <p><strong>Estado:</strong> 
                  <StatusChip :status="selectedInstallment.status" type="installment" />
                </p>
              </v-col>
              <v-col cols="12" md="6">
                <h3>Fechas</h3>
                <p><strong>Inicio:</strong> {{ formatDate(selectedInstallment.startDate) }}</p>
                <p><strong>Vencimiento:</strong> {{ formatDate(selectedInstallment.dueDate) }}</p>
                <p v-if="selectedInstallment.paymentDate">
                  <strong>Pago:</strong> {{ formatDate(selectedInstallment.paymentDate) }}
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
  data() {
    return {
      loading: false,
      showDialog: false,
      showPaymentDialog: false,
      showDetailDialog: false,
      showConfirmDialog: false,
      installments: [],
      statuses: [
        { id: 'PENDING', status: 'Pendiente' },
        { id: 'PAID', status: 'Pagada' },
        { id: 'OVERDUE', status: 'Vencida' }
      ],
      headers: [
        { text: 'ID', value: 'id' },
        { text: 'Contrato', value: 'contractId' },
        { text: 'Número', value: 'installmentNumber' },
        { text: 'Monto', value: 'amount' },
        { text: 'Estado', value: 'status' },
        { text: 'Vencimiento', value: 'dueDate' },
        { text: 'Pago', value: 'paymentDate' },
        { text: 'Vencida', value: 'isOverdue' },
        { text: 'Acciones', value: 'actions', sortable: false }
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
        // Datos dummy para cuotas
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
            status: 'PAID',
            startDate: '2024-02-15',
            dueDate: '2024-03-15',
            paymentDate: '2024-03-12',
            note: '',
            isOverdue: false,
            daysOverdue: 0
          },
          {
            id: 3,
            contractId: 1,
            installmentNumber: 3,
            amount: 208333,
            status: 'PENDING',
            startDate: '2024-03-15',
            dueDate: '2024-04-15',
            paymentDate: null,
            note: '',
            isOverdue: false,
            daysOverdue: 0
          },
          {
            id: 4,
            contractId: 2,
            installmentNumber: 1,
            amount: 300000,
            status: 'OVERDUE',
            startDate: '2024-01-14',
            dueDate: '2024-02-14',
            paymentDate: null,
            note: 'Cuota vencida',
            isOverdue: true,
            daysOverdue: 5
          },
          {
            id: 5,
            contractId: 2,
            installmentNumber: 2,
            amount: 300000,
            status: 'PENDING',
            startDate: '2024-02-14',
            dueDate: '2024-03-14',
            paymentDate: null,
            note: '',
            isOverdue: false,
            daysOverdue: 0
          }
        ]
      } catch (error) {
        console.error('Error loading installments:', error)
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
          // Aquí iría la llamada real al servicio
          // await installmentService.delete(this.installmentToDelete.id)
          
          // Simular eliminación
          const index = this.installments.indexOf(this.installmentToDelete)
          if (index > -1) {
            this.installments.splice(index, 1)
          }
          
          this.$toast.success('Cuota eliminada exitosamente')
        } catch (error) {
          console.error('Error deleting installment:', error)
          this.$toast.error('Error al eliminar la cuota')
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
          // await installmentService.update(this.editedItem.id, this.editedItem)
          const installment = this.installments[this.editedIndex]
          Object.assign(installment, {
            amount: this.editedItem.amount,
            status: this.editedItem.installmentStatusId,
            paymentDate: this.editedItem.paymentDate || null,
            note: this.editedItem.note
          })
          this.$toast.success('Cuota actualizada exitosamente')
        }
        this.close()
      } catch (error) {
        console.error('Error saving installment:', error)
        this.$toast.error('Error al guardar la cuota')
      }
    },

    async processPayment() {
      try {
        // Aquí iría la llamada real al servicio
        // await installmentService.pay(this.selectedInstallment.id, this.paymentData)
        
        // Simular pago
        const installment = this.installments.find(i => i.id === this.selectedInstallment.id)
        if (installment) {
          installment.status = 'PAID'
          installment.paymentDate = this.paymentData.paymentDate
          installment.note = this.paymentData.note
          installment.isOverdue = false
          installment.daysOverdue = 0
        }
        
        this.$toast.success('Pago procesado exitosamente')
        this.closePayment()
      } catch (error) {
        console.error('Error processing payment:', error)
        this.$toast.error('Error al procesar el pago')
      }
    },

    formatDate(date) {
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString('es-ES')
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('es-CO').format(amount)
    }
  }
}
</script> 