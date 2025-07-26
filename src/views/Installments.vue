<template>
  <v-container fluid>
    <!-- Header con título y botón de agregar -->
    <v-row class="mb-4">
      <v-col cols="12" sm="8">
        <h1 class="text-h4 font-weight-bold">
          <v-icon class="mr-2" color="primary">mdi-credit-card-multiple</v-icon>
          Gestión de Cuotas
        </h1>
      </v-col>
      <v-col cols="12" sm="4" class="text-right">
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openDialog()"
          :disabled="loading"
        >
          Nueva Cuota
        </v-btn>
      </v-col>
    </v-row>

    <!-- Resumen estadístico -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h6">
            <v-icon class="mr-2" color="info">mdi-chart-pie</v-icon>
            Resumen General
          </v-card-title>
          <v-card-text>
            <v-row v-if="summary">
              <v-col cols="6" sm="3">
                <v-card variant="outlined" class="text-center pa-3">
                  <div class="text-h6 font-weight-bold text-primary">
                    {{ summary.totalInstallments }}
                  </div>
                  <div class="text-caption">Total Cuotas</div>
                </v-card>
              </v-col>
              <v-col cols="6" sm="3">
                <v-card variant="outlined" class="text-center pa-3">
                  <div class="text-h6 font-weight-bold text-success">
                    {{ summary.paidInstallments }}
                  </div>
                  <div class="text-caption">Pagadas</div>
                </v-card>
              </v-col>
              <v-col cols="6" sm="3">
                <v-card variant="outlined" class="text-center pa-3">
                  <div class="text-h6 font-weight-bold text-error">
                    {{ summary.overdueInstallments }}
                  </div>
                  <div class="text-caption">Vencidas</div>
                </v-card>
              </v-col>
              <v-col cols="6" sm="3">
                <v-card variant="outlined" class="text-center pa-3">
                  <div class="text-h6 font-weight-bold text-warning">
                    {{ summary.upcomingDueInstallments }}
                  </div>
                  <div class="text-caption">Próximas a Vencer</div>
                </v-card>
              </v-col>
            </v-row>
            <v-row v-if="summary">
              <v-col cols="12">
                <v-divider class="my-3"></v-divider>
                <div class="text-h6 mb-2">Resumen por Estado:</div>
                <v-row>
                  <v-col 
                    v-for="status in summary.summaryByStatus" 
                    :key="status.statusId"
                    cols="6" 
                    sm="3"
                  >
                    <v-chip
                      :color="getStatusColor(status.statusId)"
                      variant="outlined"
                      class="ma-1"
                    >
                      {{ status.statusName }}: {{ status.count }}
                    </v-chip>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
                          <v-row v-else>
                <v-col cols="12" class="text-center">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    size="64"
                  ></v-progress-circular>
                  <div class="mt-4 text-body-1">Cargando resumen...</div>
                </v-col>
              </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabs para diferentes vistas -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card>
          <v-tabs
            v-model="activeTab"
            color="primary"
            @update:model-value="onTabChange"
          >
            <v-tab value="all">
              <v-icon class="mr-2">mdi-format-list-bulleted</v-icon>
              Todas las Cuotas
            </v-tab>
            <v-tab value="overdue">
              <v-icon class="mr-2" color="error">mdi-alert-circle</v-icon>
              Vencidas
            </v-tab>
            <v-tab value="upcoming">
              <v-icon class="mr-2" color="warning">mdi-clock-alert</v-icon>
              Próximas a Vencer
            </v-tab>
          </v-tabs>

          <v-card-text>
            <!-- Filtros avanzados -->
            <v-expansion-panels v-model="filtersPanel" class="mb-4">
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <v-icon class="mr-2">mdi-filter-variant</v-icon>
                  Filtros Avanzados
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-row>
                    <v-col cols="12" sm="6" md="3">
                      <v-select
                        v-model="filters.customerId"
                        :items="customers"
                        item-title="fullName"
                        item-value="id"
                        label="Cliente"
                        clearable
                        prepend-icon="mdi-account"
                      ></v-select>
                    </v-col>
                    <v-col cols="12" sm="6" md="3">
                      <v-select
                        v-model="filters.contractId"
                        :items="contracts"
                        item-title="id"
                        item-value="id"
                        label="Contrato"
                        clearable
                        prepend-icon="mdi-file-document"
                      >
                        <template v-slot:item="{ props, item }">
                          <v-list-item v-bind="props">
                            <template v-slot:title>
                              Contrato #{{ item.raw.id }} - {{ item.raw.customerName }}
                            </template>
                          </v-list-item>
                        </template>
                      </v-select>
                    </v-col>
                    <v-col cols="12" sm="6" md="3">
                      <v-select
                        v-model="filters.statusId"
                        :items="statuses"
                        item-title="status"
                        item-value="id"
                        label="Estado"
                        clearable
                        prepend-icon="mdi-flag"
                      ></v-select>
                    </v-col>
                    <v-col cols="12" sm="6" md="3">
                      <v-select
                        v-model="filters.isOverdue"
                        :items="overdueOptions"
                        item-title="text"
                        item-value="value"
                        label="Estado de Vencimiento"
                        clearable
                        prepend-icon="mdi-calendar-clock"
                      ></v-select>
                    </v-col>
                    <v-col cols="12" sm="6" md="3">
                      <v-text-field
                        v-model="filters.startDate"
                        label="Fecha Desde"
                        type="date"
                        prepend-icon="mdi-calendar-start"
                        clearable
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="3">
                      <v-text-field
                        v-model="filters.endDate"
                        label="Fecha Hasta"
                        type="date"
                        prepend-icon="mdi-calendar-end"
                        clearable
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" class="text-center">
                      <v-btn
                        color="primary"
                        @click="applyFilters"
                        :loading="loading"
                        class="mr-2"
                      >
                        <v-icon class="mr-2">mdi-magnify</v-icon>
                        Aplicar Filtros
                      </v-btn>
                      <v-btn
                        variant="outlined"
                        @click="clearFilters"
                        :disabled="loading"
                      >
                        <v-icon class="mr-2">mdi-refresh</v-icon>
                        Limpiar
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>

            <!-- Tabla de cuotas -->
            <v-data-table
              :headers="headers"
              :items="installments"
              :loading="loading"
              :items-per-page="filters.pageSize"
              :page="filters.page"
              :server-items-length="totalCount"
              @update:options="onTableUpdate"
              class="elevation-1"
            >
              <!-- Template para número de cuota -->
              <template v-slot:item.installmentNumber="{ item }">
                <v-chip
                  :color="getInstallmentNumberColor(item.installmentNumber)"
                  size="small"
                >
                  #{{ item.installmentNumber }}
                </v-chip>
              </template>

              <!-- Template para monto -->
              <template v-slot:item.amount="{ item }">
                <span class="font-weight-bold">
                  {{ formatCurrency(item.amount) }}
                </span>
              </template>

              <!-- Template para estado -->
              <template v-slot:item.status="{ item }">
                <StatusChip :status="item.status" type="installment" />
              </template>

              <!-- Template para fecha de vencimiento -->
              <template v-slot:item.dueDate="{ item }">
                <div>
                  <div class="font-weight-medium">
                    {{ formatDate(item.dueDate) }}
                  </div>
                  <div v-if="item.isOverdue" class="text-caption text-error">
                    Vencida hace {{ item.daysOverdue }} días
                  </div>
                  <div v-else-if="item.daysUntilDue !== undefined" class="text-caption text-warning">
                    Vence en {{ item.daysUntilDue }} días
                  </div>
                </div>
              </template>

              <!-- Template para fecha de pago -->
              <template v-slot:item.paymentDate="{ item }">
                <span v-if="item.paymentDate">
                  {{ formatDateTime(item.paymentDate) }}
                </span>
                <span v-else class="text-muted">-</span>
              </template>

              <!-- Template para acciones -->
              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon="mdi-eye"
                  size="small"
                  color="info"
                  variant="text"
                  @click="viewDetails(item)"
                  :title="'Ver detalles'"
                ></v-btn>
                <v-btn
                  v-if="item.status !== 'PAID'"
                  icon="mdi-credit-card"
                  size="small"
                  color="success"
                  variant="text"
                  @click="openPaymentDialog(item)"
                  :title="'Pagar cuota'"
                ></v-btn>
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  color="warning"
                  variant="text"
                  @click="editItem(item)"
                  :title="'Editar'"
                ></v-btn>
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  color="error"
                  variant="text"
                  @click="deleteItem(item)"
                  :title="'Eliminar'"
                ></v-btn>
              </template>
            </v-data-table>

            <!-- Paginación -->
            <v-row class="mt-4" v-if="totalPages > 1">
              <v-col cols="12" class="text-center">
                <v-pagination
                  v-model="filters.page"
                  :length="totalPages"
                  :total-visible="7"
                  @update:model-value="loadData"
                ></v-pagination>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Diálogos -->
    <InstallmentDialog
      v-model="dialog"
      :installment="selectedInstallment"
      :customers="customers"
      :contracts="contracts"
      :statuses="statuses"
      @save="saveInstallment"
      @close="closeDialog"
    />

    <PaymentDialog
      v-model="paymentDialog"
      :installment="selectedInstallment"
      @saved="processPayment"
    />

    <ConfirmDialog
      v-model="confirmDialog"
      :title="confirmTitle"
      :message="confirmMessage"
      @confirm="confirmAction"
    />

    <DetailsDialog
      v-model="detailsDialog"
      :installment="selectedInstallment"
      @close="closeDetailsDialog"
    />
  </v-container>
</template>

<script>
import { ref, reactive, onMounted, inject } from 'vue'
import installmentService from '@/services/installmentService.js'
import customerService from '@/services/customerService.js'
import contractService from '@/services/contractService.js'
import installmentStatusService from '@/services/installmentStatusService.js'
import InstallmentDialog from '@/components/InstallmentDialog.vue'
import PaymentDialog from '@/components/PaymentDialog.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import DetailsDialog from '@/components/DetailsDialog.vue'
import StatusChip from '@/components/StatusChip.vue'

export default {
  name: 'Installments',
  components: {
    InstallmentDialog,
    PaymentDialog,
    ConfirmDialog,
    DetailsDialog,
    StatusChip
  },
  setup() {
    const toast = inject('toast')
    
    // Estado reactivo
    const loading = ref(false)
    const installments = ref([])
    const customers = ref([])
    const contracts = ref([])
    const statuses = ref([])
    const summary = ref(null)
    const activeTab = ref('all')
    const filtersPanel = ref(0)

    // Filtros
    const filters = reactive({
      customerId: null,
      contractId: null,
      statusId: null,
      startDate: null,
      endDate: null,
      isOverdue: null,
      page: 1,
      pageSize: 20
    })

    // Paginación
    const totalCount = ref(0)
    const totalPages = ref(0)

    // Diálogos
    const dialog = ref(false)
    const paymentDialog = ref(false)
    const confirmDialog = ref(false)
    const detailsDialog = ref(false)
    const selectedInstallment = ref(null)
    const confirmTitle = ref('')
    const confirmMessage = ref('')
    const confirmAction = ref(null)

    // Headers de la tabla
    const headers = [
      { title: 'Número', key: 'installmentNumber', sortable: false },
      { title: 'Cliente', key: 'customerName', sortable: false },
      { title: 'Contrato', key: 'contractId', sortable: false },
      { title: 'Monto', key: 'amount', sortable: false },
      { title: 'Estado', key: 'status', sortable: false },
      { title: 'Vencimiento', key: 'dueDate', sortable: false },
      { title: 'Pago', key: 'paymentDate', sortable: false },
      { title: 'Acciones', key: 'actions', sortable: false }
    ]

    // Opciones para filtro de vencimiento
    const overdueOptions = [
      { text: 'Vencidas', value: true },
      { text: 'No Vencidas', value: false }
    ]

    // Métodos
    const loadData = async () => {
      loading.value = true
      try {
        let response
        const filterParams = { ...filters }

        switch (activeTab.value) {
          case 'overdue':
            response = await installmentService.getOverdue()
            installments.value = response.data
            totalCount.value = response.data.length
            totalPages.value = 1
            break
          case 'upcoming':
            response = await installmentService.getUpcomingDue(filterParams)
            installments.value = response.data
            totalCount.value = response.data.length
            totalPages.value = 1
            break
          default:
            response = await installmentService.getFiltered(filterParams)
            installments.value = response.data.installments
            totalCount.value = response.data.totalCount
            totalPages.value = response.data.totalPages
            break
        }
      } catch (error) {
        console.error('Error loading installments:', error)
        toast.error('Error al cargar las cuotas')
        // Datos de ejemplo en caso de error
        installments.value = []
      } finally {
        loading.value = false
      }
    }

    const loadSummary = async () => {
      try {
        const response = await installmentService.getSummary(filters)
        summary.value = response.data
      } catch (error) {
        console.error('Error loading summary:', error)
        // Datos de ejemplo en caso de error
        summary.value = {
          totalInstallments: 0,
          paidInstallments: 0,
          overdueInstallments: 0,
          upcomingDueInstallments: 0,
          summaryByStatus: []
        }
      }
    }

    const loadCustomers = async () => {
      try {
        const response = await customerService.getAll()
        customers.value = response.data
      } catch (error) {
        console.error('Error loading customers:', error)
        customers.value = []
      }
    }

    const loadContracts = async () => {
      try {
        const response = await contractService.getAll()
        contracts.value = response.data
      } catch (error) {
        console.error('Error loading contracts:', error)
        contracts.value = []
      }
    }

    const loadStatuses = async () => {
      try {
        const response = await installmentStatusService.getAll()
        statuses.value = response.data
      } catch (error) {
        console.error('Error loading statuses:', error)
        statuses.value = []
      }
    }

    const onTabChange = () => {
      filters.page = 1
      loadData()
      if (activeTab.value === 'all') {
        loadSummary()
      }
    }

    const applyFilters = () => {
      filters.page = 1
      loadData()
      if (activeTab.value === 'all') {
        loadSummary()
      }
    }

    const clearFilters = () => {
      Object.assign(filters, {
        customerId: null,
        contractId: null,
        statusId: null,
        startDate: null,
        endDate: null,
        isOverdue: null,
        page: 1,
        pageSize: 20
      })
      loadData()
      if (activeTab.value === 'all') {
        loadSummary()
      }
    }

    const onTableUpdate = (options) => {
      if (options.page !== undefined) {
        filters.page = options.page + 1
      }
      if (options.itemsPerPage !== undefined) {
        filters.pageSize = options.itemsPerPage
      }
      loadData()
    }

    // Métodos de formato
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: 'DOP',
        minimumFractionDigits: 0
      }).format(amount)
    }

    const formatDate = (date) => {
      return new Intl.DateTimeFormat('es-DO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date(date))
    }

    const formatDateTime = (date) => {
      return new Intl.DateTimeFormat('es-DO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(date))
    }

    const getStatusColor = (statusId) => {
      const colors = {
        'PENDING': 'warning',
        'PAID': 'success',
        'OVERDUE': 'error',
        'CANCELLED': 'grey'
      }
      return colors[statusId] || 'primary'
    }

    const getInstallmentNumberColor = (number) => {
      if (number <= 3) return 'success'
      if (number <= 6) return 'warning'
      return 'info'
    }

    // Métodos de diálogos
    const openDialog = (installment = null) => {
      selectedInstallment.value = installment
      dialog.value = true
    }

    const closeDialog = () => {
      selectedInstallment.value = null
      dialog.value = false
    }

    const openPaymentDialog = (installment) => {
      if (!installment) {
        console.error('No installment provided to openPaymentDialog')
        return
      }
      selectedInstallment.value = { ...installment }
      paymentDialog.value = true
    }

    const closePaymentDialog = () => {
      selectedInstallment.value = null
      paymentDialog.value = false
    }

    const viewDetails = (installment) => {
      selectedInstallment.value = installment
      detailsDialog.value = true
    }

    const closeDetailsDialog = () => {
      selectedInstallment.value = null
      detailsDialog.value = false
    }

    const editItem = (installment) => {
      openDialog(installment)
    }

    const deleteItem = (installment) => {
      selectedInstallment.value = installment
      confirmTitle.value = 'Eliminar Cuota'
      confirmMessage.value = `¿Estás seguro de que quieres eliminar la cuota #${installment.installmentNumber}?`
      confirmAction.value = () => performDelete(installment.id)
      confirmDialog.value = true
    }

    const performDelete = async (id) => {
      try {
        await installmentService.delete(id)
        toast.success('Cuota eliminada exitosamente')
        loadData()
        if (activeTab.value === 'all') {
          loadSummary()
        }
      } catch (error) {
        console.error('Error deleting installment:', error)
        toast.error('Error al eliminar la cuota')
      }
    }

    const saveInstallment = async (installment) => {
      try {
        if (installment.id) {
          await installmentService.update(installment.id, installment)
          toast.success('Cuota actualizada exitosamente')
        } else {
          await installmentService.create(installment)
          toast.success('Cuota creada exitosamente')
        }
        closeDialog()
        loadData()
        if (activeTab.value === 'all') {
          loadSummary()
        }
      } catch (error) {
        console.error('Error saving installment:', error)
        toast.error('Error al guardar la cuota')
      }
    }

    const processPayment = async () => {
      try {
        toast.success('Pago procesado exitosamente')
        closePaymentDialog()
        loadData()
        if (activeTab.value === 'all') {
          loadSummary()
        }
      } catch (error) {
        console.error('Error processing payment:', error)
        toast.error('Error al procesar el pago')
      }
    }

    // Cargar datos al montar el componente
    onMounted(() => {
      loadCustomers()
      loadContracts()
      loadStatuses()
      loadData()
      loadSummary()
    })

    return {
      // Estado
      loading,
      installments,
      customers,
      contracts,
      statuses,
      summary,
      activeTab,
      filtersPanel,
      filters,
      totalCount,
      totalPages,
      dialog,
      paymentDialog,
      confirmDialog,
      detailsDialog,
      selectedInstallment,
      confirmTitle,
      confirmMessage,
      headers,
      overdueOptions,

      // Métodos
      loadData,
      loadSummary,
      onTabChange,
      applyFilters,
      clearFilters,
      onTableUpdate,
      formatCurrency,
      formatDate,
      formatDateTime,
      getStatusColor,
      getInstallmentNumberColor,
      openDialog,
      closeDialog,
      openPaymentDialog,
      closePaymentDialog,
      viewDetails,
      closeDetailsDialog,
      editItem,
      deleteItem,
      saveInstallment,
      processPayment
    }
  }
}
</script>

<style scoped>
.v-data-table {
  border-radius: 8px;
}

.v-card {
  border-radius: 12px;
}

.v-expansion-panels {
  border-radius: 8px;
}
</style> 