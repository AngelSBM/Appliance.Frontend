<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Gestión de Productos</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <DataTable
          :headers="headers"
          :items="products"
          :loading="loading"
          title="Productos"
          @add="showDialog = true"
          @edit="editProduct"
          @delete="deleteProduct"
          @refresh="loadProducts"
        />
      </v-col>
    </v-row>

    <!-- Diálogo para crear/editar producto -->
    <v-dialog v-model="showDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editedIndex === -1 ? 'Nuevo Producto' : 'Editar Producto' }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.name"
                  label="Nombre del Producto"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model.number="editedItem.price"
                  label="Precio"
                  type="number"
                  prefix="$"
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
      title="Eliminar Producto"
      message="¿Está seguro de que desea eliminar este producto?"
      @confirm="confirmDelete"
    />
  </v-container>
</template>

<script>
import DataTable from '@/components/DataTable.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { productService } from '@/services/productService'

export default {
  name: 'Products',
  components: {
    DataTable,
    ConfirmDialog
  },
  data() {
    return {
      loading: false,
      showDialog: false,
      showConfirmDialog: false,
      products: [],
      headers: [
        { text: 'ID', value: 'id' },
        { text: 'Nombre', value: 'name' },
        { text: 'Precio', value: 'price' },
        { text: 'Total Contratos', value: 'totalContracts' },
        { text: 'Acciones', value: 'actions', sortable: false }
      ],
      editedIndex: -1,
      editedItem: {
        name: '',
        price: null
      },
      defaultItem: {
        name: '',
        price: null
      },
      productToDelete: null
    }
  },
  mounted() {
    this.loadProducts()
  },
  methods: {
    async loadProducts() {
      this.loading = true
      try {
        // Datos dummy para productos
        this.products = [
          {
            id: 1,
            name: 'Refrigerador Samsung',
            price: 2500000,
            totalContracts: 5
          },
          {
            id: 2,
            name: 'Lavadora LG',
            price: 1800000,
            totalContracts: 3
          },
          {
            id: 3,
            name: 'Televisor Sony 55"',
            price: 3200000,
            totalContracts: 4
          },
          {
            id: 4,
            name: 'Microondas Panasonic',
            price: 450000,
            totalContracts: 2
          },
          {
            id: 5,
            name: 'Cocina Eléctrica Whirlpool',
            price: 1200000,
            totalContracts: 1
          },
          {
            id: 6,
            name: 'Aire Acondicionado Carrier',
            price: 2800000,
            totalContracts: 3
          }
        ]
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        this.loading = false
      }
    },

    editProduct(item) {
      this.editedIndex = this.products.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.showDialog = true
    },

    deleteProduct(item) {
      this.productToDelete = item
      this.showConfirmDialog = true
    },

    async confirmDelete() {
      if (this.productToDelete) {
        try {
          // Aquí iría la llamada real al servicio
          // await productService.delete(this.productToDelete.id)
          
          // Simular eliminación
          const index = this.products.indexOf(this.productToDelete)
          if (index > -1) {
            this.products.splice(index, 1)
          }
          
          this.$toast.success('Producto eliminado exitosamente')
        } catch (error) {
          console.error('Error deleting product:', error)
          this.$toast.error('Error al eliminar el producto')
        }
      }
      this.productToDelete = null
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
          // Actualizar producto existente
          // await productService.update(this.editedItem.id, this.editedItem)
          Object.assign(this.products[this.editedIndex], this.editedItem)
          this.$toast.success('Producto actualizado exitosamente')
        } else {
          // Crear nuevo producto
          // const response = await productService.create(this.editedItem)
          const newProduct = {
            id: this.products.length + 1,
            ...this.editedItem,
            totalContracts: 0
          }
          this.products.push(newProduct)
          this.$toast.success('Producto creado exitosamente')
        }
        this.close()
      } catch (error) {
        console.error('Error saving product:', error)
        this.$toast.error('Error al guardar el producto')
      }
    }
  }
}
</script> 