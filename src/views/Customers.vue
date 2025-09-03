<template>
  <v-container fluid>


    <v-row>
      <v-col cols="12">
        <DataTable
          :headers="headers"
          :items="customers"
          :loading="loading"
          title="Clientes"
          @add="showDialog = true"
          @edit="editCustomer"
          @delete="deleteCustomer"
          @refresh="loadCustomers"
        />
      </v-col>
    </v-row>

    <!-- Formulario de cliente -->
    <CustomerForm
      v-model="showDialog"
      :customer="editedItem"
      :is-edit="editedIndex > -1"
      @save="handleSave"
      @error="handleError"
    />

    <!-- Diálogo de confirmación -->
    <ConfirmDialog
      v-model="showConfirmDialog"
      title="Eliminar Cliente"
      message="¿Está seguro de que desea eliminar este cliente?"
      @confirm="confirmDelete"
    />
  </v-container>
</template>

<script>
import DataTable from '@/components/DataTable.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import CustomerForm from '@/components/CustomerForm.vue'
import customerService from '@/services/customerService'

export default {
  name: 'Customers',
  components: {
    DataTable,
    ConfirmDialog,
    CustomerForm
  },
  inject: ['toast'],
  data() {
    return {
      loading: false,
      showDialog: false,
      showConfirmDialog: false,
      customers: [],
      headers: [
        { title: 'ID', key: 'id', sortable: true },
        { title: 'Nombre Completo', key: 'fullName', sortable: true },
        { title: 'Cédula', key: 'nationalId', sortable: true },
        { title: 'Email', key: 'email', sortable: true },
        { title: 'Edad', key: 'age', sortable: true },
        { title: 'Total Contratos', key: 'totalContracts', sortable: true },
        { title: 'Total Puntos', key: 'totalPoints', sortable: true },
        { title: 'Acciones', key: 'actions', sortable: false }
      ],
      editedIndex: -1,
      editedItem: {
        fullName: '',
        nationalId: '',
        email: '',
        age: null
      },
      defaultItem: {
        fullName: '',
        nationalId: '',
        email: '',
        age: null
      },
      customerToDelete: null
    }
  },
  mounted() {
    this.loadCustomers()
  },
  methods: {
    async loadCustomers() {
      this.loading = true
      try {
        const response = await customerService.getAll()
        this.customers = response.data
      } catch (error) {
        console.error('Error loading customers:', error)
        this.toast.error('Error al cargar los clientes')
        // Fallback a datos dummy en caso de error
        this.customers = [
          {
            id: 1,
            fullName: 'Juan Pérez',
            nationalId: '12345678',
            email: 'juan.perez@email.com',
            age: 35,
            totalContracts: 2,
            totalPoints: 150
          },
          {
            id: 2,
            fullName: 'María García',
            nationalId: '87654321',
            email: 'maria.garcia@email.com',
            age: 28,
            totalContracts: 1,
            totalPoints: 75
          }
        ]
      } finally {
        this.loading = false
      }
    },

    editCustomer(item) {
      this.editedIndex = this.customers.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.showDialog = true
    },

    deleteCustomer(item) {
      this.customerToDelete = item
      this.showConfirmDialog = true
    },

    async confirmDelete() {
      if (this.customerToDelete) {
        try {
          await customerService.delete(this.customerToDelete.id)
          
          // Eliminar de la lista local
          const index = this.customers.indexOf(this.customerToDelete)
          if (index > -1) {
            this.customers.splice(index, 1)
          }
          
          this.toast.success('Cliente eliminado exitosamente')
        } catch (error) {
          console.error('Error deleting customer:', error)
          this.toast.error('Error al eliminar el cliente')
        }
      }
      this.customerToDelete = null
    },

    close() {
      this.showDialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    async handleSave(customerData) {
      try {
        if (this.editedIndex > -1) {
          // Actualizar cliente existente
          await customerService.update(this.editedItem.id, customerData)
          Object.assign(this.customers[this.editedIndex], customerData)
          this.toast.success('Cliente actualizado exitosamente')
        } else {
          // Crear nuevo cliente
          const response = await customerService.create(customerData)
          this.customers.push(response.data)
          this.toast.success('Cliente creado exitosamente')
        }
        this.close()
      } catch (error) {
        console.error('Error saving customer:', error)
        this.toast.error('Error al guardar el cliente')
      }
    },

    handleError(message) {
      this.toast.error(message)
    }
  }
}
</script> 