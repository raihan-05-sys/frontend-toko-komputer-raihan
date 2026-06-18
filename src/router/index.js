import { createRouter, createWebHistory } from 'vue-router'

import LoginView        from '../views/LoginView.vue'
import DashboardView    from '../views/DashboardView.vue'
import KategoriView     from '../views/KategoriView.vue'
import ProdukView       from '../views/ProdukView.vue'
import PelangganView    from '../views/PelangganView.vue'
import PesananView      from '../views/PesananView.vue'
import DetailPesananView from '../views/DetailPesananView.vue'

const routes = [
  // Redirect root → login
  {
    path: '/',
    redirect: '/login'
  },

  // Halaman Login (publik, tidak butuh token)
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false }
  },

  // Halaman Dashboard (induk, butuh login)
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true },
    // Halaman CRUD sebagai child route dari dashboard
    children: [
      {
        path: 'kategori',
        name: 'Kategori',
        component: KategoriView
      },
      {
        path: 'produk',
        name: 'Produk',
        component: ProdukView
      },
      {
        path: 'pelanggan',
        name: 'Pelanggan',
        component: PelangganView
      },
      {
        path: 'pesanan',
        name: 'Pesanan',
        component: PesananView
      },
      {
        path: 'detail-pesanan',
        name: 'DetailPesanan',
        component: DetailPesananView
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ── Navigation Guard: Proteksi halaman yang butuh login (VERSI MODERN) ──
router.beforeEach((to, from) => {
  const token = localStorage.getItem('karcis_toko_raihan')

  // Cek apakah salah satu matched route (termasuk parent) butuh auth
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth === true)

  if (requiresAuth && !token) {
    // Belum login → paksa ke halaman login dengan return
    return { name: 'Login' }
  } else if (to.name === 'Login' && token) {
    // Sudah login tapi iseng buka /login → lempar ke dashboard dengan return
    return { name: 'Dashboard' }
  }
  
  // Jika aman, biarkan lewat (tidak perlu panggil next() lagi, cukup return true atau biarkan kosong)
  return true
})

export default router