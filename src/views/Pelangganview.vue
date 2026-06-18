<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">Manajemen Pelanggan</h2>
        <p class="page-sub">Data pelanggan terdaftar di toko</p>
      </div>
      <el-button type="primary" :icon="Plus" class="add-button" @click="openTambah">
        Tambah Pelanggan
      </el-button>
    </div>

    <el-card shadow="never" class="table-card">
      <el-table :data="pelangganList" v-loading="isLoading" stripe style="width: 100%" empty-text="Belum ada data pelanggan">
        <el-table-column type="index" label="No" width="60" align="center" />
        <el-table-column prop="id_pelanggan" label="ID" width="70" align="center" />
        <el-table-column prop="nama" label="Nama" min-width="160" />
        <el-table-column prop="email" label="Email" min-width="200" />
        <el-table-column prop="telepon" label="Telepon" width="150" />
        <el-table-column prop="alamat" label="Alamat" min-width="200" show-overflow-tooltip />
        
        <el-table-column label="Aksi" width="180" align="center" :fixed="fixedAction">
          <template #default="scope">
            <div class="action-group">
              <el-button size="small" type="warning" plain :icon="Edit" @click="openEdit(scope.row)">
                Edit
              </el-button>
              <el-button size="small" type="danger" plain :icon="Delete" @click="hapus(scope.row.id_pelanggan)">
                Hapus
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEditMode ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'" width="500px" :close-on-click-modal="false">
      <el-form :model="form" label-position="top">
        <el-form-item label="Nama Lengkap">
          <el-input v-model="form.nama" placeholder="Contoh: Raihan Prasetyo" />
        </el-form-item>
        <el-form-item label="Email">
          <el-input v-model="form.email" type="email" placeholder="Contoh: raihan@email.com" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Telepon">
              <el-input v-model="form.telepon" placeholder="08xxxxxxxxxx" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Alamat">
              <el-input v-model="form.alamat" placeholder="Kota / Alamat" />
            </el-form-item>
          </el-col>
        </el-row>
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

const pelangganList = ref([])
const isLoading = ref(false)
const isSaving = ref(false)
const dialogVisible = ref(false)
const isEditMode = ref(false)
const editId = ref(null)
const form = ref({ nama: '', email: '', telepon: '', alamat: '' })

const fetchData = async () => {
  isLoading.value = true
  try {
    const res = await fetch(`${BASE_URL}/api/pelanggan`, { headers: getHeaders() })
    const data = await res.json()
    pelangganList.value = data.data || []
  } catch {
    ElMessage.error('Gagal memuat data pelanggan!')
  } finally {
    isLoading.value = false
  }
}

const openTambah = () => {
  isEditMode.value = false
  form.value = { nama: '', email: '', telepon: '', alamat: '' }
  dialogVisible.value = true
}

const openEdit = (row) => {
  isEditMode.value = true
  editId.value = row.id_pelanggan
  form.value = { nama: row.nama, email: row.email, telepon: row.telepon, alamat: row.alamat }
  dialogVisible.value = true
}

const simpan = async () => {
  if (!form.value.nama.trim()) return ElMessage.warning('Nama wajib diisi!')
  isSaving.value = true
  try {
    const url = isEditMode.value ? `${BASE_URL}/api/pelanggan/${editId.value}` : `${BASE_URL}/api/pelanggan`
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
  await ElMessageBox.confirm('Yakin ingin menghapus pelanggan ini?', 'Konfirmasi Hapus', {
    confirmButtonText: 'Hapus', cancelButtonText: 'Batal', type: 'warning'
  })
  try {
    const res = await fetch(`${BASE_URL}/api/pelanggan/${id}`, { method: 'DELETE', headers: getHeaders() })
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
/* CSS Dirapikan dari gandaan sebelumnya */
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

/* CSS Baru untuk merapikan tombol Aksi agar sejajar ke samping */
.action-group { 
  display: flex; 
  justify-content: center; 
  align-items: center;
  gap: 8px; 
}
</style>