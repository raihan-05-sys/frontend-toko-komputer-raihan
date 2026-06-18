<template>
  <el-container class="dashboard-root">

    <el-aside :width="isCollapsed ? '64px' : '240px'" class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-logo">
          <el-icon size="22" color="#6ee7f7"><Monitor /></el-icon>
        </div>
        <transition name="fade-text">
          <span v-if="!isCollapsed" class="brand-name">Toko Komputer</span>
        </transition>
      </div>

      <el-menu
        :default-active="activeRoute"
        :collapse="isCollapsed"
        :collapse-transition="false"
        background-color="#0f172a"
        text-color="#94a3b8"
        active-text-color="#6ee7f7"
        class="sidebar-menu"
        router
      >
        <el-menu-item index="/dashboard" @click="$router.push('/dashboard')">
          <el-icon><HomeFilled /></el-icon>
          <template #title>Beranda</template>
        </el-menu-item>

        <div class="menu-divider" v-if="!isCollapsed">
          <span>DATA MASTER</span>
        </div>
        <div class="menu-divider-line" v-else></div>

        <el-menu-item index="/dashboard/kategori">
          <el-icon><Collection /></el-icon>
          <template #title>Kategori</template>
        </el-menu-item>

        <el-menu-item index="/dashboard/produk">
          <el-icon><Goods /></el-icon>
          <template #title>Produk</template>
        </el-menu-item>

        <el-menu-item index="/dashboard/pelanggan">
          <el-icon><User /></el-icon>
          <template #title>Pelanggan</template>
        </el-menu-item>

        <div class="menu-divider" v-if="!isCollapsed">
          <span>TRANSAKSI</span>
        </div>
        <div class="menu-divider-line" v-else></div>

        <el-menu-item index="/dashboard/pesanan">
          <el-icon><ShoppingCart /></el-icon>
          <template #title>Pesanan</template>
        </el-menu-item>

        <el-menu-item index="/dashboard/detail-pesanan">
          <el-icon><List /></el-icon>
          <template #title>Detail Pesanan</template>
        </el-menu-item>
      </el-menu>

      <div class="sidebar-footer">
        <el-tooltip content="Keluar" placement="right" :disabled="!isCollapsed">
          <div class="logout-btn" @click="logout">
            <el-icon><SwitchButton /></el-icon>
            <span v-if="!isCollapsed">Keluar</span>
          </div>
        </el-tooltip>
      </div>
    </el-aside>

    <el-container class="main-area">

      <el-header class="main-header">
        <div class="header-left">
          <el-button
            :icon="isCollapsed ? Expand : Fold"
            circle
            plain
            size="small"
            @click="isCollapsed = !isCollapsed"
            class="collapse-btn"
          />
          <span class="header-title">{{ pageTitle }}</span>
        </div>
        <div class="header-right">
          <el-tag type="success" effect="dark" size="small" class="status-tag">
            <el-icon style="margin-right:4px"><CircleCheckFilled /></el-icon>
            API Online
          </el-tag>
          <el-avatar :size="34" class="user-avatar">
            <el-icon><UserFilled /></el-icon>
          </el-avatar>
        </div>
      </el-header>

      <el-main class="main-body">

        <div v-if="isHomePage" class="home-content">
          <div class="home-wrapper">
            
            <div class="welcome-banner">
              <div class="welcome-text">
                <h2 class="welcome-title">Selamat Datang di Dashboard 👋</h2>
                <p class="welcome-sub">Pantau statistik toko dan akses menu dengan cepat dari sini.</p>
              </div>
              <div class="welcome-date" v-if="!isMobile">
                <el-tag effect="dark" class="date-tag">{{ currentDate }}</el-tag>
              </div>
            </div>

            <h3 class="section-title">Ringkasan Toko</h3>
            <div class="stat-grid">
              <div class="stat-card stat-card--blue">
                <div class="stat-icon">
                  <el-icon size="28"><Tickets /></el-icon>
                </div>
                <div class="stat-body">
                  <p class="stat-label">Total Transaksi</p>
                  <p class="stat-value" v-loading="statLoading">
                    {{ statLoading ? '...' : (statistik.total_transaksi ?? 0) }}
                  </p>
                  <p class="stat-caption">pesanan tercatat</p>
                </div>
              </div>

              <div class="stat-card stat-card--green">
                <div class="stat-icon">
                  <el-icon size="28"><Money /></el-icon>
                </div>
                <div class="stat-body">
                  <p class="stat-label">Total Pendapatan</p>
                  <p class="stat-value" v-loading="statLoading">
                    {{ statLoading ? '...' : formatRupiah(statistik.total_pendapatan ?? 0) }}
                  </p>
                  <p class="stat-caption">dari seluruh pesanan</p>
                </div>
              </div>
            </div>

            <h3 class="section-title">Menu Akses Cepat</h3>
            <div class="quick-nav-grid">
              <div
                v-for="menu in quickMenus"
                :key="menu.path"
                class="quick-nav-card"
                @click="$router.push(menu.path)"
              >
                <el-icon size="24" :color="menu.color"><component :is="menu.icon" /></el-icon>
                <span>{{ menu.label }}</span>
              </div>
            </div>

            <!-- BAGIAN BARU: 5 TRANSAKSI TERAKIR -->
            <h3 class="section-title" style="margin-top: 40px;">5 Transaksi Terakhir</h3>
            <el-card shadow="never" class="table-card">
              <el-table :data="recentOrders" v-loading="ordersLoading" stripe style="width: 100%" empty-text="Belum ada transaksi">
                <el-table-column prop="id_pesanan" label="ID" width="80" align="center" />
                <el-table-column prop="tanggal_pesanan" label="Tanggal" min-width="160">
                  <template #default="scope">
                    {{ formatTanggal(scope.row.tanggal_pesanan) }}
                  </template>
                </el-table-column>
                <el-table-column prop="total_bayar" label="Total Bayar" min-width="150" align="right">
                  <template #default="scope">
                    <span style="font-weight: 600; color: #059669;">{{ formatRupiah(scope.row.total_bayar) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="Aksi" width="120" align="center">
                  <template #default="scope">
                    <el-button size="small" type="info" plain @click="goToDetail(scope.row.id_pesanan)">
                      Lihat
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>

          </div>
        </div>

        <router-view v-else />

      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Monitor, HomeFilled, Collection, Goods, User, ShoppingCart, List,
  SwitchButton, Expand, Fold, CircleCheckFilled, UserFilled, Tickets, Money
} from '@element-plus/icons-vue'

const router = useRouter()
const route  = useRoute()

const isCollapsed = ref(false)
const statLoading = ref(false)
const ordersLoading = ref(false) // State loading untuk tabel transaksi
const statistik   = ref({ total_transaksi: 0, total_pendapatan: 0 })
const recentOrders = ref([]) // State untuk wadah 5 data transaksi terakhir

const isMobile = ref(typeof window !== 'undefined' ? window.innerWidth < 768 : false)

// Format tanggal hari ini (Contoh: "Rabu, 24 Mei 2024")
const currentDate = ref(new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))

const BASE_URL  = 'https://tugas8-auth-api.vercel.app'
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + localStorage.getItem('karcis_toko_raihan')
})

const isHomePage = computed(() => route.path === '/dashboard' || route.path === '/dashboard/')

const pageTitleMap = {
  '/dashboard':             'Beranda',
  '/dashboard/kategori':    'Manajemen Kategori',
  '/dashboard/produk':      'Manajemen Produk',
  '/dashboard/pelanggan':   'Manajemen Pelanggan',
  '/dashboard/pesanan':     'Manajemen Pesanan',
  '/dashboard/detail-pesanan': 'Detail Pesanan',
}
const pageTitle   = computed(() => pageTitleMap[route.path] || 'Dashboard')
const activeRoute = computed(() => route.path)

const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
const formatTanggal = (val) => val ? new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'

const fetchStatistik = async () => {
  statLoading.value = true
  try {
    const res  = await fetch(`${BASE_URL}/api/statistik`, { headers: getHeaders() })
    const data = await res.json()
    if (res.ok) statistik.value = data.statistik
    else ElMessage.error('Gagal memuat statistik')
  } catch {
    ElMessage.error('Server tidak merespons!')
  } finally {
    statLoading.value = false
  }
}

// FUNGSI BARU: Ambil 5 data transaksi terakhir
const fetchRecentOrders = async () => {
  ordersLoading.value = true
  try {
    const res = await fetch(`${BASE_URL}/api/pesanan`, { headers: getHeaders() })
    const data = await res.json()
    if (res.ok && data.data) {
      // Urutkan ID terbesar ke terkecil, ambil indeks 0 sampai 5
      recentOrders.value = data.data.sort((a, b) => b.id_pesanan - a.id_pesanan).slice(0, 5)
    }
  } catch {
    console.error('Gagal memuat pesanan terakhir')
  } finally {
    ordersLoading.value = false
  }
}

// FUNGSI BARU: Tombol jembatan untuk pindah ke detail pesanan
const goToDetail = (id) => {
  router.push({ name: 'DetailPesanan', query: { id_pesanan: id } })
}

const logout = () => {
  localStorage.removeItem('karcis_toko_raihan')
  ElMessage.success('Berhasil keluar.')
  router.push('/login')
}

const quickMenus = [
  { label: 'Kategori',      path: '/dashboard/kategori',       icon: 'Collection',   color: '#6366f1' },
  { label: 'Produk',        path: '/dashboard/produk',         icon: 'Goods',        color: '#0ea5e9' },
  { label: 'Pelanggan',     path: '/dashboard/pelanggan',      icon: 'User',         color: '#10b981' },
  { label: 'Pesanan',       path: '/dashboard/pesanan',        icon: 'ShoppingCart', color: '#f59e0b' },
  { label: 'Detail Pesanan',path: '/dashboard/detail-pesanan', icon: 'List',         color: '#ef4444' },
]

onMounted(() => {
  if (isHomePage.value) {
    fetchStatistik()
    fetchRecentOrders() // Panggil tabel transaksi saat halman dimuat
  }
  window.addEventListener('resize', () => isMobile.value = window.innerWidth < 768)
})

watch(isHomePage, (val) => {
  if (val) {
    fetchStatistik()
    fetchRecentOrders() // Update tabel otomatis setiap kembali ke Beranda
  }
})
</script>

<style scoped>
/* ── Layout Root ── */
.dashboard-root {
  height: 100vh;
  overflow: hidden;
  font-family: 'Inter', system-ui, sans-serif;
}

/* ══ SIDEBAR ══ */
.sidebar {
  background: #0f172a;
  display: flex;
  flex-direction: column;
  transition: width 0.25s cubic-bezier(0.4,0,0.2,1);
  overflow: hidden;
  border-right: 1px solid rgba(255,255,255,0.05);
  flex-shrink: 0;
}

.sidebar-brand {
  height: 60px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}
.brand-logo {
  width: 36px; height: 36px;
  background: rgba(110, 231, 247, 0.1);
  border: 1px solid rgba(110, 231, 247, 0.2);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.brand-name { font-size: 15px; font-weight: 700; color: #f0f9ff; white-space: nowrap; letter-spacing: -0.3px; }

.sidebar-menu {
  flex: 1;
  border-right: none !important;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 0;
}
.sidebar-menu :deep(.el-menu-item) {
  height: 44px; margin: 2px 8px; border-radius: 8px; font-size: 13.5px; font-weight: 500; transition: background 0.15s, color 0.15s;
}
.sidebar-menu :deep(.el-menu-item:hover) { background: rgba(110, 231, 247, 0.08) !important; color: #e2e8f0 !important; }
.sidebar-menu :deep(.el-menu-item.is-active) { background: rgba(110, 231, 247, 0.12) !important; color: #6ee7f7 !important; }
.sidebar-menu :deep(.el-menu--collapse .el-menu-item) { justify-content: center; margin: 2px 4px; }

.menu-divider { padding: 16px 20px 6px; font-size: 10px; font-weight: 600; color: #334155; letter-spacing: 1px; text-transform: uppercase; }
.menu-divider-line { height: 1px; background: rgba(255,255,255,0.06); margin: 8px 12px; }

.sidebar-footer { border-top: 1px solid rgba(255,255,255,0.06); padding: 12px 8px; flex-shrink: 0; }
.logout-btn { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; cursor: pointer; font-size: 13.5px; font-weight: 500; color: #64748b; transition: all 0.15s; }
.logout-btn:hover { background: rgba(239, 68, 68, 0.1); color: #f87171; }

.fade-text-enter-active, .fade-text-leave-active { transition: opacity 0.2s; }
.fade-text-enter-from, .fade-text-leave-to { opacity: 0; }

/* ══ HEADER ══ */
.main-header {
  height: 60px !important;
  background: #ffffff;
  border-bottom: 1px solid #f1f5f9;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px; flex-shrink: 0;
}
.header-left { display: flex; align-items: center; gap: 14px; }
.collapse-btn { border-color: #e2e8f0 !important; color: #64748b !important; }
.header-title { font-size: 15px; font-weight: 600; color: #1e293b; }
.header-right { display: flex; align-items: center; gap: 12px; }
.status-tag { font-size: 12px; }
.user-avatar { background: linear-gradient(135deg, #6ee7f7, #818cf8); cursor: pointer; }

/* ══ MAIN BODY ══ */
.main-area { flex: 1; min-width: 0; display: flex; flex-direction: column; background: #f8fafc; }
.main-body { flex: 1; overflow-y: auto; padding: 0; }

/* ══ HOME PAGE ══ */
.home-content { padding: 32px; }

/* Wrapper agar konten tidak melar di monitor ultra-wide */
.home-wrapper {
  max-width: 1100px; /* Batas lebar maksimal */
  margin: 0 auto;    /* Posisikan di tengah */
}

/* Welcome Banner Mewah */
.welcome-banner {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 20px;
  padding: 32px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 36px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.15);
  position: relative;
  overflow: hidden;
}
/* Aksen cahaya di banner */
.welcome-banner::after {
  content: ''; position: absolute; top: -50%; right: -10%; width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(110,231,247,0.1) 0%, transparent 70%); border-radius: 50%;
}
.welcome-title { font-size: 26px; font-weight: 700; color: #f8fafc; margin: 0 0 8px; position: relative; z-index: 1;}
.welcome-sub { font-size: 15px; color: #94a3b8; margin: 0; position: relative; z-index: 1;}
.date-tag { background: rgba(255,255,255,0.1); border: none; color: #6ee7f7; font-size: 13px; padding: 8px 16px; height: auto; border-radius: 8px; position: relative; z-index: 1;}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #334155;
  margin: 0 0 16px 4px;
  letter-spacing: 0.3px;
}

/* Stat Cards Grid */
.stat-grid {
  display: grid;
  /* Auto-fill mencegah melar: kotak akan berukuran 300px, sisanya jadi ruang kosong rapi */
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}
.stat-card {
  border-radius: 18px; padding: 26px; display: flex; align-items: center; gap: 20px;
  position: relative; overflow: hidden; box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
}
.stat-card::before {
  content: ''; position: absolute; top: -30px; right: -30px; width: 120px; height: 120px;
  border-radius: 50%; opacity: 0.08; background: currentColor;
}
.stat-card--blue { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1px solid #bfdbfe; color: #1d4ed8; }
.stat-card--green { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #bbf7d0; color: #15803d; }
.stat-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-card--blue .stat-icon { background: rgba(29, 78, 216, 0.1); color: #1d4ed8; }
.stat-card--green .stat-icon { background: rgba(21, 128, 61, 0.1); color: #15803d; }
.stat-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 6px; opacity: 0.7; }
.stat-value { font-size: 26px; font-weight: 800; margin: 0 0 4px; letter-spacing: -0.5px; }
.stat-caption { font-size: 12px; margin: 0; opacity: 0.6; }
.stat-body { min-width: 0; }

/* Quick Nav */
.quick-nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}
.quick-nav-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  transition: all 0.25s ease;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
}
.quick-nav-card:hover {
  border-color: #6ee7f7;
  box-shadow: 0 10px 25px rgba(110,231,247,0.15);
  transform: translateY(-4px); /* Efek melayang */
}
.quick-nav-card :deep(.el-icon) {
  width: 52px; height: 52px;
  display: grid; place-items: center;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.04);
  transition: transform 0.25s ease;
}
.quick-nav-card:hover :deep(.el-icon) {
  transform: scale(1.1); /* Ikon membesar saat di-hover */
}
.quick-nav-card span { display: block; margin-top: 4px; }

/* CSS Baru untuk Table Card 5 Transaksi Terakhir */
.table-card {
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.02);
}
</style>