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
    density="comfortable"
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
      <v-tooltip bottom v-if="showEditButton">
        <template v-slot:activator="{ on, attrs }">
          <v-icon
            small
            class="mr-2"
            color="primary"
            v-bind="attrs"
            v-on="on"
            @click="$emit('edit', item)"
          >
            mdi-pencil
          </v-icon>
        </template>
        <span>Editar</span>
      </v-tooltip>
      
      <v-tooltip bottom v-if="showViewButton">
        <template v-slot:activator="{ on, attrs }">
          <v-icon
            small
            class="mr-2"
            color="info"
            v-bind="attrs"
            v-on="on"
            @click="$emit('view', item)"
          >
            mdi-eye
          </v-icon>
        </template>
        <span>Ver</span>
      </v-tooltip>
      
      <v-tooltip bottom v-if="showDeleteButton">
        <template v-slot:activator="{ on, attrs }">
          <v-icon
            small
            color="error"
            v-bind="attrs"
            v-on="on"
            @click="$emit('delete', item)"
          >
            mdi-delete
          </v-icon>
        </template>
        <span>Eliminar</span>
      </v-tooltip>
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