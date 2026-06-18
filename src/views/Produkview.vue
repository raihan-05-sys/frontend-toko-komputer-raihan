<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">Manajemen Produk</h2>
        <p class="page-sub">Kelola semua produk beserta harga dan stok</p>
      </div>
      <el-button type="primary" :icon="Plus" class="add-button" @click="openTambah">
        Tambah Produk
      </el-button>
    </div>

    <el-card shadow="never" class="table-card">
      <el-table :data="produkList" v-loading="isLoading" stripe style="width: 100%" empty-text="Belum ada data produk">
        <el-table-column type="index" label="No" width="60" align="center" />
        <el-table-column prop="id_produk" label="ID" width="70" align="center" />
        <el-table-column prop="nama_produk" label="Nama Produk" min-width="180" />
        <el-table-column prop="harga" label="Harga" width="160" align="right">
          <template #default="scope">
            {{ formatRupiah(scope.row.harga) }}
          </template>
        </el-table-column>
        <el-table-column prop="stok" label="Stok" width="90" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.stok > 5 ? 'success' : scope.row.stok > 0 ? 'warning' : 'danger'" size="small">
              {{ scope.row.stok }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="id_kategori" label="ID Kategori" width="110" align="center" />
        
        <el-table-column label="Aksi" width="180" align="center" :fixed="fixedAction">
          <template #default="scope">
            <div class="action-group">
              <el-button size="small" type="warning" plain :icon="Edit" @click="openEdit(scope.row)">
                Edit
              </el-button>
              <el-button size="small" type="danger" plain :icon="Delete" @click="hapus(scope.row.id_produk)">
                Hapus
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEditMode ? 'Edit Produk' : 'Tambah Produk Baru'" width="480px" :close-on-click-modal="false">
      <el-form :model="form" label-position="top">
        <el-form-item label="Nama Produk">
          <el-input v-model="form.nama_produk" placeholder="Contoh: Asus ROG Strix" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Harga (Rp)">
              <el-input-number v-model="form.harga" :min="0" :step="50000" style="width:100%" controls-position="right" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Stok">
              <el-input-number v-model="form.stok" :min="0" style="width:100%" controls-position="right" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="ID Kategori">
          <el-input-number v-model="form.id_kategori" :min="1" style="width:100%" controls-position="right" placeholder="Masukkan ID Kategori" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Batal</el-button>
        <el-button type="primary" :loading="isSaving" @click="simpan">
          {{ isEditMode ? 'Simpan Perubahan' : 'Tambahkan' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'

const BASE_URL = 'https://tugas8-auth-api.vercel.app'
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + localStorage.getItem('karcis_toko_raihan')
})

const produkList = ref([])
const isLoading = ref(false)
const isSaving = ref(false)
const dialogVisible = ref(false)
const isEditMode = ref(false)
const editId = ref(null)
const form = ref({ nama_produk: '', harga: 0, stok: 0, id_kategori: null })

const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)

const fetchData = async () => {
  isLoading.value = true
  try {
    const res = await fetch(`${BASE_URL}/api/produk`, { headers: getHeaders() })
    const data = await res.json()
    produkList.value = data.data || []
  } catch {
    ElMessage.error('Gagal memuat data produk!')
  } finally {
    isLoading.value = false
  }
}

const openTambah = () => {
  isEditMode.value = false
  form.value = { nama_produk: '', harga: 0, stok: 0, id_kategori: null }
  dialogVisible.value = true
}

const openEdit = (row) => {
  isEditMode.value = true
  editId.value = row.id_produk
  form.value = { nama_produk: row.nama_produk, harga: row.harga, stok: row.stok, id_kategori: row.id_kategori }
  dialogVisible.value = true
}

const simpan = async () => {
  if (!form.value.nama_produk.trim()) return ElMessage.warning('Nama produk wajib diisi!')
  if (!form.value.id_kategori) return ElMessage.warning('ID Kategori wajib diisi!')
  isSaving.value = true
  try {
    const url = isEditMode.value ? `${BASE_URL}/api/produk/${editId.value}` : `${BASE_URL}/api/produk`
    const res = await fetch(url, {
      method: isEditMode.value ? 'PUT' : 'POST',
      headers: getHeaders(),
      body: JSON.stringify(form.value)
    })
    const data = await res.json()
    if (res.ok) { ElMessage.success(data.pesan || 'Berhasil!'); dialogVisible.value = false; fetchData() }
    else ElMessage.error(data.error || 'Terjadi kesalahan')
  } catch {
    ElMessage.error('Gagal terhubung ke server!')
  } finally {
    isSaving.value = false
  }
}

const hapus = async (id) => {
  await ElMessageBox.confirm('Yakin ingin menghapus produk ini?', 'Konfirmasi Hapus', {
    confirmButtonText: 'Hapus', cancelButtonText: 'Batal', type: 'warning'
  })
  try {
    const res = await fetch(`${BASE_URL}/api/produk/${id}`, { method: 'DELETE', headers: getHeaders() })
    const data = await res.json()
    if (res.ok) { ElMessage.success(data.pesan); fetchData() }
    else ElMessage.error(data.error)
  } catch {
    ElMessage.error('Gagal menghapus!')
  }
}

onMounted(fetchData)

// Responsiveness: toggle fixed action column on narrow screens
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200)
const updateWidth = () => { windowWidth.value = window.innerWidth }
onMounted(() => { window.addEventListener('resize', updateWidth) })
onUnmounted(() => { window.removeEventListener('resize', updateWidth) })
const fixedAction = computed(() => windowWidth.value > 900 ? 'right' : false)
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { font-size: 20px; font-weight: 700; margin: 0 0 4px; color: #1e293b; }
.page-sub { font-size: 13px; color: #94a3b8; margin: 0; }
.table-card { border-radius: 12px; }
.add-button { font-weight: 600; letter-spacing: 0.3px; }

/* CSS Baru untuk merapikan tombol Aksi agar sejajar ke samping */
.action-group { 
  display: flex; 
  justify-content: center; 
  align-items: center;
  gap: 8px; 
}
</style>