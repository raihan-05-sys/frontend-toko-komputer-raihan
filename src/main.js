import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'

// Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// Daftarkan SEMUA ikon Element Plus secara global
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// CSS global proyek
import './style.css'

const app = createApp(App)

// Pasang semua ikon sebagai komponen global (agar bisa pakai :icon="Edit" dll.)
for (const [name, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(name, component)
}

app.use(router)
app.use(ElementPlus)

app.mount('#app')