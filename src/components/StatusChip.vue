<template>
  <v-chip
    :color="chipColor"
    :text-color="textColor"
    size="small"
    :class="chipClass"
  >
    {{ displayStatus }}
  </v-chip>
</template>

<script>
export default {
  name: 'StatusChip',
  props: {
    status: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'default'
    },
    isOverdue: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    displayStatus() {
      // Para cuotas, si está vencida, mostrar "Vencida" sin importar el status
      if (this.type === 'installment' && this.isOverdue) {
        return 'Vencida'
      }
      return this.status
    },
    chipColor() {
      // Mapeo específico para estados de cuotas (en español e inglés)
      const installmentStatusMap = {
        // Estados en español
        'Pagada': 'success',
        'Pendiente': 'info',
        'Vencida': 'error',
        'Próxima a vencer': 'warning',
        'Vence hoy': 'orange',
        'Cancelada': 'grey',
        
        // Estados en inglés (por compatibilidad)
        'PAID': 'success',
        'PENDING': 'info',
        'OVERDUE': 'error',
        'UPCOMING': 'warning',
        'DUE_TODAY': 'orange',
        'CANCELLED': 'grey'
      }
      
      const generalStatusMap = {
        'PENDING': 'warning',
        'PAID': 'success',
        'OVERDUE': 'error',
        'CANCELLED': 'grey',
        'ACTIVE': 'primary',
        'INACTIVE': 'grey',
        'COMPLETED': 'success',
        'DEFAULT': 'primary'
      }
      
      const typeMap = {
        'installment': installmentStatusMap,
        'contract': {
          'ACTIVE': 'primary',
          'COMPLETED': 'success',
          'CANCELLED': 'grey'
        },
        'customer': {
          'ACTIVE': 'success',
          'INACTIVE': 'grey'
        }
      }
      
      // Si es tipo installment, usar el mapeo específico
      if (this.type === 'installment') {
        return installmentStatusMap[this.displayStatus] || 'primary'
      }
      
      // Si hay un tipo específico definido
      if (this.type && typeMap[this.type] && typeMap[this.type][this.status]) {
        return typeMap[this.type][this.status]
      }
      
      // Mapeo general
      return generalStatusMap[this.status] || generalStatusMap['DEFAULT']
    },
    textColor() {
      // Para chips claros, usar texto oscuro
      const lightColors = ['info', 'warning', 'orange']
      return lightColors.includes(this.chipColor) ? 'white' : 'white'
    },
    chipClass() {
      return {
        'font-weight-medium': true
      }
    }
  }
}
</script> 