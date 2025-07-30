<template>
  <v-dialog v-model="dialogModel" max-width="800px">
    <v-card>
      <v-card-title class="text-h5">
        <v-icon class="mr-2" color="info">mdi-information</v-icon>
        Detalles de la Cuota
      </v-card-title>

      <v-card-text v-if="installment">
        <!-- Loading state -->
        <div v-if="loading" class="text-center pa-4">
          <v-progress-circular indeterminate color="primary" />
          <div class="mt-2">Cargando detalles...</div>
        </div>

        <!-- Content when loaded -->
        <div v-else-if="paymentDetails">
          <!-- Información del cliente -->
          <v-card class="mb-4" variant="outlined">
            <v-card-title class="text-subtitle-1 bg-blue-lighten-5">
              <v-icon class="mr-2">mdi-account</v-icon>
              Información del Cliente
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="6">
                  <div class="text-caption text-grey">Nombre</div>
                  <div class="text-body-1 font-weight-medium">{{ paymentDetails.customer?.fullName || 'N/A' }}</div>
                </v-col>
                <v-col cols="6">
                  <div class="text-caption text-grey">Cédula</div>
                  <div class="text-body-1 font-weight-medium">{{ paymentDetails.customer?.nationalId || 'N/A' }}</div>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="6">
                  <div class="text-caption text-grey">Puntos Actuales</div>
                  <div class="text-body-1 font-weight-medium text-primary">{{ paymentDetails.customer?.totalPoints || 0 }} pts</div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Información del contrato -->
          <v-card class="mb-4" variant="outlined">
            <v-card-title class="text-subtitle-1 bg-green-lighten-5">
              <v-icon class="mr-2">mdi-file-document</v-icon>
              Información del Contrato
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12">
                  <div class="text-caption text-grey">Producto</div>
                  <div class="text-body-1 font-weight-medium">{{ paymentDetails.contract?.productName || 'N/A' }}</div>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="4">
                  <div class="text-caption text-grey">Total Cuotas</div>
                  <div class="text-body-1 font-weight-medium">{{ paymentDetails.contract?.totalInstallments || 0 }}</div>
                </v-col>
                <v-col cols="4">
                  <div class="text-caption text-grey">Pagadas</div>
                  <div class="text-body-1 font-weight-medium text-success">{{ paymentDetails.contract?.paidInstallments || 0 }}</div>
                </v-col>
                <v-col cols="4">
                  <div class="text-caption text-grey">Pendientes</div>
                  <div class="text-body-1 font-weight-medium text-warning">{{ paymentDetails.contract?.pendingInstallments || 0 }}</div>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="4">
                  <div class="text-caption text-grey">Total</div>
                  <div class="text-body-1 font-weight-medium">{{ formatCurrency(paymentDetails.contract?.totalAmount || 0) }}</div>
                </v-col>
                <v-col cols="4">
                  <div class="text-caption text-grey">Pagado</div>
                  <div class="text-body-1 font-weight-medium text-success">{{ formatCurrency(paymentDetails.contract?.paidAmount || 0) }}</div>
                </v-col>
                <v-col cols="4">
                  <div class="text-caption text-grey">Pendiente</div>
                  <div class="text-body-1 font-weight-medium text-warning">{{ formatCurrency(paymentDetails.contract?.pendingAmount || 0) }}</div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Información de la cuota -->
          <v-card class="mb-4" variant="outlined">
            <v-card-title class="text-subtitle-1 bg-orange-lighten-5">
              <v-icon class="mr-2">mdi-currency-usd</v-icon>
              Información de la Cuota
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="6">
                  <div class="text-caption text-grey">Cuota #</div>
                  <div class="text-body-1 font-weight-medium">{{ paymentDetails.installment?.installmentNumber || 0 }} de {{ paymentDetails.installment?.totalInstallments || 0 }}</div>
                </v-col>
                <v-col cols="6">
                  <div class="text-caption text-grey">Monto</div>
                  <div class="text-body-1 font-weight-medium text-primary">{{ formatCurrency(paymentDetails.installment?.amount || 0) }}</div>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="6">
                  <div class="text-caption text-grey">Fecha de Vencimiento</div>
                  <div class="text-body-1 font-weight-medium">{{ formatDate(paymentDetails.installment?.dueDate) }}</div>
                </v-col>
                <v-col cols="6">
                  <div class="text-caption text-grey">Estado</div>
                  <div class="text-body-1 font-weight-medium">
                    <StatusChip :status="paymentDetails.installment?.status" type="installment" />
                  </div>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="6">
                  <div class="text-caption text-grey">Días hasta Vencimiento</div>
                  <div class="text-body-1 font-weight-medium" :class="getDaysColor(paymentDetails.installment?.daysUntilDue)">
                    {{ paymentDetails.installment?.daysUntilDue || 0 }} días
                  </div>
                </v-col>
                <v-col cols="6" v-if="paymentDetails.installment?.isOverdue">
                  <div class="text-caption text-grey">Días Vencida</div>
                  <div class="text-body-1 font-weight-medium text-error">{{ paymentDetails.installment?.daysOverdue || 0 }} días</div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Estado de vencimiento -->
          <v-card class="mb-4" variant="outlined">
            <v-card-title class="text-subtitle-1 bg-red-lighten-5">
              <v-icon class="mr-2">mdi-alert-circle</v-icon>
              Estado de Vencimiento
            </v-card-title>
            <v-card-text>
              <v-alert
                v-if="paymentDetails.installment?.isOverdue"
                type="error"
                variant="tonal"
                class="mb-3"
              >
                <strong>¡Cuota Vencida!</strong><br>
                Esta cuota está vencida por {{ paymentDetails.installment?.daysOverdue }} días
              </v-alert>

              <v-alert
                v-else-if="paymentDetails.installment?.daysUntilDue !== undefined && paymentDetails.installment?.daysUntilDue <= 7"
                type="warning"
                variant="tonal"
                class="mb-3"
              >
                <strong>Próxima a Vencer</strong><br>
                Esta cuota vence en {{ paymentDetails.installment?.daysUntilDue }} días
              </v-alert>

              <v-alert
                v-else-if="paymentDetails.installment?.status === 'Pagada'"
                type="success"
                variant="tonal"
                class="mb-3"
              >
                <strong>Cuota Pagada</strong><br>
                Esta cuota ha sido pagada exitosamente
              </v-alert>

              <v-alert
                v-else
                type="info"
                variant="tonal"
                class="mb-3"
              >
                <strong>Al Día</strong><br>
                Esta cuota está al día con los pagos
              </v-alert>
            </v-card-text>
          </v-card>

          <!-- Nota -->
          <v-card v-if="installment.note" class="mb-4" variant="outlined">
            <v-card-title class="text-subtitle-1 bg-grey-lighten-5">
              <v-icon class="mr-2">mdi-note-text</v-icon>
              Nota
            </v-card-title>
            <v-card-text>
              <p class="text-body-1">{{ installment.note }}</p>
            </v-card-text>
          </v-card>
        </div>

        <!-- Fallback content if API fails -->
        <div v-else class="text-center pa-4">
          <v-alert type="warning" variant="tonal">
            No se pudieron cargar los detalles completos de la cuota.
          </v-alert>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          v-if="installment && installment.status !== 'Pagada' && installment.status !== 'PAID'"
          color="success"
          @click="processPayment"
          class="mr-2"
        >
          <v-icon class="mr-2">mdi-credit-card</v-icon>
          Pagar Cuota
        </v-btn>
        <v-btn
          color="grey"
          variant="text"
          @click="close"
        >
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { computed, ref, watch } from 'vue'
import StatusChip from './StatusChip.vue'
import installmentService from '../services/installmentService'

export default {
  name: 'DetailsDialog',
  components: {
    StatusChip
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    installment: {
      type: Object,
      default: null
    }
  },
  emits: ['update:modelValue', 'close', 'process-payment'],
  setup(props, { emit }) {
    const dialogModel = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })

    const loading = ref(false)
    const paymentDetails = ref(null)

    const loadPaymentDetails = async () => {
      if (!props.installment?.id) return
      
      try {
        loading.value = true
        const response = await installmentService.getPaymentDetails(props.installment.id)
        paymentDetails.value = response.data
      } catch (error) {
        console.error('Error loading payment details:', error)
        paymentDetails.value = null
      } finally {
        loading.value = false
      }
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: 'DOP',
        minimumFractionDigits: 0
      }).format(amount)
    }

    const formatDate = (date) => {
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString('es-DO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    }

    const getDaysColor = (days) => {
      if (days < 0) return 'text-error'
      if (days <= 7) return 'text-warning'
      return 'text-success'
    }

    const close = () => {
      emit('close')
    }

    const processPayment = () => {
      emit('process-payment', props.installment)
    }

    // Load details when dialog opens
    watch(() => props.installment, async (newInstallment) => {
      if (newInstallment && dialogModel.value) {
        await loadPaymentDetails()
      }
    }, { immediate: true })

    watch(() => dialogModel.value, async (isOpen) => {
      if (isOpen && props.installment) {
        await loadPaymentDetails()
      }
    })

    return {
      dialogModel,
      loading,
      paymentDetails,
      formatCurrency,
      formatDate,
      getDaysColor,
      close,
      processPayment
    }
  }
}
</script> 