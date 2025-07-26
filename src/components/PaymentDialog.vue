<template>
  <v-dialog v-model="dialogModel" max-width="500px">
    <v-card>
      <v-card-title class="text-h5">
        <v-icon class="mr-2" color="success">mdi-credit-card</v-icon>
        Procesar Pago
      </v-card-title>

      <v-card-text>
        <div v-if="installment && installment.installmentNumber" class="mb-4">
          <v-alert type="info" variant="tonal">
            <strong>Cuota #{{ installment.installmentNumber }}</strong><br>
            Monto: {{ formatCurrency(installment.amount) }}<br>
            Vencimiento: {{ formatDate(installment.dueDate) }}
          </v-alert>
        </div>

        <v-form ref="form" v-model="valid">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="formData.paymentDate"
                label="Fecha de Pago"
                type="datetime-local"
                required
                :rules="[v => !!v || 'Fecha de pago es requerida']"
                prepend-icon="mdi-calendar-clock"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model.number="formData.pointsToAward"
                label="Puntos a Otorgar"
                type="number"
                min="0"
                required
                :rules="[v => v >= 0 || 'Los puntos deben ser mayor o igual a 0']"
                prepend-icon="mdi-star"
                hint="Puntos de fidelidad que se otorgarán al cliente"
                persistent-hint
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="formData.note"
                label="Nota del Pago"
                rows="3"
                prepend-icon="mdi-note-text"
                placeholder="Notas adicionales sobre el pago..."
                hint="Información adicional sobre el pago realizado"
                persistent-hint
              ></v-textarea>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          variant="text"
          @click="close"
          :disabled="loading"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="success"
          @click="save"
          :loading="loading"
          :disabled="!valid"
        >
          <v-icon class="mr-2">mdi-check</v-icon>
          Procesar Pago
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, reactive, computed } from 'vue'

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
  emits: ['update:modelValue', 'save', 'close'],
  setup(props, { emit }) {
    const form = ref(null)
    const valid = ref(false)
    const loading = ref(false)

    const formData = reactive({
      paymentDate: new Date().toISOString().slice(0, 16),
      pointsToAward: 10,
      note: ''
    })

    const dialogModel = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })

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

    const save = async () => {
      if (!form.value || !form.value.validate()) return
      if (!props.installment) {
        console.error('No installment selected')
        return
      }

      loading.value = true
      try {
        const paymentData = {
          ...formData,
          paymentDate: new Date(formData.paymentDate).toISOString()
        }

        emit('save', paymentData)
      } catch (error) {
        console.error('Error processing payment:', error)
      } finally {
        loading.value = false
      }
    }

    const close = () => {
      emit('close')
    }

    return {
      form,
      valid,
      loading,
      formData,
      dialogModel,
      formatCurrency,
      formatDate,
      save,
      close
    }
  }
}
</script> 