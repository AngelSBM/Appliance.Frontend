<template>
  <v-chip
    :color="chipColor"
    :text-color="textColor"
    small
    :class="chipClass"
  >
    {{ status }}
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
    }
  },
  computed: {
    chipColor() {
      const statusMap = {
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
        'installment': {
          'PENDING': 'warning',
          'PAID': 'success',
          'OVERDUE': 'error'
        },
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
      
      if (this.type && typeMap[this.type] && typeMap[this.type][this.status]) {
        return typeMap[this.type][this.status]
      }
      
      return statusMap[this.status] || statusMap['DEFAULT']
    },
    textColor() {
      return 'white'
    },
    chipClass() {
      return {
        'font-weight-bold': true
      }
    }
  }
}
</script> 