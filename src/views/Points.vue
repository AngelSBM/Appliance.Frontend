<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Programa de Puntos de Lealtad</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            Transacciones de Puntos
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="showDialog = true"
            >
              <v-icon left>mdi-plus</v-icon>
              Nueva Transacción
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="transactions"
              :loading="loading"
              :items-per-page="10"
            >
              <template v-slot:item.transactionDate="{ item }">
                {{ formatDate(item.transactionDate) }}
              </template>
              <template v-slot:item.points="{ item }">
                <v-chip
                  :color="item.points > 0 ? 'success' : 'error'"
                  small
                >
                  {{ item.points > 0 ? '+' : '' }}{{ item.points }}
                </v-chip>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-icon
                  small
                  @click="deleteTransaction(item)"
                >
                  mdi-delete
                </v-icon>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Diálogo para crear transacción -->
    <v-dialog v-model="showDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Nueva Transacción de Puntos</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="newTransaction.customerId"
                  :items="customers"
                  item-text="fullName"
                  item-value="id"
                  label="Cliente"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="newTransaction.installmentId"
                  :items="installments"
                  item-text="displayText"
                  item-value="id"
                  label="Cuota"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model.number="newTransaction.points"
                  label="Puntos"
                  type="number"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="newTransaction.reason"
                  label="Razón"
                  required
                ></v-text-field>
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

    <!-- Diálogo de confirmación -->
    <ConfirmDialog
      v-model="showConfirmDialog"
      title="Eliminar Transacción"
      message="¿Está seguro de que desea eliminar esta transacción?"
      @confirm="confirmDelete"
    />
  </v-container>
</template>

<script>
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { pointTransactionService } from '@/services/pointTransactionService'
import customerService from '@/services/customerService'
import installmentService from '@/services/installmentService'

export default {
  name: 'Points',
  components: {
    ConfirmDialog
  },
  inject: ['toast'],
  data() {
    return {
      loading: false,
      showDialog: false,
      showConfirmDialog: false,
      transactions: [],
      customers: [],
      installments: [],
      headers: [
        { text: 'ID', value: 'id' },
        { text: 'Cliente', value: 'customerName' },
        { text: 'Producto', value: 'productName' },
        { text: 'Puntos', value: 'points' },
        { text: 'Razón', value: 'reason' },
        { text: 'Fecha', value: 'transactionDate' },
        { text: 'Acciones', value: 'actions', sortable: false }
      ],
      newTransaction: {
        customerId: null,
        installmentId: null,
        points: 0,
        reason: ''
      },
      transactionToDelete: null
    }
  },
  mounted() {
    this.loadTransactions()
    this.loadCustomers()
    this.loadInstallments()
  },
  methods: {
    async loadTransactions() {
      this.loading = true
      try {
        const response = await pointTransactionService.getAll()
        this.transactions = response.data
      } catch (error) {
        console.error('Error loading transactions:', error)
        this.toast.error('Error al cargar las transacciones')
      } finally {
        this.loading = false
      }
    },

    async loadCustomers() {
      try {
        const response = await customerService.getAll()
        this.customers = response.data
      } catch (error) {
        console.error('Error loading customers:', error)
        this.toast.error('Error al cargar los clientes')
      }
    },

    async loadInstallments() {
      try {
        const response = await installmentService.getAll()
        this.installments = response.data.map(installment => ({
          id: installment.id,
          displayText: `Cuota #${installment.installmentNumber || 'N/A'} - ${installment.customerName || 'Cliente'} (${installment.contractId || 'Contrato'})`
        }))
      } catch (error) {
        console.error('Error loading installments:', error)
        this.toast.error('Error al cargar las cuotas')
      }
    },

    deleteTransaction(item) {
      this.transactionToDelete = item
      this.showConfirmDialog = true
    },

    async confirmDelete() {
      if (this.transactionToDelete) {
        try {
          await pointTransactionService.delete(this.transactionToDelete.id)
          
          // Eliminar de la lista local
          const index = this.transactions.indexOf(this.transactionToDelete)
          if (index > -1) {
            this.transactions.splice(index, 1)
          }
          
          this.toast.success('Transacción eliminada exitosamente')
        } catch (error) {
          console.error('Error deleting transaction:', error)
          this.toast.error('Error al eliminar la transacción')
        }
      }
      this.transactionToDelete = null
    },

    close() {
      this.showDialog = false
      this.newTransaction = {
        customerId: null,
        installmentId: null,
        points: 0,
        reason: ''
      }
    },

    async save() {
      try {
        const response = await pointTransactionService.create(this.newTransaction)
        
        // Agregar la nueva transacción a la lista
        this.transactions.push(response.data)
        
        this.toast.success('Transacción creada exitosamente')
        this.close()
      } catch (error) {
        console.error('Error saving transaction:', error)
        this.toast.error('Error al guardar la transacción')
      }
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('es-ES')
    }
  }
}
</script> 