<template>
  <v-dialog v-model="dialog" max-width="600px">
    <v-card>
      <v-card-title class="text-h5">
        Pagar Cuota
      </v-card-title>

      <v-card-text>
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
                <div class="text-body-1 font-weight-medium">{{ paymentDetails?.customer?.fullName || 'N/A' }}</div>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-grey">Cédula</div>
                <div class="text-body-1 font-weight-medium">{{ paymentDetails?.customer?.nationalId || 'N/A' }}</div>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <div class="text-caption text-grey">Puntos Actuales</div>
                <div class="text-body-1 font-weight-medium text-primary">{{ paymentDetails?.customer?.totalPoints || 0 }} pts</div>
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
                <div class="text-body-1 font-weight-medium">{{ paymentDetails?.contract?.productName || 'N/A' }}</div>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <div class="text-caption text-grey">Total Cuotas</div>
                <div class="text-body-1 font-weight-medium">{{ paymentDetails?.contract?.totalInstallments || 0 }}</div>
              </v-col>
              <v-col cols="4">
                <div class="text-caption text-grey">Pagadas</div>
                <div class="text-body-1 font-weight-medium text-success">{{ paymentDetails?.contract?.paidInstallments || 0 }}</div>
              </v-col>
              <v-col cols="4">
                <div class="text-caption text-grey">Pendientes</div>
                <div class="text-body-1 font-weight-medium text-warning">{{ paymentDetails?.contract?.pendingInstallments || 0 }}</div>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <div class="text-caption text-grey">Total</div>
                <div class="text-body-1 font-weight-medium">{{ formatCurrency(paymentDetails?.contract?.totalAmount || 0) }}</div>
              </v-col>
              <v-col cols="4">
                <div class="text-caption text-grey">Pagado</div>
                <div class="text-body-1 font-weight-medium text-success">{{ formatCurrency(paymentDetails?.contract?.paidAmount || 0) }}</div>
              </v-col>
              <v-col cols="4">
                <div class="text-caption text-grey">Pendiente</div>
                <div class="text-body-1 font-weight-medium text-warning">{{ formatCurrency(paymentDetails?.contract?.pendingAmount || 0) }}</div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Información de la cuota actual -->
        <v-card class="mb-4" variant="outlined">
          <v-card-title class="text-subtitle-1 bg-orange-lighten-5">
            <v-icon class="mr-2">mdi-currency-usd</v-icon>
            Cuota a Pagar
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="6">
                <div class="text-caption text-grey">Cuota #</div>
                <div class="text-body-1 font-weight-medium">{{ paymentDetails?.installment?.installmentNumber || 0 }} de {{ paymentDetails?.installment?.totalInstallments || 0 }}</div>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-grey">Monto</div>
                <div class="text-body-1 font-weight-medium text-primary">{{ formatCurrency(paymentDetails?.installment?.amount || 0) }}</div>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <div class="text-caption text-grey">Fecha de Vencimiento</div>
                <div class="text-body-1 font-weight-medium">{{ formatDate(paymentDetails?.installment?.dueDate) }}</div>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-grey">Estado</div>
                <div class="text-body-1 font-weight-medium" :class="getStatusColor(paymentDetails?.installment?.status)">
                  {{ paymentDetails?.installment?.status || 'N/A' }}
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Formulario de pago -->
        <v-form ref="form" v-model="valid">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="formData.paymentDate"
                label="Fecha de Pago"
                type="datetime-local"
                :rules="[v => !!v || 'La fecha de pago es requerida']"
                required
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="formData.note"
                label="Nota (opcional)"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="formData.pointsToAward"
                label="Puntos a Otorgar"
                type="number"
                readonly
                :color="getPointsColor()"
                variant="outlined"
                :hint="getPointsExplanation()"
                persistent-hint
              />
            </v-col>
          </v-row>
        </v-form>

        <!-- Alerta informativa -->
        <v-alert
          v-if="installment && installment.installmentNumber"
          :type="getPointsColor() === 'success' ? 'success' : getPointsColor() === 'error' ? 'error' : 'info'"
          variant="tonal"
          class="mt-4"
        >
          {{ getPointsExplanation() }}
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="grey" variant="text" @click="close">
          Cancelar
        </v-btn>
        <v-btn color="primary" @click="save" :loading="loading" :disabled="!valid">
          Confirmar Pago
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue'
import installmentService from '../services/installmentService'

export default {
  name: 'PaymentDialog',
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
  emits: ['update:modelValue', 'saved'],
  setup(props, { emit }) {
    const dialog = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })

    const form = ref(null)
    const valid = ref(false)
    const loading = ref(false)
    const paymentDetails = ref(null)

    const formData = reactive({
      paymentDate: '',
      note: '',
      pointsToAward: 0
    })

    const close = () => {
      dialog.value = false
      resetForm()
    }

    const resetForm = () => {
      formData.paymentDate = ''
      formData.note = ''
      formData.pointsToAward = 0
      paymentDetails.value = null
      if (form.value) {
        form.value.reset()
      }
    }

    const loadPaymentDetails = async () => {
      if (!props.installment?.id) return
      
      try {
        loading.value = true
        const response = await installmentService.getPaymentDetails(props.installment.id)
        paymentDetails.value = response.data
        updatePoints()
      } catch (error) {
        console.error('Error loading payment details:', error)
      } finally {
        loading.value = false
      }
    }

    const calculatePoints = (status) => {
      switch (status) {
        case 'Próxima a vencer':
          return 15
        case 'Vence hoy':
          return 10
        case 'Vencida':
          return -5
        case 'Pendiente':
          return 20
        default:
          return 0
      }
    }

    const calculateInstallmentStatus = (dueDate, paymentDate) => {
      if (!dueDate || !paymentDate) return 'Pendiente'
      
      const due = new Date(dueDate)
      const payment = new Date(paymentDate)
      
      due.setHours(0, 0, 0, 0)
      payment.setHours(0, 0, 0, 0)
      
      const diffDays = Math.ceil((due - payment) / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) {
        return 'Vencida'
      } else if (diffDays === 0) {
        return 'Vence hoy'
      } else if (diffDays <= 2) {
        return 'Próxima a vencer'
      } else {
        return 'Pendiente'
      }
    }

    const updatePoints = () => {
      if (!formData.paymentDate || !paymentDetails.value?.installment?.dueDate) {
        formData.pointsToAward = 0
        return
      }

      const status = calculateInstallmentStatus(
        paymentDetails.value.installment.dueDate,
        formData.paymentDate
      )
      formData.pointsToAward = calculatePoints(status)
    }

    const getPointsColor = () => {
      if (formData.pointsToAward > 0) return 'success'
      if (formData.pointsToAward < 0) return 'error'
      return 'grey'
    }

    const getPointsExplanation = () => {
      if (!formData.paymentDate || !paymentDetails.value?.installment?.dueDate) {
        return 'Selecciona una fecha de pago para calcular los puntos'
      }

      const status = calculateInstallmentStatus(
        paymentDetails.value.installment.dueDate,
        formData.paymentDate
      )

      switch (status) {
        case 'Pendiente':
          return 'Pago muy anticipado: +20 puntos (incentivo máximo)'
        case 'Próxima a vencer':
          return 'Pago anticipado: +15 puntos (incentivo por pago anticipado)'
        case 'Vence hoy':
          return 'Pago puntual: +10 puntos (pago en fecha)'
        case 'Vencida':
          return 'Pago tardío: -5 puntos (penalización menor)'
        default:
          return 'Puntos calculados automáticamente según la fecha de pago'
      }
    }

    const getStatusColor = (status) => {
      switch (status) {
        case 'Pagada':
          return 'text-success'
        case 'Vencida':
          return 'text-error'
        case 'Próxima a vencer':
          return 'text-warning'
        case 'Vence hoy':
          return 'text-info'
        default:
          return 'text-grey'
      }
    }

    const formatDate = (date) => {
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString('es-DO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: 'DOP',
        minimumFractionDigits: 0
      }).format(amount)
    }

    const save = async () => {
      if (!form.value?.validate()) return
      if (!props.installment) return

      try {
        loading.value = true
        await installmentService.pay(props.installment.id, formData)
        emit('saved')
        close()
      } catch (error) {
        console.error('Error saving payment:', error)
      } finally {
        loading.value = false
      }
    }

    // Watchers
    watch(() => props.installment, async (newInstallment) => {
      if (newInstallment) {
        await loadPaymentDetails()
        formData.paymentDate = new Date().toISOString().slice(0, 16)
      }
    }, { immediate: true })

    watch(() => formData.paymentDate, () => {
      updatePoints()
    })

    return {
      dialog,
      form,
      valid,
      loading,
      paymentDetails,
      formData,
      close,
      save,
      calculatePoints,
      calculateInstallmentStatus,
      updatePoints,
      getPointsColor,
      getPointsExplanation,
      getStatusColor,
      formatDate,
      formatCurrency
    }
  }
}
</script> 