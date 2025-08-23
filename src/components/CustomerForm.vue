<template>
  <v-dialog v-model="dialog" max-width="500px" persistent>
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ isEdit ? 'Editar Cliente' : 'Nuevo Cliente' }}</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.fullName"
                  label="Nombre Completo"
                  :rules="[v => !!v || 'El nombre es requerido']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.nationalId"
                  label="Cédula de Ciudadanía"
                  :rules="[v => !!v || 'La cédula es requerida']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.email"
                  label="Email"
                  type="email"
                  :rules="[v => !v || /.+@.+\..+/.test(v) || 'Email debe ser válido']"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model.number="formData.age"
                  label="Edad"
                  type="number"
                  :rules="[v => !!v || 'La edad es requerida', v => v > 0 || 'La edad debe ser mayor a 0']"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click="cancel">
          Cancelar
        </v-btn>
        <v-btn color="primary" variant="text" @click="save" :loading="saving">
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'CustomerForm',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    customer: {
      type: Object,
      default: () => ({
        fullName: '',
        nationalId: '',
        email: '',
        age: null
      })
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'save'],
  data() {
    return {
      valid: true,
      saving: false,
      formData: {
        fullName: '',
        nationalId: '',
        email: '',
        age: null
      }
    }
  },
  computed: {
    dialog: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  },
  watch: {
    customer: {
      handler(newCustomer) {
        this.formData = { ...newCustomer }
      },
      immediate: true
    }
  },
  methods: {
    async save() {
      // Validar formulario
      const { valid } = await this.$refs.form.validate()
      if (!valid) {
        this.$emit('error', 'Por favor complete todos los campos requeridos')
        return
      }

      this.saving = true
      try {
        this.$emit('save', { ...this.formData })
      } catch (error) {
        this.$emit('error', 'Error al guardar el cliente')
      } finally {
        this.saving = false
      }
    },
    cancel() {
      this.dialog = false
      this.$refs.form.resetValidation()
    }
  }
}
</script>
