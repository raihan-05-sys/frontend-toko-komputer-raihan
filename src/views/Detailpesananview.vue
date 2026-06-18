<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">Detail Pesanan {{ idPesanan ? `#${idPesanan}` : '' }}</h2>
        <p class="page-sub">Rincian item untuk pesanan ini</p>
      </div>
    </div>

    <el-card shadow="never" class="table-card">
      <el-table :data="detailList" v-loading="isLoading" stripe style="width: 100%" empty-text="Belum ada data detail">
        <el-table-column type="index" label="No" width="60" align="center" />
        <el-table-column prop="id_detail" label="ID Detail" width="100" align="center" />
        <el-table-column prop="id_pesanan" label="ID Pesanan" width="110" align="center" />
        <el-table-column prop="id_produk" label="ID Produk" width="110" align="center" />
        <el-table-column prop="jumlah" label="Jumlah" width="90" align="center" />
        <el-table-column prop="subtotal" label="Subtotal" min-width="160" align="right">
          <template #default="scope">
            <span class="subtotal-text">{{ formatRupiah(scope.row.subtotal) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const idPesanan = ref(route.query.id_pesanan || null)
const BASE_URL = 'https://tugas8-auth-api.vercel.app'
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + localStorage.getItem('karcis_toko_raihan')
})

const detailList = ref([])
const isLoading = ref(false)

const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)

const fetchData = async () => {
  isLoading.value = true
  try {
    const url = idPesanan.value 
      ? `${BASE_URL}/api/detail_pesanan/by_pesanan/${idPesanan.value}` 
      : `${BASE_URL}/api/detail_pesanan`
    
    const res = await fetch(url, { headers: getHeaders() })
    const data = await res.json()
    detailList.value = data.data || []
  } catch {
    ElMessage.error('Gagal memuat detail!')
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchData)
</script>

// tes
<style scoped>
.page-container { padding: 24px; }
.page-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  gap: 16px;
  margin-bottom: 20px; 
}
.page-title { font-size: 20px; font-weight: 700; margin: 0 0 4px; color: #1e293b; }
.page-sub { font-size: 13px; color: #94a3b8; margin: 0; }
.table-card { border-radius: 12px; }
.subtotal-text { font-weight: 600; color: #0284c7; }
</style>