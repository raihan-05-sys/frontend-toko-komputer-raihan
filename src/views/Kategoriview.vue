<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">Manajemen Kategori</h2>
        <p class="page-sub">Kelola semua kategori produk toko</p>
      </div>
      <el-button type="primary" :icon="Plus" class="add-button" @click="openTambah">
        Tambah Kategori
      </el-button>
    </div>

    <el-card shadow="never" class="table-card">
      <el-table
        :data="kategoriList"
        v-loading="isLoading"
        stripe
        style="width: 100%"
        empty-text="Belum ada data kategori"
      >
        <el-table-column type="index" label="No" width="60" align="center" />
        <el-table-column prop="id_kategori" label="ID" width="80" align="center" />
        <el-table-column prop="nama_kategori" label="Nama Kategori" min-width="200" />
        
        <el-table-column label="Aksi" width="180" align="center" :fixed="fixedAction">
          <template #default="scope">
            <div class="action-group">
              <el-button size="small" type="warning" plain :icon="Edit" @click="openEdit(scope.row)">
                Edit
              </el-button>
              <el-button size="small" type="danger" plain :icon="Delete" @click="hapus(scope.row.id_kategori)">
                Hapus
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEditMode ? 'Edit Kategori' : 'Tambah Kategori Baru'" width="420px" :close-on-click-modal="false">
      <el-form :model="form" label-position="top">
        <el-form-item label="Nama Kategori">
          <el-input v-model="form.nama_kategori" placeholder="Contoh: Laptop Gaming" />
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

const kategoriList = ref([])
const isLoading = ref(false)
const isSaving = ref(false)
const dialogVisible = ref(false)
const isEditMode = ref(false)
const form = ref({ nama_kategori: '' })
const editId = ref(null)

const fetchData = async () => {
  isLoading.value = true
  try {
    const res = await fetch(`${BASE_URL}/api/kategori`, { headers: getHeaders() })
    const data = await res.json()
    kategoriList.value = data.data || []
  } catch {
    ElMessage.error('Gagal memuat data kategori!')
  } finally {
    isLoading.value = false
  }
}

const openTambah = () => {
  isEditMode.value = false
  form.value = { nama_kategori: '' }
  dialogVisible.value = true
}

const openEdit = (row) => {
  isEditMode.value = true
  editId.value = row.id_kategori
  form.value = { nama_kategori: row.nama_kategori }
  dialogVisible.value = true
}

const simpan = async () => {
  if (!form.value.nama_kategori.trim()) return ElMessage.warning('Nama kategori wajib diisi!')
  isSaving.value = true
  try {
    const url = isEditMode.value
      ? `${BASE_URL}/api/kategori/${editId.value}`
      : `${BASE_URL}/api/kategori`
    const res = await fetch(url, {
      method: isEditMode.value ? 'PUT' : 'POST',
      headers: getHeaders(),
      body: JSON.stringify(form.value)
    })
    const data = await res.json()
    if (res.ok) {
      ElMessage.success(data.pesan || 'Berhasil!')
      dialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(data.error || 'Terjadi kesalahan')
    }
  } catch {
    ElMessage.error('Gagal terhubung ke server!')
  } finally {
    isSaving.value = false
  }
}

const hapus = async (id) => {
  await ElMessageBox.confirm('Yakin ingin menghapus kategori ini?', 'Konfirmasi Hapus', {
    confirmButtonText: 'Hapus', cancelButtonText: 'Batal', type: 'warning'
  })
  try {
    const res = await fetch(`${BASE_URL}/api/kategori/${id}`, {
      method: 'DELETE', headers: getHeaders()
    })
    const data = await res.json()
    if (res.ok) { ElMessage.success(data.pesan); fetchData() }
    else ElMessage.error(data.error)
  } catch {
    ElMessage.error('Gagal menghapus!')
  }
}

onMounted(fetchData)

// Responsiveness: toggle fixed action colum on narrow screens
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200)
const updateWidth = () => { windowWidth.value = window.innerWidth }
onMounted(() => { window.addEventListener('resize', updateWidth) })
onUnmounted(() => { window.removeEventListener('resize', updateWidth) })
const fixedAction = computed(() => windowWidth.value > 900 ? 'right' : false)
</script>

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
.page-sub { font-size: 13px; color: #64748b; margin: 0; }
.table-card { border-radius: 14px; }
.add-button { font-weight: 600; letter-spacing: 0.3px; }

/* CSS Baru untuk merapikan tombol Aksi */
.action-group { 
  display: flex; 
  justify-content: center; 
  align-items: center;
  gap: 8px; 
}
</style>