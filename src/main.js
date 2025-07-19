import './assets/main.css'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import colors from 'vuetify/util/colors'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Vue Router
import router from './router'

import { createApp } from 'vue'
import App from './App.vue'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light'
  },
  defaults: {
    VNavigationDrawer: {
      width: 280
    },
    VMain: {
      class: 'pa-0'
    }
  }
})

createApp(App).use(vuetify).use(router).mount('#app')
