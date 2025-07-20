<template>
  <v-dialog v-model="dialogModel" max-width="600px">
    <v-card>
      <v-card-title class="text-h5">
        <v-icon class="mr-2" color="primary">mdi-credit-card</v-icon>
        {{ installment ? 'Editar Cuota' : 'Nueva Cuota' }}
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-row>
            <v-col cols="12" sm="6">
                             <v-select
                 v-model="formData.contractId"
                 :items="contracts"
                 item-title="id"
                 item-value="id"
                 label="Contrato"
                 required
                 :rules="[v => !!v || 'Contrato es requerido']"
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

            <v-col cols="12" sm="6">
                             <v-text-field
                 v-model.number="formData.installmentNumber"
                 label="Número de Cuota"
                 type="number"
                 min="1"
                 required
                 :rules="[v => !!v || 'Número de cuota es requerido']"
                 prepend-icon="mdi-numeric"
               ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
                             <v-text-field
                 v-model.number="formData.amount"
                 label="Monto"
                 type="number"
                 min="0"
                 required
                 :rules="[v => !!v || 'Monto es requerido']"
                 prepend-icon="mdi-currency-usd"
                 prefix="$"
               ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
                             <v-select
                 v-model="formData.installmentStatusId"
                 :items="statuses"
                 item-title="status"
                 item-value="id"
                 label="Estado"
                 required
                 :rules="[v => !!v || 'Estado es requerido']"
                 prepend-icon="mdi-flag"
               ></v-select>
            </v-col>

            <v-col cols="12" sm="6">
                             <v-text-field
                 v-model="formData.dueDate"
                 label="Fecha de Vencimiento"
                 type="date"
                 required
                 :rules="[v => !!v || 'Fecha de vencimiento es requerida']"
                 prepend-icon="mdi-calendar"
               ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
                             <v-text-field
                 v-model="formData.paymentDate"
                 label="Fecha de Pago"
                 type="datetime-local"
                 prepend-icon="mdi-calendar-clock"
               ></v-text-field>
            </v-col>

            <v-col cols="12">
                             <v-textarea
                 v-model="formData.note"
                 label="Nota"
                 rows="3"
                 prepend-icon="mdi-note-text"
                 placeholder="Notas adicionales sobre la cuota..."
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
          color="primary"
          @click="save"
          :loading="loading"
          :disabled="!valid"
        >
          <v-icon class="mr-2">mdi-content-save</v-icon>
          {{ installment ? 'Actualizar' : 'Crear' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, reactive, watch, computed } from 'vue'

export default {
  name: 'InstallmentDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    installment: {
      type: Object,
      default: null
    },
    customers: {
      type: Array,
      default: () => []
    },
    contracts: {
      type: Array,
      default: () => []
    },
    statuses: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'save', 'close'],
  setup(props, { emit }) {
    const form = ref(null)
    const valid = ref(false)
    const loading = ref(false)

    const formData = reactive({
      contractId: null,
      installmentNumber: null,
      amount: null,
      installmentStatusId: null,
      dueDate: null,
      paymentDate: null,
      note: ''
    })

    const dialogModel = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })

    // Observar cambios en el installment para llenar el formulario
    watch(() => props.installment, (newInstallment) => {
      if (newInstallment) {
        Object.assign(formData, {
          contractId: newInstallment.contractId,
          installmentNumber: newInstallment.installmentNumber,
          amount: newInstallment.amount,
          installmentStatusId: newInstallment.installmentStatusId || newInstallment.status,
          dueDate: newInstallment.dueDate ? newInstallment.dueDate.split('T')[0] : null,
          paymentDate: newInstallment.paymentDate ? newInstallment.paymentDate.slice(0, 16) : null,
          note: newInstallment.note || ''
        })
      } else {
        // Resetear formulario
        Object.assign(formData, {
          contractId: null,
          installmentNumber: null,
          amount: null,
          installmentStatusId: null,
          dueDate: null,
          paymentDate: null,
          note: ''
        })
      }
    }, { immediate: true })

    const save = async () => {
      if (!form.value || !form.value.validate()) return

      loading.value = true
      try {
        const installmentData = {
          ...formData,
          id: props.installment ? props.installment.id : null
        }

        // Convertir fechas al formato correcto
        if (installmentData.dueDate) {
          installmentData.dueDate = new Date(installmentData.dueDate).toISOString()
        }
        if (installmentData.paymentDate) {
          installmentData.paymentDate = new Date(installmentData.paymentDate).toISOString()
        }

        emit('save', installmentData)
      } catch (error) {
        console.error('Error saving installment:', error)
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
      save,
      close
    }
  }
}
</script> 