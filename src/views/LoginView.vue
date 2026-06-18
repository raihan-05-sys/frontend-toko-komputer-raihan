<template>
  <div class="login-container">
    <!-- Animated background grid -->
    <div class="bg-grid"></div>
    <!-- Glowing orbs -->
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>

    <div class="login-wrapper">
      <!-- Left branding panel -->
      <div class="brand-panel">
        <div class="brand-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="4" y="10" width="40" height="28" rx="4" stroke="#6ee7f7" stroke-width="2.5"/>
            <path d="M16 38v4M32 38v4M10 42h28" stroke="#6ee7f7" stroke-width="2.5" stroke-linecap="round"/>
            <rect x="10" y="16" width="10" height="7" rx="1.5" fill="#6ee7f7" opacity="0.3"/>
            <rect x="28" y="16" width="10" height="7" rx="1.5" fill="#6ee7f7" opacity="0.3"/>
            <rect x="10" y="27" width="28" height="3" rx="1.5" fill="#6ee7f7" opacity="0.2"/>
          </svg>
        </div>
        <h1 class="brand-title">Toko Komputer</h1>
        <p class="brand-sub">Admin Dashboard</p>
        <div class="brand-divider"></div>
        <p class="brand-desc">Kelola inventori, pelanggan, dan transaksi dari satu panel terpadu.</p>
      </div>

      <!-- Right form panel -->
      <div class="form-panel">
        <div class="form-header">
          <h2>Selamat Datang</h2>
          <p>Masuk ke akun administrator Anda</p>
        </div>

        <el-form @submit.prevent="handleLogin" label-position="top" class="login-form">
          <el-form-item label="Username">
            <el-input
              v-model="username"
              placeholder="Masukkan username"
              size="large"
              :prefix-icon="UserIcon"
            />
          </el-form-item>

          <el-form-item label="Password">
            <el-input
              v-model="password"
              type="password"
              placeholder="Masukkan password"
              size="large"
              show-password
              :prefix-icon="LockIcon"
            />
          </el-form-item>

          <el-button
            class="submit-btn"
            type="primary"
            native-type="submit"
            :loading="isLoading"
            size="large"
          >
            <span v-if="!isLoading">Masuk ke Dashboard →</span>
            <span v-else>Memverifikasi...</span>
          </el-button>
        </el-form>

        <p class="form-footer">Sistem Manajemen Toko © 2025</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, h } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const username = ref('')
const password = ref('')
const isLoading = ref(false)

// Inline SVG icons for el-input prefix
const UserIcon = { render: () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }), h('circle', { cx: 12, cy: 7, r: 4 })]) }
const LockIcon = { render: () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('rect', { x: 3, y: 11, width: 18, height: 11, rx: 2, ry: 2 }), h('path', { d: 'M7 11V7a5 5 0 0 1 10 0v4' })]) }

const handleLogin = async () => {
  if (!username.value || !password.value) {
    ElMessage.warning('Username dan Password wajib diisi!')
    return
  }

  isLoading.value = true

  try {
    const response = await fetch('https://tugas8-auth-api.vercel.app/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    })

    const data = await response.json()

    if (response.ok) {
      ElMessage.success('Login Berhasil!')
      localStorage.setItem('karcis_toko_raihan', data.token)
      router.push('/dashboard')
    } else {
      ElMessage.error(data.pesan || 'Username atau Password salah!')
    }
  } catch (error) {
    ElMessage.error('Server API mati! Nyalakan Node.js dulu.')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* ── Base reset & font ── */
* { box-sizing: border-box; }

.login-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #0a0e1a;
  overflow: hidden;
  font-family: 'Inter', system-ui, sans-serif;
}

/* ── Animated grid background ── */
.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(110, 231, 247, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(110, 231, 247, 0.04) 1px, transparent 1px);
  background-size: 40px 40px;
  animation: gridDrift 20s linear infinite;
}
@keyframes gridDrift {
  0%   { transform: translateY(0); }
  100% { transform: translateY(40px); }
}

/* ── Glowing orbs ── */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.18;
  animation: pulse 8s ease-in-out infinite alternate;
}
.orb-1 {
  width: 500px; height: 500px;
  background: #6ee7f7;
  top: -150px; left: -150px;
}
.orb-2 {
  width: 400px; height: 400px;
  background: #818cf8;
  bottom: -120px; right: -100px;
  animation-delay: -4s;
}
@keyframes pulse {
  0%   { opacity: 0.14; transform: scale(1); }
  100% { opacity: 0.22; transform: scale(1.08); }
}

/* ── Main wrapper card ── */
.login-wrapper {
  position: relative;
  z-index: 10;
  display: flex;
  width: 860px;
  max-width: 95vw;
  min-height: 480px;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(110, 231, 247, 0.12);
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Left: Brand panel ── */
.brand-panel {
  width: 340px;
  flex-shrink: 0;
  background: linear-gradient(145deg, #0f172a 0%, #1e1b4b 100%);
  padding: 48px 36px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-right: 1px solid rgba(110, 231, 247, 0.1);
}
.brand-icon {
  width: 72px; height: 72px;
  background: rgba(110, 231, 247, 0.08);
  border: 1px solid rgba(110, 231, 247, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}
.brand-title {
  font-size: 22px;
  font-weight: 700;
  color: #f0f9ff;
  margin: 0 0 4px;
  letter-spacing: -0.3px;
}
.brand-sub {
  font-size: 13px;
  color: #6ee7f7;
  margin: 0;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  font-weight: 500;
}
.brand-divider {
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, #6ee7f7, transparent);
  margin: 28px 0;
}
.brand-desc {
  font-size: 14px;
  color: #94a3b8;
  line-height: 1.7;
  margin: 0;
}

/* ── Right: Form panel ── */
.form-panel {
  flex: 1;
  background: #0d1117;
  padding: 48px 44px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.form-header {
  margin-bottom: 32px;
}
.form-header h2 {
  font-size: 26px;
  font-weight: 700;
  color: #f0f9ff;
  margin: 0 0 6px;
  letter-spacing: -0.4px;
}
.form-header p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

/* ── Element Plus overrides ── */
.login-form :deep(.el-form-item__label) {
  color: #94a3b8;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.3px;
  padding-bottom: 6px;
}
.login-form :deep(.el-input__wrapper) {
  background: #161b2e;
  border: 1px solid #1e2a40;
  border-radius: 10px;
  box-shadow: none !important;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.login-form :deep(.el-input__wrapper:hover) {
  border-color: rgba(110, 231, 247, 0.4);
}
.login-form :deep(.el-input__wrapper.is-focus) {
  border-color: #6ee7f7;
  box-shadow: 0 0 0 3px rgba(110, 231, 247, 0.1) !important;
}
.login-form :deep(.el-input__inner) {
  color: #e2e8f0;
  font-size: 14px;
}
.login-form :deep(.el-input__inner::placeholder) {
  color: #334155;
}
.login-form :deep(.el-input__prefix-inner svg) {
  color: #4b5563;
}

/* ── Submit button ── */
.submit-btn {
  width: 100%;
  height: 46px;
  margin-top: 8px;
  background: linear-gradient(135deg, #0ea5e9, #6ee7f7);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #0a0e1a;
  letter-spacing: 0.3px;
  transition: opacity 0.2s, transform 0.15s;
}
.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}
.submit-btn:active {
  transform: translateY(0);
}

.form-footer {
  margin-top: 28px;
  font-size: 12px;
  color: #1e293b;
  text-align: center;
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .brand-panel { display: none; }
  .form-panel { padding: 40px 28px; }
  .login-wrapper { min-height: unset; }
}
</style>