import axios, { type AxiosInstance, AxiosError } from 'axios'
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  CreateChatRequest,
  Chat,
  SendMessageRequest,
  SendMessageResponse,
  Message,
  ApiResponse,
  PaginatedResponse
} from '@/types'

// 创建 axios 实例
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一处理错误
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  // 注册
  register: (data: RegisterRequest) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', data),

  // 登录
  login: (data: LoginRequest) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data),

  // 获取当前用户
  getCurrentUser: () =>
    api.get<ApiResponse<any>>('/auth/me'),

  // 更新用户信息
  updateProfile: (data: UpdateProfileRequest) =>
    api.put<ApiResponse<any>>('/auth/profile', data),

  // 修改密码
  changePassword: (data: ChangePasswordRequest) =>
    api.put<ApiResponse<any>>('/auth/password', data)
}

// Chat API
type ChatApi = {
  createChat: (data: CreateChatRequest) => ReturnType<typeof api.post<ApiResponse<Chat>>>
  getChats: (page?: number, pageSize?: number) => ReturnType<typeof api.get<ApiResponse<PaginatedResponse<Chat>>>>
  getChatById: (id: number) => ReturnType<typeof api.get<ApiResponse<any>>>
  updateChat: (id: number, title: string) => ReturnType<typeof api.put<ApiResponse<Chat>>>
  deleteChat: (id: number) => ReturnType<typeof api.delete<ApiResponse<any>>>
  sendMessage: (id: number, data: SendMessageRequest) => ReturnType<typeof api.post<ApiResponse<SendMessageResponse>>>
  sendMessageStream: (id: number, data: SendMessageRequest, onChunk: (chunk: string) => void) => Promise<void>
  getMessages: (id: number, page?: number, pageSize?: number) => ReturnType<typeof api.get<ApiResponse<PaginatedResponse<Message>>>>
  polishMessage: (content: string) => ReturnType<typeof api.post<ApiResponse<{ original: string; polished: string }>>>
}

export const chatApi: ChatApi = {
  // 创建新对话
  createChat: (data: CreateChatRequest) =>
    api.post<ApiResponse<Chat>>('/chats', data),

  // 获取对话列表
  getChats: (page = 1, pageSize = 20) =>
    api.get<ApiResponse<PaginatedResponse<Chat>>>('/chats', {
      params: { page, pageSize }
    }),

  // 获取对话详情
  getChatById: (id: number) =>
    api.get<ApiResponse<any>>(`/chats/${id}`),

  // 更新对话
  updateChat: (id: number, title: string) =>
    api.put<ApiResponse<Chat>>(`/chats/${id}`, { title }),

  // 删除对话
  deleteChat: (id: number) =>
    api.delete<ApiResponse<any>>(`/chats/${id}`),

  // 发送消息
  sendMessage: (id: number, data: SendMessageRequest) =>
    api.post<ApiResponse<SendMessageResponse>>(`/chats/${id}/messages`, data),

  // 流式发送消息 (SSE)
  sendMessageStream: async (id: number, data: SendMessageRequest, onChunk: (chunk: string) => void) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/chats/${id}/messages/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error('请求失败')
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error('无法读取响应流')
    }

    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      
      // SSE 消息以 \n\n 分隔
      while (buffer.includes('\n\n')) {
        const index = buffer.indexOf('\n\n')
        const message = buffer.slice(0, index)
        buffer = buffer.slice(index + 2)
        
        // 解析 SSE 格式
        for (const line of message.split('\n')) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data && data !== '[DONE]') {
              onChunk(data)
            }
          }
        }
      }
    }
    
    // 处理剩余数据
    if (buffer.trim()) {
      for (const line of buffer.split('\n')) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()
          if (data && data !== '[DONE]') {
            onChunk(data)
          }
        }
      }
    }
  },

  // 获取消息列表
  getMessages: (id: number, page = 1, pageSize = 50) =>
    api.get<ApiResponse<PaginatedResponse<Message>>>(`/chats/${id}/messages`, {
      params: { page, pageSize }
    }),

  // 润色消息内容
  polishMessage: (content: string) =>
    api.post<ApiResponse<{ original: string; polished: string }>>('/chats/polish', { content })
}

export default api
