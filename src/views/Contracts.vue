<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Gestión de Contratos</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="contracts"
          :loading="loading"
          class="elevation-1"
          density="comfortable"
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Contratos</v-toolbar-title>
              <v-divider class="mx-4" inset vertical></v-divider>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                dark
                class="mb-2"
                @click="showDialog = true"
              >
                <v-icon left>mdi-plus</v-icon>
                Agregar
              </v-btn>
            </v-toolbar>
          </template>

          <template v-slot:item.date="{ item }">
            {{ formatDate(item.date) }}
          </template>

          <template v-slot:item.productPrice="{ item }">
            {{ formatCurrency(item.productPrice) }}
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
                  @click="viewContract(item)"
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
                  @click="editContract(item)"
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
                  @click="deleteContract(item)"
                >
                  mdi-delete
                </v-icon>
              </template>
              <span>Eliminar</span>
            </v-tooltip>
          </template>

          <template v-slot:no-data>
            <v-btn color="primary" @click="loadContracts">
              Recargar
            </v-btn>
          </template>
        </v-data-table>
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
                  item-title="fullName"
                  item-value="id"
                  label="Cliente"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="editedItem.productId"
                  :items="products"
                  item-title="name"
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
                <p><strong>Precio:</strong> {{ formatCurrency(selectedContract.productPrice) }}</p>
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
                        <div class="text-h6">{{ formatCurrency(selectedContract.totalAmount) }}</div>
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
import contractService from '@/services/contractService'
import customerService from '@/services/customerService'
import productService from '@/services/productService'

export default {
  name: 'Contracts',
  components: {
    DataTable,
    ConfirmDialog
  },
  inject: ['toast'],
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
        { title: 'ID', key: 'id', sortable: true },
        { title: 'Cliente', key: 'customerName', sortable: true },
        { title: 'Producto', key: 'productName', sortable: true },
        { title: 'Fecha', key: 'date', sortable: true },
        { title: 'Precio', key: 'productPrice', sortable: true },
        { title: 'Cuotas', key: 'installmentCount', sortable: true },
        { title: 'Pagadas', key: 'paidInstallments', sortable: true },
        { title: 'Pendientes', key: 'pendingInstallments', sortable: true },
        { title: 'Acciones', key: 'actions', sortable: false }
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
        const response = await contractService.getAll()
        this.contracts = response.data
      } catch (error) {
        console.error('Error loading contracts:', error)
        this.toast.error('Error al cargar los contratos')
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
        // Fallback a datos dummy
        this.customers = [
          { id: 1, fullName: 'Juan Pérez' },
          { id: 2, fullName: 'María García' },
          { id: 3, fullName: 'Carlos López' }
        ]
      }
    },

    async loadProducts() {
      try {
        const response = await productService.getAll()
        this.products = response.data
      } catch (error) {
        console.error('Error loading products:', error)
        this.toast.error('Error al cargar los productos')
        // Fallback a datos dummy
        this.products = [
          { id: 1, name: 'Refrigerador Samsung' },
          { id: 2, name: 'Lavadora LG' },
          { id: 3, name: 'Televisor Sony 55"' }
        ]
      }
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
          await contractService.delete(this.contractToDelete.id)
          
          // Eliminar de la lista local
          const index = this.contracts.indexOf(this.contractToDelete)
          if (index > -1) {
            this.contracts.splice(index, 1)
          }
          
          this.toast.success('Contrato eliminado exitosamente')
        } catch (error) {
          console.error('Error deleting contract:', error)
          this.toast.error('Error al eliminar el contrato')
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
          await contractService.update(this.editedItem.id, this.editedItem)
          this.toast.success('Contrato actualizado exitosamente')
        } else {
          // Crear nuevo contrato
          const response = await contractService.create(this.editedItem)
          this.contracts.push(response.data)
          this.toast.success('Contrato creado exitosamente')
        }
        this.close()
      } catch (error) {
        console.error('Error saving contract:', error)
        this.toast.error('Error al guardar el contrato')
      }
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: 'DOP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount)
    },

    formatDate(dateString) {
      if (!dateString) return '-'
      
      try {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('es-DO', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date)
      } catch (error) {
        return dateString
      }
    }
  }
}
</script> 