<template>
  <v-data-table
    :headers="headers"
    :items="items"
    :loading="loading"
    :search="search"
    :sort-by="sortBy"
    :sort-desc="sortDesc"
    :items-per-page="itemsPerPage"
    :items-per-page-options="[5, 10, 25, 50]"
    class="elevation-1"
  >
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>{{ title }}</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Buscar"
          single-line
          hide-details
          class="mr-4"
          style="max-width: 300px"
        ></v-text-field>
        <v-btn
          color="primary"
          dark
          class="mb-2"
          @click="$emit('add')"
          v-if="showAddButton"
        >
          <v-icon left>mdi-plus</v-icon>
          Agregar
        </v-btn>
      </v-toolbar>
    </template>

    <template v-slot:item.actions="{ item }">
      <v-icon
        small
        class="mr-2"
        @click="$emit('edit', item)"
        v-if="showEditButton"
      >
        mdi-pencil
      </v-icon>
      <v-icon
        small
        class="mr-2"
        @click="$emit('view', item)"
        v-if="showViewButton"
      >
        mdi-eye
      </v-icon>
      <v-icon
        small
        @click="$emit('delete', item)"
        v-if="showDeleteButton"
      >
        mdi-delete
      </v-icon>
    </template>

    <template v-slot:no-data>
      <v-btn color="primary" @click="$emit('refresh')">
        Recargar
      </v-btn>
    </template>
  </v-data-table>
</template>

<script>
export default {
  name: 'DataTable',
  props: {
    headers: {
      type: Array,
      required: true
    },
    items: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Datos'
    },
    showAddButton: {
      type: Boolean,
      default: true
    },
    showEditButton: {
      type: Boolean,
      default: true
    },
    showViewButton: {
      type: Boolean,
      default: false
    },
    showDeleteButton: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      search: '',
      sortBy: [],
      sortDesc: [false],
      itemsPerPage: 10
    }
  }
}
</script> 