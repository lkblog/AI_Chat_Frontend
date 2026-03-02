# chat-frontend（AI Chat 前端）

一个基于 Vue 3 + Vite + TypeScript 的聊天前端，包含登录/注册、会话管理、消息流式（SSE）渲染，以及对 Markdown 的安全渲染能力。

## 功能

- 用户系统：注册、登录、退出登录；路由守卫保护聊天页
- 会话管理：新建会话、会话列表、切换会话、删除会话
- 消息能力：
  - 发送消息并通过 SSE 流式追加 AI 回复
  - 新会话标题可随流式返回逐字更新
  - 输入内容支持“润色”一键优化
- Markdown 渲染：使用 markdown-it 渲染并通过 DOMPurify 净化后展示，链接强制新开页并添加安全 rel

## 技术栈

- Vue 3（Composition API / SFC）
- Vite
- TypeScript
- vue-router（页面路由与守卫）
- Pinia（状态管理：auth/chat）
- axios（REST 请求）+ fetch（SSE 流式）
- markdown-it + DOMPurify（安全 Markdown 渲染）

## 快速开始

### 1) 安装依赖

```bash
npm install
```

### 2) 配置后端地址（开发环境）

该项目默认将前端的 `/api` 代理到本地后端：

- 代理配置：`vite.config.ts` 的 `server.proxy['/api'].target`
- 默认值：`http://127.0.0.1:3000`

如你的后端不在该地址，请修改 target 后再启动开发服务器。

### 3) 启动开发服务器

```bash
npm run dev
```

Vite 默认端口为 `5173`。

### 4) 构建与预览

```bash
npm run build
npm run preview
```

## 项目结构

```
src/
  api/            # axios 实例、Auth/Chat API 封装（含 SSE 流式）
  components/     # 组件（MarkdownContent：Markdown 渲染与净化）
  router/         # 路由与路由守卫
  stores/         # Pinia：auth、chat
  types/          # TypeScript 类型定义
  views/          # 页面：Login / Register / Chat
  App.vue
  main.ts
```

## 页面与路由

- `/login`：登录（访客可访问）
- `/register`：注册（访客可访问）
- `/chat`：聊天页（需要登录）

路由守卫逻辑位于 `src/router/index.ts`，未登录访问 `/chat` 会跳转到登录页，并携带 redirect 参数。

## 与后端的接口约定（概览）

前端所有请求默认以 `/api` 作为前缀（开发时由 Vite 代理到后端），主要使用以下接口（以 `src/api/index.ts` 为准）：

- 认证：
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
  - `PUT /api/auth/profile`
  - `PUT /api/auth/password`
- 会话：
  - `POST /api/chats`
  - `GET /api/chats`
  - `GET /api/chats/:id`
  - `PUT /api/chats/:id`
  - `DELETE /api/chats/:id`
- 消息：
  - `GET /api/chats/:id/messages`
  - `POST /api/chats/:id/messages`
  - `POST /api/chats/:id/messages/stream`（SSE：逐段返回 data）
- 文本润色：
  - `POST /api/chats/polish`

认证方式：请求拦截器会从 `localStorage` 读取 `token`，并以 `Authorization: Bearer <token>` 发送；返回 401 时会清理本地登录状态并跳转到 `/login`。

## 安全说明（Markdown）

消息内容以 Markdown 形式渲染后通过 `v-html` 展示；为避免 XSS：

- markdown-it 配置 `html: false`，不允许原始 HTML
- DOMPurify 对渲染结果进行净化，仅额外允许 `target` 与 `rel` 属性
- 所有链接统一设置 `target="_blank"` 且 `rel="noopener noreferrer"`

相关实现位于 `src/components/MarkdownContent.vue`。
