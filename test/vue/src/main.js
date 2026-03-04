import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Pz from './pz-ui.es.js'

const app = createApp(App)

app.use(router)
app.use(Pz)

app.mount('#app')
