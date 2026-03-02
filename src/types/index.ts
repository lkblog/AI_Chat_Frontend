// 用户相关类型
export interface User {
  id: number
  username: string
  email: string
  avatar?: string
  created_at?: string
  updated_at?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface UpdateProfileRequest {
  avatar?: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

// 聊天相关类型
export interface Chat {
  id: number
  user_id: number
  title: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: number
  chat_id: number
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface CreateChatRequest {
  title?: string
}

export interface SendMessageRequest {
  content: string
}

export interface SendMessageResponse {
  userMessage: Message
  assistantMessage: Message
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

export interface PaginatedResponse<T = any> {
  list: T[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

// 路由类型
export interface RouteParams {
  id?: string
}
