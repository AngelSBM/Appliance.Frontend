<template>
  <v-container fluid>


    <!-- Tarjetas de resumen -->
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" max-width="400">
          <v-card-text>
            <div class="text-h6 mb-2">Total Clientes</div>
            <div class="text-h4 font-weight-bold primary--text">{{ summary.totalCustomers }}</div>
            <v-icon large color="primary" class="mt-2">mdi-account-group</v-icon>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" max-width="400">
          <v-card-text>
            <div class="text-h6 mb-2">Total Contratos</div>
            <div class="text-h4 font-weight-bold success--text">{{ summary.totalContracts }}</div>
            <v-icon large color="success" class="mt-2">mdi-file-document</v-icon>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" max-width="400">
          <v-card-text>
            <div class="text-h6 mb-2">Cuotas Vencidas</div>
            <div class="text-h4 font-weight-bold error--text">{{ summary.overdueInstallments }}</div>
            <v-icon large color="error" class="mt-2">mdi-alert-circle</v-icon>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" max-width="400">
          <v-card-text>
            <div class="text-h6 mb-2">Total Productos</div>
            <div class="text-h4 font-weight-bold info--text">{{ summary.totalProducts }}</div>
            <v-icon large color="info" class="mt-2">mdi-package-variant</v-icon>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Estadísticas adicionales -->
    <v-row class="mt-4">
      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" max-width="400">
          <v-card-text>
            <div class="text-h6 mb-2">Cuotas Pagadas</div>
            <div class="text-h4 font-weight-bold success--text">{{ installmentSummary.paidInstallments || 0 }}</div>
            <v-icon large color="success" class="mt-2">mdi-check-circle</v-icon>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" max-width="400">
          <v-card-text>
            <div class="text-h6 mb-2">Próximas Cuotas</div>
            <div class="text-h4 font-weight-bold warning--text">{{ installmentSummary.upcomingDueInstallments || 0 }}</div>
            <v-icon large color="warning" class="mt-2">mdi-clock</v-icon>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" max-width="400">
          <v-card-text>
            <div class="text-h6 mb-2">Monto Total</div>
            <div class="text-h4 font-weight-bold primary--text">${{ formatCurrency(installmentSummary.totalAmount || 0) }}</div>
            <v-icon large color="primary" class="mt-2">mdi-currency-usd</v-icon>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" max-width="400">
          <v-card-text>
            <div class="text-h6 mb-2">Monto Pagado</div>
            <div class="text-h4 font-weight-bold success--text">${{ formatCurrency(installmentSummary.paidAmount || 0) }}</div>
            <v-icon large color="success" class="mt-2">mdi-cash-check</v-icon>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Gráficos y tablas -->
    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Contratos Recientes</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="contractHeaders"
              :items="recentContracts"
              :loading="loading"
              :items-per-page="5"
              hide-default-footer
            >
              <template v-slot:item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>
              <template v-slot:item.productPrice="{ item }">
                ${{ formatCurrency(item.productPrice) }}
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Cuotas Vencidas</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="installmentHeaders"
              :items="overdueInstallments"
              :loading="loading"
              :items-per-page="5"
              hide-default-footer
            >
              <template v-slot:item.dueDate="{ item }">
                {{ formatDate(item.dueDate) }}
              </template>
              <template v-slot:item.amount="{ item }">
                ${{ formatCurrency(item.amount) }}
              </template>
              <template v-slot:item.daysOverdue="{ item }">
                <v-chip color="error" small>{{ item.daysOverdue }} días</v-chip>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Cuotas próximas a vencer -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>Cuotas Próximas a Vencer</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="upcomingHeaders"
              :items="upcomingInstallments"
              :loading="loading"
              :items-per-page="10"
              hide-default-footer
            >
              <template v-slot:item.dueDate="{ item }">
                {{ formatDate(item.dueDate) }}
              </template>
              <template v-slot:item.amount="{ item }">
                ${{ formatCurrency(item.amount) }}
              </template>
              <template v-slot:item.daysUntilDue="{ item }">
                <v-chip :color="item.daysUntilDue <= 7 ? 'warning' : 'info'" small>
                  {{ item.daysUntilDue }} días
                </v-chip>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Acciones rápidas -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>Acciones Rápidas</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6" md="3">
                <v-btn
                  block
                  color="primary"
                  @click="$router.push('/customers')"
                  class="mb-2"
                >
                  <v-icon left>mdi-account-plus</v-icon>
                  Nuevo Cliente
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-btn
                  block
                  color="success"
                  @click="$router.push('/contracts')"
                  class="mb-2"
                >
                  <v-icon left>mdi-file-plus</v-icon>
                  Nuevo Contrato
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-btn
                  block
                  color="info"
                  @click="$router.push('/products')"
                  class="mb-2"
                >
                  <v-icon left>mdi-package-plus</v-icon>
                  Nuevo Producto
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-btn
                  block
                  color="warning"
                  @click="$router.push('/installments')"
                  class="mb-2"
                >
                  <v-icon left>mdi-cash-multiple</v-icon>
                  Gestionar Pagos
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import customerService from '@/services/customerService'
import contractService from '@/services/contractService'
import productService from '@/services/productService'
import installmentService from '@/services/installmentService'

export default {
  name: 'Dashboard',
  data() {
    return {
      loading: false,
      summary: {
        totalCustomers: 0,
        totalContracts: 0,
        overdueInstallments: 0,
        totalProducts: 0
      },
      recentContracts: [],
      overdueInstallments: [],
      upcomingInstallments: [], // Added for upcoming installments
      contractHeaders: [
        { text: 'Cliente', value: 'customerName' },
        { text: 'Producto', value: 'productName' },
        { text: 'Fecha', value: 'date' },
        { text: 'Precio', value: 'productPrice' }
      ],
      installmentHeaders: [
        { text: 'Cliente', value: 'customerName' },
        { text: 'Vencimiento', value: 'dueDate' },
        { text: 'Monto', value: 'amount' },
        { text: 'Días Vencido', value: 'daysOverdue' }
      ],
      upcomingHeaders: [ // Added for upcoming installments headers
        { text: 'Cliente', value: 'customerName' },
        { text: 'Vencimiento', value: 'dueDate' },
        { text: 'Monto', value: 'amount' },
        { text: 'Días Hasta Vencimiento', value: 'daysUntilDue' }
      ],
      installmentSummary: {
        paidInstallments: 0,
        upcomingDueInstallments: 0,
        totalAmount: 0,
        paidAmount: 0
      }
    }
  },
  async mounted() {
    await this.loadDashboardData()
  },
  methods: {
    async loadDashboardData() {
      this.loading = true
      try {
        // Cargar datos de resumen desde la API
        await this.loadSummaryData()
        
        // Cargar contratos recientes
        await this.loadRecentContracts()
        
        // Cargar cuotas vencidas
        await this.loadOverdueInstallments()

        // Cargar cuotas próximas a vencer
        await this.loadUpcomingInstallments()

        // Cargar resumen de cuotas
        await this.loadInstallmentSummary()

      } catch (error) {
        console.error('Error loading dashboard data:', error)
        // Usar el sistema de toast proporcionado por el padre
        if (this.$root && this.$root.toast) {
          this.$root.toast.error('Error al cargar los datos del dashboard')
        }
      } finally {
        this.loading = false
      }
    },

    async loadSummaryData() {
      try {
        // Obtener total de clientes
        const customersResponse = await customerService.getAll()
        this.summary.totalCustomers = customersResponse.data.length

        // Obtener total de contratos
        const contractsResponse = await contractService.getAll()
        this.summary.totalContracts = contractsResponse.data.length

        // Obtener cuotas vencidas
        const overdueResponse = await installmentService.getOverdue()
        this.summary.overdueInstallments = overdueResponse.data.length

        // Obtener total de productos
        const productsResponse = await productService.getAll()
        this.summary.totalProducts = productsResponse.data.length

      } catch (error) {
        console.error('Error loading summary data:', error)
        // No lanzar el error, solo logearlo para evitar que se propague
      }
    },

    async loadRecentContracts() {
      try {
        const response = await contractService.getAll()
        // Tomar los 5 contratos más recientes
        this.recentContracts = response.data
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5)
      } catch (error) {
        console.error('Error loading recent contracts:', error)
        // No lanzar el error, solo logearlo
      }
    },

    async loadOverdueInstallments() {
      try {
        const response = await installmentService.getOverdue()
        // Tomar las 5 cuotas vencidas más críticas (más días vencidas)
        this.overdueInstallments = response.data
          .sort((a, b) => b.daysOverdue - a.daysOverdue)
          .slice(0, 5)
      } catch (error) {
        console.error('Error loading overdue installments:', error)
        // No lanzar el error, solo logearlo
      }
    },

    async loadUpcomingInstallments() {
      try {
        const response = await installmentService.getUpcomingDue()
        this.upcomingInstallments = response.data
      } catch (error) {
        console.error('Error loading upcoming installments:', error)
        // No lanzar el error, solo logearlo
      }
    },

    async loadInstallmentSummary() {
      try {
        const response = await installmentService.getSummary()
        this.installmentSummary = response.data
      } catch (error) {
        console.error('Error loading installment summary:', error)
        // No lanzar el error, solo logearlo
      }
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