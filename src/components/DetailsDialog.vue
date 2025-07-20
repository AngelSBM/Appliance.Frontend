<template>
  <v-dialog v-model="dialogModel" max-width="700px">
    <v-card>
      <v-card-title class="text-h5">
        <v-icon class="mr-2" color="info">mdi-information</v-icon>
        Detalles de la Cuota
      </v-card-title>

      <v-card-text v-if="installment">
        <v-row>
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="pa-4">
              <h3 class="text-h6 mb-3">
                <v-icon class="mr-2" color="primary">mdi-credit-card</v-icon>
                Información de la Cuota
              </h3>
              
              <v-list density="compact">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-numeric</v-icon>
                  </template>
                  <v-list-item-title>Número de Cuota</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-chip color="primary" size="small">
                      #{{ installment.installmentNumber }}
                    </v-chip>
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="success">mdi-currency-usd</v-icon>
                  </template>
                  <v-list-item-title>Monto</v-list-item-title>
                  <v-list-item-subtitle class="font-weight-bold">
                    {{ formatCurrency(installment.amount) }}
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="info">mdi-flag</v-icon>
                  </template>
                  <v-list-item-title>Estado</v-list-item-title>
                  <v-list-item-subtitle>
                    <StatusChip :status="installment.status" />
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="warning">mdi-file-document</v-icon>
                  </template>
                  <v-list-item-title>Contrato</v-list-item-title>
                  <v-list-item-subtitle>
                    #{{ installment.contractId }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card variant="outlined" class="pa-4">
              <h3 class="text-h6 mb-3">
                <v-icon class="mr-2" color="primary">mdi-calendar</v-icon>
                Fechas Importantes
              </h3>
              
              <v-list density="compact">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="warning">mdi-calendar-clock</v-icon>
                  </template>
                  <v-list-item-title>Fecha de Vencimiento</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ formatDate(installment.dueDate) }}
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item v-if="installment.paymentDate">
                  <template v-slot:prepend>
                    <v-icon color="success">mdi-calendar-check</v-icon>
                  </template>
                  <v-list-item-title>Fecha de Pago</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ formatDateTime(installment.paymentDate) }}
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item v-if="installment.startDate">
                  <template v-slot:prepend>
                    <v-icon color="info">mdi-calendar-start</v-icon>
                  </template>
                  <v-list-item-title>Fecha de Inicio</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ formatDate(installment.startDate) }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>

        <!-- Estado de vencimiento -->
        <v-row class="mt-4">
          <v-col cols="12">
            <v-card variant="outlined" class="pa-4">
              <h3 class="text-h6 mb-3">
                <v-icon class="mr-2" color="primary">mdi-alert-circle</v-icon>
                Estado de Vencimiento
              </h3>
              
              <v-alert
                v-if="installment.isOverdue"
                type="error"
                variant="tonal"
                class="mb-3"
              >
                <strong>¡Cuota Vencida!</strong><br>
                Esta cuota está vencida por {{ installment.daysOverdue }} días
              </v-alert>

              <v-alert
                v-else-if="installment.daysUntilDue !== undefined && installment.daysUntilDue <= 7"
                type="warning"
                variant="tonal"
                class="mb-3"
              >
                <strong>Próxima a Vencer</strong><br>
                Esta cuota vence en {{ installment.daysUntilDue }} días
              </v-alert>

              <v-alert
                v-else
                type="success"
                variant="tonal"
                class="mb-3"
              >
                <strong>Al Día</strong><br>
                Esta cuota está al día con los pagos
              </v-alert>
            </v-card>
          </v-col>
        </v-row>

        <!-- Nota -->
        <v-row v-if="installment.note" class="mt-4">
          <v-col cols="12">
            <v-card variant="outlined" class="pa-4">
              <h3 class="text-h6 mb-3">
                <v-icon class="mr-2" color="primary">mdi-note-text</v-icon>
                Nota
              </h3>
              <p class="text-body-1">{{ installment.note }}</p>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          v-if="installment && installment.status !== 'PAID'"
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
import { computed } from 'vue'
import StatusChip from './StatusChip.vue'

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

    const close = () => {
      emit('close')
    }

    const processPayment = () => {
      emit('process-payment', props.installment)
    }

    return {
      dialogModel,
      formatCurrency,
      formatDate,
      formatDateTime,
      close,
      processPayment
    }
  }
}
</script> 