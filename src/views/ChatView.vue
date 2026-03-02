<template>
  <div class="chat-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>AI Chat</h2>
        <button class="new-chat-btn" @click="createNewChat" title="新建对话">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      <div class="chat-list">
        <div
          v-for="chat in chatStore.chats"
          :key="chat.id"
          class="chat-item"
          :class="{ active: chatStore.currentChat?.id === chat.id }"
          @click="selectChat(chat.id)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span class="chat-title">{{ chat.title || '新对话' }}</span>
          <button class="delete-btn" @click.stop="deleteChatItem(chat.id)" title="删除对话">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">
            {{ authStore.user?.username?.charAt(0).toUpperCase() }}
          </div>
          <span class="username">{{ authStore.user?.username }}</span>
        </div>
        <button class="logout-btn" @click="handleLogout" title="退出登录">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </aside>

    <!-- 聊天区域 -->
    <main class="chat-main">
      <template v-if="chatStore.currentChat">
        <!-- 聊天标题 -->
        <div class="chat-header">
          <h3>{{ chatStore.currentChat.title || '新对话' }}</h3>
        </div>

        <!-- 消息列表 -->
        <div class="messages-container" ref="messagesContainer">
          <div v-if="chatStore.messages.length === 0" class="empty-messages">
            <div class="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <p>开始一段新对话吧</p>
          </div>

          <div
            v-for="(message, index) in chatStore.messages"
            :key="index"
            class="message"
            :class="message.role"
          >
            <div class="message-avatar">
              <template v-if="message.role === 'assistant'">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path>
                  <circle cx="12" cy="12" r="4"></circle>
                </svg>
              </template>
              <template v-else>
                {{ authStore.user?.username?.charAt(0).toUpperCase() }}
              </template>
            </div>
            <div class="message-content">
              <div class="message-text">{{ message.content }}</div>
            </div>
          </div>

          <div v-if="chatStore.sending" class="message assistant">
            <div class="message-avatar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path>
                <circle cx="12" cy="12" r="4"></circle>
              </svg>
            </div>
            <div class="message-content">
              <div class="message-text typing">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-container">
          <form @submit.prevent="sendMessage" class="input-form">
            <input
              v-model="inputMessage"
              type="text"
              placeholder="发送消息..."
              :disabled="chatStore.sending"
            />
            <button type="submit" :disabled="!inputMessage.trim() || chatStore.sending">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      </template>

      <template v-else>
        <div class="no-chat-selected">
          <div class="welcome-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <h2>欢迎使用 AI Chat</h2>
          <p>选择一个对话或开始新的对话</p>
          <button class="start-chat-btn" @click="createNewChat">
            开始新对话
          </button>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'

const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore()

const inputMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

// 自动滚动到最新消息
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 监听消息变化自动滚动
watch(() => chatStore.messages.length, scrollToBottom)

// 初始化
onMounted(async () => {
  await chatStore.fetchChats()
  scrollToBottom()
})

// 创建新对话
const createNewChat = async () => {
  await chatStore.createChat({ title: '新对话' })
  scrollToBottom()
}

// 选择对话
const selectChat = async (id: number) => {
  await chatStore.selectChat(id)
  scrollToBottom()
}

// 删除对话
const deleteChatItem = async (id: number) => {
  if (confirm('确定要删除这个对话吗？')) {
    await chatStore.deleteChat(id)
  }
}

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || chatStore.sending) return
  const message = inputMessage.value.trim()
  inputMessage.value = ''
  await chatStore.sendMessage(message)
  scrollToBottom()
}

// 退出登录
const handleLogout = () => {
  authStore.logout()
  chatStore.clearCurrentChat()
  router.push('/login')
}
</script>

<style scoped>
.chat-layout {
  display: flex;
  height: 100vh;
  background: #f8f9fa;
}

/* 侧边栏 */
.sidebar {
  width: 260px;
  background: #fff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e0e0e0;
}

.sidebar-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.new-chat-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s;
}

.new-chat-btn:hover {
  opacity: 0.9;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.chat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  color: #555;
}

.chat-item:hover {
  background: #f5f5f5;
}

.chat-item.active {
  background: #f0f0ff;
  color: #667eea;
}

.chat-item .chat-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.delete-btn {
  opacity: 0;
  border: none;
  background: transparent;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.chat-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: #e74c3c;
  background: #fde8e8;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
}

.username {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.logout-btn {
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #f5f5f5;
  color: #e74c3c;
}

/* 主聊天区域 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.chat-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.empty-messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

.message {
  display: flex;
  gap: 12px;
  max-width: 80%;
}

.message.user {
  flex-direction: row-reverse;
  align-self: flex-end;
}

.message.assistant {
  align-self: flex-start;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.message.assistant .message-avatar {
  background: #f0f0f0;
  color: #666;
}

.message-content {
  background: #f5f5f5;
  border-radius: 12px;
  padding: 12px 16px;
}

.message.user .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message-text {
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.typing {
  display: flex;
  gap: 4px;
}

.typing .dot {
  width: 6px;
  height: 6px;
  background: #999;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.message.user .typing .dot {
  background: rgba(255, 255, 255, 0.7);
}

.typing .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-6px);
  }
}

/* 输入区域 */
.input-container {
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
}

.input-form {
  display: flex;
  gap: 12px;
  background: #f5f5f5;
  border-radius: 12px;
  padding: 8px;
}

.input-form input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 12px;
  font-size: 14px;
  outline: none;
}

.input-form button {
  width: 44px;
  height: 44px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s;
}

.input-form button:hover:not(:disabled) {
  opacity: 0.9;
}

.input-form button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 无对话选中 */
.no-chat-selected {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
}

.welcome-icon {
  margin-bottom: 24px;
  color: #ddd;
}

.no-chat-selected h2 {
  font-size: 24px;
  font-weight: 500;
  color: #333;
  margin: 0 0 8px;
}

.no-chat-selected p {
  font-size: 14px;
  margin: 0 0 24px;
}

.start-chat-btn {
  padding: 14px 32px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.3s;
}

.start-chat-btn:hover {
  opacity: 0.9;
}
</style>
