import { create } from 'zustand'
import api from '../api/client'

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConvId: null,
  messages: [],
  loading: false,
  error: null,

  loadConversations: async () => {
    try {
      const { data } = await api.get('/chat/conversations')
      set({ conversations: data })
    } catch (e) {
      set({ error: e.message })
    }
  },

  loadMessages: async (convId) => {
    set({ activeConvId: convId, messages: [], loading: true })
    try {
      const { data } = await api.get(`/chat/conversations/${convId}/messages`)
      set({ messages: data, loading: false })
    } catch (e) {
      set({ error: e.message, loading: false })
    }
  },

  sendMessage: async (text) => {
    const { activeConvId } = get()
    const userMsg = { id: Date.now(), role: 'user', content: text, tool_calls: [] }
    set(s => ({ messages: [...s.messages, userMsg], loading: true }))
    try {
      const { data } = await api.post('/chat/', {
        message: text,
        conversation_id: activeConvId || undefined,
      })
      const assistantMsg = {
        id: data.message_id,
        role: 'assistant',
        content: data.content,
        tool_calls: data.tool_calls,
        duration_ms: data.duration_ms,
      }
      set(s => ({
        messages: [...s.messages, assistantMsg],
        loading: false,
        activeConvId: data.conversation_id,
      }))
      // Refresh conversation list
      get().loadConversations()
      return data
    } catch (e) {
      set(s => ({
        messages: s.messages.filter(m => m.id !== userMsg.id),
        loading: false,
        error: e.message,
      }))
    }
  },

  newConversation: () => {
    set({ activeConvId: null, messages: [] })
  },
}))
