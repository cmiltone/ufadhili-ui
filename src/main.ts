/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'

import './registerServiceWorker'

import './assets/styles.scss'
import store from './store'
import Notification from '@kyvg/vue3-notification'

const app = createApp(App)

registerPlugins(app)

app.use(store);
app.use(Notification);

app.mount('#app')
