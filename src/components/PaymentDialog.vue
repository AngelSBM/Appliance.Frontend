<template>
  <v-dialog v-model="dialog" max-width="500px">
    <v-card>
      <v-card-title class="text-h5">
        <v-icon class="mr-2" color="success">mdi-credit-card</v-icon>
        Marcar como Pagado
      </v-card-title>

      <v-card-text>
        <!-- Información básica de la cuota -->
        <v-alert
          v-if="installment && installment.installmentNumber"
          type="info"
          variant="tonal"
          class="mb-4"
        >
          <strong>Cuota #{{ installment.installmentNumber }}</strong><br>
          Monto: {{ formatCurrency(installment.amount) }}<br>
          Vencimiento: {{ formatDate(installment.dueDate) }}
        </v-alert>

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
import systemDateService from '../services/systemDateService'

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
    const systemDate = ref(null)

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
      if (form.value) {
        form.value.reset()
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

    const loadSystemDate = async () => {
      try {
        const response = await systemDateService.getSystemDate()
        console.log('Respuesta del backend (fecha del sistema):', response.data)
        
        // Asegurar que la fecha se parse correctamente
        const dateString = response.data
        const parsedDate = new Date(dateString)
        
        if (isNaN(parsedDate.getTime())) {
          console.error('Fecha inválida recibida del backend:', dateString)
          systemDate.value = new Date()
        } else {
          systemDate.value = parsedDate
          console.log('Fecha del sistema para cálculo de puntos:', systemDate.value)
        }
      } catch (error) {
        console.error('Error loading system date:', error)
        // Fallback a fecha actual si no se puede obtener la fecha del sistema
        systemDate.value = new Date()
      }
    }

    const calculateInstallmentStatus = (dueDate, paymentDate) => {
      if (!dueDate || !paymentDate) return 'Pendiente'
      
      // Usar directamente el estado que ya viene en los datos de la cuota
      if (props.installment && props.installment.isOverdue) {
        return 'Vencida'
      }
      
      const due = new Date(dueDate)
      const payment = new Date(paymentDate)
      
      // Usar la fecha del sistema del backend si está disponible
      let currentDate = systemDate.value || new Date()
      
      // Si la cuota tiene información de días vencidos, calcular la fecha del sistema a partir de ahí
      if (props.installment && props.installment.daysOverdue !== undefined) {
        const dueDateObj = new Date(dueDate)
        dueDateObj.setHours(0, 0, 0, 0)
        currentDate = new Date(dueDateObj.getTime() + (props.installment.daysOverdue * 24 * 60 * 60 * 1000))
        console.log('Calculando fecha del sistema desde días vencidos:', {
          dueDate: dueDate,
          daysOverdue: props.installment.daysOverdue,
          calculatedSystemDate: currentDate
        })
      }
      
      due.setHours(0, 0, 0, 0)
      payment.setHours(0, 0, 0, 0)
      currentDate.setHours(0, 0, 0, 0)
      
      // Calcular días entre la fecha actual del sistema y la fecha de vencimiento
      const daysUntilDue = Math.ceil((due - currentDate) / (1000 * 60 * 60 * 24))
      
      console.log('Cálculo de estado:', {
        dueDate: due,
        systemDate: currentDate,
        daysUntilDue: daysUntilDue,
        isOverdue: props.installment?.isOverdue
      })
      
      // Si la cuota ya está vencida según la fecha del sistema, mostrar como vencida
      if (daysUntilDue < 0) {
        return 'Vencida'
      } else if (daysUntilDue === 0) {
        return 'Vence hoy'
      } else if (daysUntilDue <= 2) {
        return 'Próxima a vencer'
      } else {
        return 'Pendiente'
      }
    }

    const updatePoints = () => {
      if (!formData.paymentDate || !props.installment?.dueDate) {
        formData.pointsToAward = 0
        return
      }

      const status = calculateInstallmentStatus(
        props.installment.dueDate,
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
      if (!formData.paymentDate || !props.installment?.dueDate) {
        return 'Selecciona una fecha de pago para calcular los puntos'
      }

      const status = calculateInstallmentStatus(
        props.installment.dueDate,
        formData.paymentDate
      )

      const systemDateText = systemDate.value ? 
        `(Fecha del sistema: ${formatDate(systemDate.value)})` : 
        '(Usando fecha actual)'
      
      // Debug info
      console.log('Debug - Fecha de vencimiento:', props.installment.dueDate)
      console.log('Debug - Fecha del sistema:', systemDate.value)
      console.log('Debug - Estado calculado:', status)
      
      // Calcular días para debug
      const due = new Date(props.installment.dueDate)
      const current = systemDate.value || new Date()
      const daysUntilDue = Math.ceil((due - current) / (1000 * 60 * 60 * 24))
      console.log('Debug - Días hasta vencimiento:', daysUntilDue)
      console.log('Debug - ¿Está vencida?', daysUntilDue < 0)

      switch (status) {
        case 'Pendiente':
          return `Pago muy anticipado: +20 puntos (incentivo máximo) ${systemDateText}`
        case 'Próxima a vencer':
          return `Pago anticipado: +15 puntos (incentivo por pago anticipado) ${systemDateText}`
        case 'Vence hoy':
          return `Pago puntual: +10 puntos (pago en fecha) ${systemDateText}`
        case 'Vencida':
          return `Pago tardío: -5 puntos (penalización menor) ${systemDateText}`
        default:
          return `Puntos calculados automáticamente según la fecha de pago ${systemDateText}`
      }
    }

    const formatDate = (date) => {
      if (!date) return 'N/A'
      try {
        const dateObj = new Date(date)
        if (isNaN(dateObj.getTime())) return 'Fecha inválida'
        return dateObj.toLocaleDateString('es-DO', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      } catch (error) {
        console.error('Error formatting date:', error, date)
        return 'Fecha inválida'
      }
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
        // Cargar la fecha del sistema cuando se abre el diálogo
        await loadSystemDate()
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
      formData,
      systemDate,
      close,
      save,
      calculatePoints,
      calculateInstallmentStatus,
      updatePoints,
      getPointsColor,
      getPointsExplanation,
      formatDate,
      formatCurrency
    }
  }
}
</script> 