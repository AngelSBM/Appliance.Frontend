<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Gestión de Clientes</h1>
      </v-col>
    </v-row>

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

    <!-- Diálogo para crear/editar cliente -->
    <v-dialog v-model="showDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editedIndex === -1 ? 'Nuevo Cliente' : 'Editar Cliente' }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.fullName"
                  label="Nombre Completo"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.nationalId"
                  label="Cédula de Ciudadanía"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model.number="editedItem.age"
                  label="Edad"
                  type="number"
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
      title="Eliminar Cliente"
      message="¿Está seguro de que desea eliminar este cliente?"
      @confirm="confirmDelete"
    />
  </v-container>
</template>

<script>
import DataTable from '@/components/DataTable.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { customerService } from '@/services/customerService'

export default {
  name: 'Customers',
  components: {
    DataTable,
    ConfirmDialog
  },
  data() {
    return {
      loading: false,
      showDialog: false,
      showConfirmDialog: false,
      customers: [],
      headers: [
        { text: 'ID', value: 'id' },
        { text: 'Nombre Completo', value: 'fullName' },
        { text: 'Cédula', value: 'nationalId' },
        { text: 'Edad', value: 'age' },
        { text: 'Total Contratos', value: 'totalContracts' },
        { text: 'Total Puntos', value: 'totalPoints' },
        { text: 'Acciones', value: 'actions', sortable: false }
      ],
      editedIndex: -1,
      editedItem: {
        fullName: '',
        nationalId: '',
        age: null
      },
      defaultItem: {
        fullName: '',
        nationalId: '',
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
        // Datos dummy para clientes
        this.customers = [
          {
            id: 1,
            fullName: 'Juan Pérez',
            nationalId: '12345678',
            age: 35,
            totalContracts: 2,
            totalPoints: 150
          },
          {
            id: 2,
            fullName: 'María García',
            nationalId: '87654321',
            age: 28,
            totalContracts: 1,
            totalPoints: 75
          },
          {
            id: 3,
            fullName: 'Carlos López',
            nationalId: '11223344',
            age: 42,
            totalContracts: 3,
            totalPoints: 225
          },
          {
            id: 4,
            fullName: 'Ana Rodríguez',
            nationalId: '55667788',
            age: 31,
            totalContracts: 1,
            totalPoints: 50
          },
          {
            id: 5,
            fullName: 'Luis Martínez',
            nationalId: '99887766',
            age: 39,
            totalContracts: 2,
            totalPoints: 120
          }
        ]
      } catch (error) {
        console.error('Error loading customers:', error)
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
          // Aquí iría la llamada real al servicio
          // await customerService.delete(this.customerToDelete.id)
          
          // Simular eliminación
          const index = this.customers.indexOf(this.customerToDelete)
          if (index > -1) {
            this.customers.splice(index, 1)
          }
          
          this.$toast.success('Cliente eliminado exitosamente')
        } catch (error) {
          console.error('Error deleting customer:', error)
          this.$toast.error('Error al eliminar el cliente')
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

    async save() {
      try {
        if (this.editedIndex > -1) {
          // Actualizar cliente existente
          // await customerService.update(this.editedItem.id, this.editedItem)
          Object.assign(this.customers[this.editedIndex], this.editedItem)
          this.$toast.success('Cliente actualizado exitosamente')
        } else {
          // Crear nuevo cliente
          // const response = await customerService.create(this.editedItem)
          const newCustomer = {
            id: this.customers.length + 1,
            ...this.editedItem,
            totalContracts: 0,
            totalPoints: 0
          }
          this.customers.push(newCustomer)
          this.$toast.success('Cliente creado exitosamente')
        }
        this.close()
      } catch (error) {
        console.error('Error saving customer:', error)
        this.$toast.error('Error al guardar el cliente')
      }
    }
  }
}
</script> 