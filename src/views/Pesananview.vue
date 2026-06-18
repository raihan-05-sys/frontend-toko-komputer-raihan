<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">Manajemen Pesanan</h2>
        <p class="page-sub">Data transaksi pesanan pelanggan (Checkout Otomatis)</p>
      </div>
      <el-button type="primary" :icon="Plus" class="add-button" @click="openTambah">
        Tambah Pesanan
      </el-button>
    </div>

    <el-card shadow="never" class="table-card">
      <el-table :data="pesananList" v-loading="isLoading" stripe style="width: 100%" empty-text="Belum ada data pesanan">
        <el-table-column type="index" label="No" width="60" align="center" />
        <el-table-column prop="id_pesanan" label="ID Pesanan" width="110" align="center" />
        <el-table-column prop="id_pelanggan" label="ID Pelanggan" width="120" align="center" />
        <el-table-column prop="tanggal_pesanan" label="Tanggal Pesanan" width="160" align="center">
          <template #default="scope">
            {{ formatTanggal(scope.row.tanggal_pesanan) }}
          </template>
        </el-table-column>
        <el-table-column prop="total_bayar" label="Total Bayar" min-width="160" align="right">
          <template #default="scope">
            <span class="total-text">{{ formatRupiah(scope.row.total_bayar) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="Aksi" width="260" align="center" :fixed="fixedAction">
          <template #default="scope">
            <div class="action-group">
              <el-button size="small" type="info" plain :icon="View" @click="goToDetail(scope.row.id_pesanan)">
                Detail
              </el-button>
              <el-button size="small" type="warning" plain :icon="Edit" @click="openEdit(scope.row)">
                Edit
              </el-button>
              <el-button size="small" type="danger" plain :icon="Delete" @click="hapus(scope.row.id_pesanan)">
                Hapus
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEditMode ? 'Edit Pesanan' : 'Tambah Pesanan Baru'" width="650px" :close-on-click-modal="false">
      <el-form :model="form" label-position="top">
        <el-row :gutter="15">
          <el-col :span="12">
            <el-form-item label="ID Pelanggan">
              <el-input-number v-model="form.id_pelanggan" :min="1" style="width:100%" controls-position="right" placeholder="ID Pelanggan" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Tanggal Pesanan">
              <el-date-picker v-model="form.tanggal_pesanan" type="date" placeholder="Pilih tanggal" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <template v-if="!isEditMode">
          <el-divider content-position="left" style="margin-top: 0;">Keranjang Belanja</el-divider>
          
          <el-row :gutter="10" style="margin-bottom: 15px;">
            <el-col :span="9">
              <el-select 
                v-model="itemBaru.id_produk" 
                placeholder="Pilih Produk..." 
                style="width: 100%" 
                filterable 
                @change="setHargaOtomatis"
              >
                <el-option
                  v-for="item in produkList"
                  :key="item.id_produk"
                  :label="item.nama_produk"
                  :value="item.id_produk"
                />
              </el-select>
            </el-col>
            
            <el-col :span="6">
              <el-input-number v-model="itemBaru.harga_satuan" placeholder="Harga Satuan" :min="0" :step="10000" style="width: 100%" controls-position="right" />
            </el-col>
            <el-col :span="5">
              <el-input-number v-model="itemBaru.jumlah" placeholder="Qty" :min="1" style="width: 100%" controls-position="right" />
            </el-col>
            <el-col :span="4">
              <el-button type="success" style="width: 100%" @click="tambahKeKeranjang">Tambah</el-button>
            </el-col>
          </el-row>

          <el-table :data="form.keranjang" border style="width: 100%; margin-bottom: 15px;" empty-text="Keranjang masih kosong">
            <el-table-column prop="nama_produk" label="Nama Produk" min-width="150" />
            <el-table-column prop="jumlah" label="Qty" width="70" align="center" />
            <el-table-column prop="subtotal" label="Subtotal (Rp)" align="right">
              <template #default="scope">
                {{ formatRupiah(scope.row.subtotal) }}
              </template>
            </el-table-column>
            <el-table-column label="X" width="50" align="center">
              <template #default="scope">
                <el-button type="danger" size="small" @click="hapusDariKeranjang(scope.$index)">X</el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>

        <el-form-item label="Total Bayar Keseluruhan (Rp)">
          <el-input-number v-model="form.total_bayar" :min="0" style="width:100%" controls-position="right" disabled />
          <small class="text-muted" style="margin-top: 5px; line-height: 1.2;" v-if="!isEditMode">
            *Dihitung otomatis dari total keranjang belanja.
          </small>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">Batal</el-button>
          <el-button type="primary" :loading="isSaving" @click="simpan">Simpan Transaksi</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, View } from '@element-plus/icons-vue' 

const router = useRouter()
const BASE_URL = 'https://tugas8-auth-api.vercel.app'
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + localStorage.getItem('karcis_toko_raihan')
})

const pesananList = ref([])
const isLoading = ref(false)
const isSaving = ref(false)
const dialogVisible = ref(false)
const isEditMode = ref(false)
const editId = ref(null)

const produkList = ref([])

const form = ref({ 
  id_pelanggan: null, 
  tanggal_pesanan: '', 
  total_bayar: 0,
  keranjang: []
})

const itemBaru = ref({
  id_produk: null,
  harga_satuan: 0,
  jumlah: 1
})

const fetchProduk = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/produk`, { headers: getHeaders() })
    const data = await res.json()
    if (res.ok) {
      produkList.value = data.data || []
    }
  } catch (err) {
    console.error('Gagal mengambil data produk')
  }
}

const setHargaOtomatis = (id_terpilih) => {
  const produk = produkList.value.find(p => p.id_produk === id_terpilih)
  if (produk) {
    itemBaru.value.harga_satuan = produk.harga
  }
}

const tambahKeKeranjang = () => {
  if (!itemBaru.value.id_produk || itemBaru.value.harga_satuan <= 0) {
    ElMessage.warning('Produk dan Harga wajib diisi dengan benar!')
    return
  }

  const subtotal = itemBaru.value.harga_satuan * itemBaru.value.jumlah
  
  const produkTerpilih = produkList.value.find(p => p.id_produk === itemBaru.value.id_produk)
  const namaProduk = produkTerpilih ? produkTerpilih.nama_produk : 'Produk Tidak Dikenal'

  form.value.keranjang.push({
    id_produk: itemBaru.value.id_produk,
    nama_produk: namaProduk, 
    jumlah: itemBaru.value.jumlah,
    subtotal: subtotal
  })

  form.value.total_bayar += subtotal

  itemBaru.value.id_produk = null
  itemBaru.value.harga_satuan = 0
  itemBaru.value.jumlah = 1
}

const hapusDariKeranjang = (index) => {
  form.value.total_bayar -= form.value.keranjang[index].subtotal
  form.value.keranjang.splice(index, 1)
}

const goToDetail = (id) => {
  router.push({ name: 'DetailPesanan', query: { id_pesanan: id } })
}

const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
const formatTanggal = (val) => val ? new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'

const fetchData = async () => {
  isLoading.value = true
  try {
    const res = await fetch(`${BASE_URL}/api/pesanan`, { headers: getHeaders() })
    const data = await res.json()
    if (res.ok) {
      pesananList.value = data.data || []
    }
  } catch {
    ElMessage.error('Gagal memuat data pesanan!')
  } finally {
    isLoading.value = false
  }
}

const openTambah = () => {
  isEditMode.value = false
  
  // Ambil tanggal hari ini secara otomatis
  const hariIni = new Date().toISOString().split('T')[0]
  
  form.value = { 
    id_pelanggan: null, 
    tanggal_pesanan: hariIni, // Tanggal akan langsung terisi otomatis
    total_bayar: 0, 
    keranjang: [] 
  }
  itemBaru.value = { id_produk: null, harga_satuan: 0, jumlah: 1 }
  dialogVisible.value = true
}

const openEdit = (row) => {
  isEditMode.value = true
  editId.value = row.id_pesanan
  const tgl = row.tanggal_pesanan ? row.tanggal_pesanan.substring(0, 10) : ''
  form.value = { id_pelanggan: row.id_pelanggan, tanggal_pesanan: tgl, total_bayar: row.total_bayar, keranjang: [] }
  dialogVisible.value = true
}

const simpan = async () => {
  if (!form.value.id_pelanggan) return ElMessage.warning('ID Pelanggan wajib diisi!')
  
  // Validasi agar tanggal tidak boleh kosong
  if (!form.value.tanggal_pesanan) return ElMessage.warning('Tanggal Pesanan wajib diisi!')
  
  if (!isEditMode.value && form.value.keranjang.length === 0) {
    return ElMessage.warning('Keranjang belanja tidak boleh kosong!')
  }

  isSaving.value = true
  try {
    const url = isEditMode.value ? `${BASE_URL}/api/pesanan/${editId.value}` : `${BASE_URL}/api/pesanan`
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
  await ElMessageBox.confirm('Yakin ingin menghapus pesanan beserta isinya?', 'Konfirmasi Hapus', { confirmButtonText: 'Hapus', cancelButtonText: 'Batal', type: 'warning' })
  try {
    const res = await fetch(`${BASE_URL}/api/pesanan/${id}`, { method: 'DELETE', headers: getHeaders() })
    const data = await res.json()
    if (res.ok) { ElMessage.success(data.pesan); fetchData() }
    else ElMessage.error(data.error)
  } catch {
    ElMessage.error('Gagal menghapus!')
  }
}

onMounted(() => {
  fetchData()
  fetchProduk()
})

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
.page-sub { font-size: 13px; color: #94a3b8; margin: 0; }
.table-card { border-radius: 12px; }
.total-text { font-weight: 600; color: #059669; }
.add-button { font-weight: 600; letter-spacing: 0.3px; }
.action-group { 
  display: flex; 
  justify-content: center; 
  align-items: center;
  gap: 8px; 
}
</style>