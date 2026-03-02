import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Chat, Message, CreateChatRequest, SendMessageRequest } from '@/types'
import { chatApi } from '@/api'

export const useChatStore = defineStore('chat', () => {
  // State
  const chats = ref<Chat[]>([])
  const currentChat = ref<Chat | null>(null)
  const messages = ref<Message[]>([])
  const loading = ref(false)
  const sending = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const hasChats = computed(() => chats.value.length > 0)

  // Actions
  const fetchChats = async (page = 1, pageSize = 20) => {
    loading.value = true
    error.value = null
    try {
      const response = await chatApi.getChats(page, pageSize)
      const data = response.data
      if (data.success) {
        chats.value = data.data?.list || []
        return true
      } else {
        error.value = data.message || '获取对话列表失败'
        return false
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '获取对话列表失败'
      return false
    } finally {
      loading.value = false
    }
  }

  const createChat = async (data: CreateChatRequest = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await chatApi.createChat(data)
      const res = response.data
      if (res.success && res.data) {
        chats.value.unshift(res.data)
        currentChat.value = res.data
        messages.value = []
        return res.data
      } else {
        error.value = res.message || '创建对话失败'
        return null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '创建对话失败'
      return null
    } finally {
      loading.value = false
    }
  }

  const selectChat = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      const [chatResponse, messagesResponse] = await Promise.all([
        chatApi.getChatById(id),
        chatApi.getMessages(id)
      ])

      const chatData = chatResponse.data
      const messagesData = messagesResponse.data

      if (chatData.success && chatData.data) {
        currentChat.value = chatData.data
        messages.value = messagesData.data?.list || []
        return true
      } else {
        error.value = chatData.message || '获取对话详情失败'
        return false
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '获取对话详情失败'
      return false
    } finally {
      loading.value = false
    }
  }

  const updateChat = async (id: number, title: string) => {
    try {
      const response = await chatApi.updateChat(id, title)
      const data = response.data
      if (data.success && data.data) {
        const index = chats.value.findIndex(c => c.id === id)
        if (index !== -1) {
          chats.value[index] = data.data
        }
        if (currentChat.value?.id === id) {
          currentChat.value = data.data
        }
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || '更新对话失败'
      return false
    }
  }

  const deleteChat = async (id: number) => {
    try {
      const response = await chatApi.deleteChat(id)
      const data = response.data
      if (data.success) {
        chats.value = chats.value.filter(c => c.id !== id)
        if (currentChat.value?.id === id) {
          currentChat.value = null
          messages.value = []
        }
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || '删除对话失败'
      return false
    }
  }

  const sendMessage = async (content: string) => {
    if (!currentChat.value) return null

    sending.value = true
    error.value = null

    // 标记是否是新对话（用于判断是否需要流式接收标题）
    const isNewChat = !currentChat.value.title || currentChat.value.title === '新对话'

    // 添加用户消息到本地
    const tempUserMessage: Message = {
      id: Date.now(),
      chat_id: currentChat.value.id,
      role: 'user',
      content,
      created_at: new Date().toISOString()
    }
    messages.value.push(tempUserMessage)

    // 创建临时的 AI 消息用于流式显示
    const tempAssistantMessage: Message = {
      id: Date.now() + 1,
      chat_id: currentChat.value.id,
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString()
    }
    messages.value.push(tempAssistantMessage)

    try {
      await chatApi.sendMessageStream(
        currentChat.value.id,
        { content } as SendMessageRequest,
        (chunk: string) => {
          try {
            // 解析 SSE 返回的 JSON 数据
            const data = JSON.parse(chunk)

            // 检查是否包含 title（第一次对话时返回）- 逐字追加
            if (data.title !== undefined && isNewChat && currentChat.value) {
              const titleChunk = data.title
              const chatId = currentChat.value.id
              // 逐字追加更新当前对话标题
              currentChat.value.title = (currentChat.value.title || '') + titleChunk
              // 逐字追加更新对话列表中的标题
              const chatIndex = chats.value.findIndex(c => c.id === chatId)
              const targetChat = chats.value[chatIndex]
              if (targetChat) {
                targetChat.title = (targetChat.title || '') + titleChunk
              }
              return
            }

            // 提取 delta 或 content 字段
            const text = data.delta || data.content || ''
            // 使用数组索引更新以确保响应式
            const index = messages.value.length - 1
            const lastMessage = messages.value[index]
            if (lastMessage) {
              messages.value[index] = {
                ...lastMessage,
                content: lastMessage.content + text
              }
            }
          } catch (e) {
            // 如果不是 JSON，直接使用
            const index = messages.value.length - 1
            const lastMessage = messages.value[index]
            if (lastMessage) {
              messages.value[index] = {
                ...lastMessage,
                content: lastMessage.content + chunk
              }
            }
          }
        }
      )
      return tempAssistantMessage
    } catch (err: any) {
      // 移除临时消息
      messages.value.pop()
      messages.value.pop()
      error.value = err.response?.data?.message || '发送消息失败'
      return null
    } finally {
      sending.value = false
    }
  }

  const clearCurrentChat = () => {
    currentChat.value = null
    messages.value = []
  }

  return {
    chats,
    currentChat,
    messages,
    loading,
    sending,
    error,
    hasChats,
    fetchChats,
    createChat,
    selectChat,
    updateChat,
    deleteChat,
    sendMessage,
    clearCurrentChat
  }
})
