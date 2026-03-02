import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginRequest, RegisterRequest, UpdateProfileRequest, ChangePasswordRequest } from '@/types'
import { authApi } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // Actions
  const initialize = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
    }
  }

  const login = async (credentials: LoginRequest) => {
    loading.value = true
    error.value = null
    try {
      const response = await authApi.login(credentials)
      const data = response.data
      if (data.success && data.data) {
        token.value = data.data.token
        user.value = data.data.user
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data.user))
        return true
      } else {
        error.value = data.message || '登录失败'
        return false
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '登录失败，请检查用户名和密码'
      return false
    } finally {
      loading.value = false
    }
  }

  const register = async (data: RegisterRequest) => {
    loading.value = true
    error.value = null
    try {
      const response = await authApi.register(data)
      const res = response.data
      if (res.success && res.data) {
        token.value = res.data.token
        user.value = res.data.user
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        return true
      } else {
        error.value = res.message || '注册失败'
        return false
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '注册失败，请稍后重试'
      return false
    } finally {
      loading.value = false
    }
  }

  const fetchCurrentUser = async () => {
    if (!token.value) return false
    try {
      const response = await authApi.getCurrentUser()
      const data = response.data
      if (data.success && data.data) {
        user.value = data.data
        localStorage.setItem('user', JSON.stringify(data.data))
        return true
      }
      return false
    } catch (err) {
      logout()
      return false
    }
  }

  const updateProfile = async (data: UpdateProfileRequest) => {
    loading.value = true
    error.value = null
    try {
      const response = await authApi.updateProfile(data)
      const res = response.data
      if (res.success && res.data) {
        user.value = res.data
        localStorage.setItem('user', JSON.stringify(res.data))
        return true
      } else {
        error.value = res.message || '更新失败'
        return false
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '更新失败'
      return false
    } finally {
      loading.value = false
    }
  }

  const changePassword = async (data: ChangePasswordRequest) => {
    loading.value = true
    error.value = null
    try {
      const response = await authApi.changePassword(data)
      const res = response.data
      if (res.success) {
        return true
      } else {
        error.value = res.message || '密码修改失败'
        return false
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '密码修改失败'
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // Initialize
  initialize()

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    fetchCurrentUser,
    updateProfile,
    changePassword,
    logout,
    initialize
  }
})
