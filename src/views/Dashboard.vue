<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Dashboard - Sistema de Electrodomésticos</h1>
      </v-col>
    </v-row>

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
      ]
    }
  },
  async mounted() {
    await this.loadDashboardData()
  },
  methods: {
    async loadDashboardData() {
      this.loading = true
      try {
        // Cargar datos de resumen con datos dummy
        this.summary = {
          totalCustomers: 25,
          totalContracts: 45,
          overdueInstallments: 8,
          totalProducts: 12
        }

        // Datos dummy para contratos recientes
        this.recentContracts = [
          {
            customerName: 'Juan Pérez',
            productName: 'Refrigerador Samsung',
            date: '2024-01-15',
            productPrice: 2500000
          },
          {
            customerName: 'María García',
            productName: 'Lavadora LG',
            date: '2024-01-14',
            productPrice: 1800000
          },
          {
            customerName: 'Carlos López',
            productName: 'Televisor Sony',
            date: '2024-01-13',
            productPrice: 3200000
          }
        ]

        // Datos dummy para cuotas vencidas
        this.overdueInstallments = [
          {
            customerName: 'Ana Rodríguez',
            dueDate: '2024-01-10',
            amount: 150000,
            daysOverdue: 5
          },
          {
            customerName: 'Luis Martínez',
            dueDate: '2024-01-08',
            amount: 200000,
            daysOverdue: 7
          },
          {
            customerName: 'Carmen Silva',
            dueDate: '2024-01-05',
            amount: 180000,
            daysOverdue: 10
          }
        ]

      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        this.loading = false
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