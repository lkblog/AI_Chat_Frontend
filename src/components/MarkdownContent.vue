<template>
  <div class="markdown-body" v-html="renderedHtml"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
import type Token from 'markdown-it/lib/token.mjs'
import type Renderer from 'markdown-it/lib/renderer.mjs'
import type { RenderRule } from 'markdown-it/lib/renderer.mjs'

const props = defineProps<{
  content: string
}>()

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  typographer: true
})

const defaultLinkOpen: RenderRule =
  md.renderer.rules.link_open ||
  ((tokens: Token[], idx: number, options: any, _env: any, self: Renderer) =>
    self.renderToken(tokens, idx, options))

md.renderer.rules.link_open = (tokens: Token[], idx: number, options: any, _env: any, self: Renderer) => {
  const token = tokens[idx]
  if (!token) return defaultLinkOpen(tokens, idx, options, _env, self)

  const setAttr = (name: string, value: string) => {
    const attrs = token.attrs ?? (token.attrs = [])
    const attrIndex = attrs.findIndex((attr) => attr[0] === name)
    if (attrIndex >= 0 && attrs[attrIndex]) attrs[attrIndex][1] = value
    else attrs.push([name, value])
  }

  setAttr('target', '_blank')
  setAttr('rel', 'noopener noreferrer')
  return defaultLinkOpen(tokens, idx, options, _env, self)
}

const renderedHtml = computed(() => {
  const raw = md.render(props.content ?? '')
  return DOMPurify.sanitize(raw, {
    ADD_ATTR: ['target', 'rel']
  })
})
</script>

<style>
.markdown-body {
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}

.markdown-body > :first-child {
  margin-top: 0;
}

.markdown-body > :last-child {
  margin-bottom: 0;
}

.markdown-body p {
  margin: 0 0 0.75em;
}

.markdown-body ul,
.markdown-body ol {
  margin: 0 0 0.75em;
  padding-left: 1.25em;
}

.markdown-body li + li {
  margin-top: 0.25em;
}

.markdown-body blockquote {
  margin: 0 0 0.75em;
  padding: 0.25em 0.75em;
  border-left: 3px solid rgba(0, 0, 0, 0.15);
  color: rgba(0, 0, 0, 0.7);
}

.message.user .markdown-body blockquote {
  border-left-color: rgba(255, 255, 255, 0.5);
  color: rgba(255, 255, 255, 0.85);
}

.markdown-body code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 0.9em;
  padding: 0.15em 0.35em;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.06);
}

.message.user .markdown-body code {
  background: rgba(255, 255, 255, 0.18);
}

.markdown-body pre {
  margin: 0 0 0.75em;
  padding: 10px 12px;
  overflow: auto;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.06);
}

.message.user .markdown-body pre {
  background: rgba(255, 255, 255, 0.14);
}

.markdown-body pre code {
  padding: 0;
  background: transparent;
  font-size: 0.85em;
  white-space: pre;
  display: block;
}

.markdown-body a {
  color: #667eea;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.message.user .markdown-body a {
  color: rgba(255, 255, 255, 0.95);
}

.markdown-body hr {
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  margin: 0.75em 0;
}

.message.user .markdown-body hr {
  border-top-color: rgba(255, 255, 255, 0.35);
}

.markdown-body table {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 0.75em;
  font-size: 0.95em;
}

.markdown-body th,
.markdown-body td {
  border: 1px solid rgba(0, 0, 0, 0.12);
  padding: 6px 8px;
  vertical-align: top;
}

.message.user .markdown-body th,
.message.user .markdown-body td {
  border-color: rgba(255, 255, 255, 0.25);
}

.markdown-body img {
  max-width: 100%;
  height: auto;
}
</style>
