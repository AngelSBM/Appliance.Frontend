<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Gestión de Contratos</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <DataTable
          :headers="headers"
          :items="contracts"
          :loading="loading"
          title="Contratos"
          @add="showDialog = true"
          @edit="editContract"
          @view="viewContract"
          @delete="deleteContract"
          @refresh="loadContracts"
        />
      </v-col>
    </v-row>

    <!-- Diálogo para crear/editar contrato -->
    <v-dialog v-model="showDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editedIndex === -1 ? 'Nuevo Contrato' : 'Editar Contrato' }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="editedItem.customerId"
                  :items="customers"
                  item-text="fullName"
                  item-value="id"
                  label="Cliente"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="editedItem.productId"
                  :items="products"
                  item-text="name"
                  item-value="id"
                  label="Producto"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model.number="editedItem.installmentCount"
                  label="Número de Cuotas"
                  type="number"
                  min="1"
                  max="60"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editedItem.notes"
                  label="Notas"
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

    <!-- Diálogo para ver detalles del contrato -->
    <v-dialog v-model="showDetailDialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Detalles del Contrato #{{ selectedContract ? selectedContract.id : '' }}</span>
        </v-card-title>

        <v-card-text>
          <v-container v-if="selectedContract">
            <v-row>
              <v-col cols="12" md="6">
                <h3>Información del Cliente</h3>
                <p><strong>Nombre:</strong> {{ selectedContract.customerName }}</p>
                <p><strong>ID:</strong> {{ selectedContract.customerId }}</p>
              </v-col>
              <v-col cols="12" md="6">
                <h3>Información del Producto</h3>
                <p><strong>Producto:</strong> {{ selectedContract.productName }}</p>
                <p><strong>Precio:</strong> ${{ formatCurrency(selectedContract.productPrice) }}</p>
              </v-col>
            </v-row>
            
            <v-divider class="my-4"></v-divider>
            
            <v-row>
              <v-col cols="12">
                <h3>Resumen de Pagos</h3>
                <v-row>
                  <v-col cols="3">
                    <v-card class="text-center">
                      <v-card-text>
                        <div class="text-h6">{{ selectedContract.totalInstallments }}</div>
                        <div>Total Cuotas</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="3">
                    <v-card class="text-center">
                      <v-card-text>
                        <div class="text-h6 success--text">{{ selectedContract.paidInstallments }}</div>
                        <div>Pagadas</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="3">
                    <v-card class="text-center">
                      <v-card-text>
                        <div class="text-h6 warning--text">{{ selectedContract.pendingInstallments }}</div>
                        <div>Pendientes</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="3">
                    <v-card class="text-center">
                      <v-card-text>
                        <div class="text-h6">${{ formatCurrency(selectedContract.totalAmount) }}</div>
                        <div>Total</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="showDetailDialog = false">
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de confirmación -->
    <ConfirmDialog
      v-model="showConfirmDialog"
      title="Eliminar Contrato"
      message="¿Está seguro de que desea eliminar este contrato?"
      @confirm="confirmDelete"
    />
  </v-container>
</template>

<script>
import DataTable from '@/components/DataTable.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { contractService } from '@/services/contractService'

export default {
  name: 'Contracts',
  components: {
    DataTable,
    ConfirmDialog
  },
  data() {
    return {
      loading: false,
      showDialog: false,
      showDetailDialog: false,
      showConfirmDialog: false,
      contracts: [],
      customers: [],
      products: [],
      headers: [
        { text: 'ID', value: 'id' },
        { text: 'Cliente', value: 'customerName' },
        { text: 'Producto', value: 'productName' },
        { text: 'Fecha', value: 'date' },
        { text: 'Precio', value: 'productPrice' },
        { text: 'Cuotas', value: 'installmentCount' },
        { text: 'Pagadas', value: 'paidInstallments' },
        { text: 'Pendientes', value: 'pendingInstallments' },
        { text: 'Acciones', value: 'actions', sortable: false }
      ],
      editedIndex: -1,
      editedItem: {
        customerId: null,
        productId: null,
        installmentCount: 12,
        notes: ''
      },
      defaultItem: {
        customerId: null,
        productId: null,
        installmentCount: 12,
        notes: ''
      },
      selectedContract: null,
      contractToDelete: null
    }
  },
  mounted() {
    this.loadContracts()
    this.loadCustomers()
    this.loadProducts()
  },
  methods: {
    async loadContracts() {
      this.loading = true
      try {
        // Datos dummy para contratos
        this.contracts = [
          {
            id: 1,
            customerName: 'Juan Pérez',
            productName: 'Refrigerador Samsung',
            date: '2024-01-15',
            productPrice: 2500000,
            installmentCount: 12,
            paidInstallments: 3,
            pendingInstallments: 9,
            totalInstallments: 12,
            totalAmount: 2500000,
            paidAmount: 625000,
            pendingAmount: 1875000
          },
          {
            id: 2,
            customerName: 'María García',
            productName: 'Lavadora LG',
            date: '2024-01-14',
            productPrice: 1800000,
            installmentCount: 6,
            paidInstallments: 2,
            pendingInstallments: 4,
            totalInstallments: 6,
            totalAmount: 1800000,
            paidAmount: 600000,
            pendingAmount: 1200000
          },
          {
            id: 3,
            customerName: 'Carlos López',
            productName: 'Televisor Sony 55"',
            date: '2024-01-13',
            productPrice: 3200000,
            installmentCount: 18,
            paidInstallments: 5,
            pendingInstallments: 13,
            totalInstallments: 18,
            totalAmount: 3200000,
            paidAmount: 888889,
            pendingAmount: 2311111
          }
        ]
      } catch (error) {
        console.error('Error loading contracts:', error)
      } finally {
        this.loading = false
      }
    },

    async loadCustomers() {
      // Datos dummy para clientes
      this.customers = [
        { id: 1, fullName: 'Juan Pérez' },
        { id: 2, fullName: 'María García' },
        { id: 3, fullName: 'Carlos López' },
        { id: 4, fullName: 'Ana Rodríguez' },
        { id: 5, fullName: 'Luis Martínez' }
      ]
    },

    async loadProducts() {
      // Datos dummy para productos
      this.products = [
        { id: 1, name: 'Refrigerador Samsung' },
        { id: 2, name: 'Lavadora LG' },
        { id: 3, name: 'Televisor Sony 55"' },
        { id: 4, name: 'Microondas Panasonic' },
        { id: 5, name: 'Cocina Eléctrica Whirlpool' },
        { id: 6, name: 'Aire Acondicionado Carrier' }
      ]
    },

    editContract(item) {
      this.editedIndex = this.contracts.indexOf(item)
      this.editedItem = {
        customerId: item.customerId,
        productId: item.productId,
        installmentCount: item.installmentCount,
        notes: item.notes || ''
      }
      this.showDialog = true
    },

    viewContract(item) {
      this.selectedContract = item
      this.showDetailDialog = true
    },

    deleteContract(item) {
      this.contractToDelete = item
      this.showConfirmDialog = true
    },

    async confirmDelete() {
      if (this.contractToDelete) {
        try {
          // Aquí iría la llamada real al servicio
          // await contractService.delete(this.contractToDelete.id)
          
          // Simular eliminación
          const index = this.contracts.indexOf(this.contractToDelete)
          if (index > -1) {
            this.contracts.splice(index, 1)
          }
          
          this.$toast.success('Contrato eliminado exitosamente')
        } catch (error) {
          console.error('Error deleting contract:', error)
          this.$toast.error('Error al eliminar el contrato')
        }
      }
      this.contractToDelete = null
    },

    close() {
      this.showDialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    async save() {
      try {
        if (this.editedIndex > -1) {
          // Actualizar contrato existente
          // await contractService.update(this.editedItem.id, this.editedItem)
          this.$toast.success('Contrato actualizado exitosamente')
        } else {
          // Crear nuevo contrato
          // const response = await contractService.create(this.editedItem)
          const customer = this.customers.find(c => c.id === this.editedItem.customerId)
          const product = this.products.find(p => p.id === this.editedItem.productId)
          
          const newContract = {
            id: this.contracts.length + 1,
            customerName: customer ? customer.fullName : '',
            productName: product ? product.name : '',
            date: new Date().toISOString().split('T')[0],
            productPrice: 2500000, // Precio dummy
            installmentCount: this.editedItem.installmentCount,
            paidInstallments: 0,
            pendingInstallments: this.editedItem.installmentCount,
            totalInstallments: this.editedItem.installmentCount,
            totalAmount: 2500000,
            paidAmount: 0,
            pendingAmount: 2500000,
            notes: this.editedItem.notes
          }
          this.contracts.push(newContract)
          this.$toast.success('Contrato creado exitosamente')
        }
        this.close()
      } catch (error) {
        console.error('Error saving contract:', error)
        this.$toast.error('Error al guardar el contrato')
      }
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('es-CO').format(amount)
    }
  }
}
</script> 