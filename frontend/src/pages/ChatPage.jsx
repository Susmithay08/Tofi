import { useEffect, useRef, useState } from 'react'
import { useChatStore } from '../store/chatStore'
import MessageBubble from '../components/MessageBubble'
import { Send, Share2, Flame, Code2, Clock, Database, Braces, Zap, BookOpen, Cpu } from 'lucide-react'

const SUGGESTIONS = [
  { icon: <Zap size={12} />, text: 'Calculate the integral of x² from 0 to 10' },
  { icon: <Code2 size={12} />, text: 'Write Python to find prime numbers up to 100' },
  { icon: <Database size={12} />, text: 'What is LangGraph and how does it work?' },

]

function getGreeting() {
  const h = new Date().getHours()
  const name = 'there'
  if (h < 12) return `Good morning, ${name}`
  if (h < 17) return `Good afternoon, ${name}`
  if (h < 21) return `Good evening, ${name}`
  return `Hey, ${name}`
}

export default function ChatPage({ sidebarOpen }) {
  const { messages, loading, sendMessage, activeConvId, conversations } = useChatStore()
  const [input, setInput] = useState('')
  const [focused, setFocused] = useState(false)
  const [copied, setCopied] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const activeConv = conversations.find(c => c.id === activeConvId)
  const chatTitle = activeConv?.title || null

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto'
    await sendMessage(text)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const canSend = input.trim() && !loading

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top bar - only when chatting */}
      {messages.length > 0 && (
        <div style={{
          padding: sidebarOpen ? '12px 24px' : '12px 24px 12px 56px',
          background: 'var(--glass)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--divider)',
          display: 'flex', alignItems: 'center', gap: 10,
          transition: 'padding 0.28s ease',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600,
            color: 'var(--text-primary)', letterSpacing: '-0.01em',
            flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
          }}>
            {chatTitle || 'New conversation'}
          </div>
          <button onClick={handleShare} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 14px', borderRadius: 20,
            background: copied ? 'rgba(45,184,160,0.12)' : 'var(--accent-bg)',
            border: `1px solid ${copied ? 'rgba(45,184,160,0.3)' : 'var(--accent-border)'}`,
            color: copied ? '#2db8a0' : 'var(--accent)',
            fontSize: 12, fontWeight: 600,
            transition: 'all 0.2s ease',
          }}>
            <Share2 size={11} />
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
      )}

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {messages.length === 0 ? (
          /* Welcome screen */
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '100%',
            padding: sidebarOpen ? '40px 40px 0' : '40px 40px 0 72px',
            gap: 0,
            animation: 'scaleIn 0.4s ease both',
            transition: 'padding 0.28s ease',
          }}>
            <div style={{ textAlign: 'center', maxWidth: 560, marginBottom: 40 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: 'linear-gradient(135deg,#d47c2f,#e8943a,#f5c06a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 6px 24px rgba(212,124,47,0.35)',
              }}>
                <Flame size={22} color="#fff" />
              </div>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700,
                color: 'var(--text-primary)', letterSpacing: '-0.03em',
                lineHeight: 1.15, marginBottom: 10,
              }}>
                {getGreeting()}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.6 }}>
                How can Tofi help you today?
              </p>
            </div>
          </div>
        ) : (
          <div style={{ padding: '16px 0', maxWidth: 760, margin: '0 auto', width: '100%' }}>
            {messages.map((msg, i) => (
              <MessageBubble key={msg.id || i} message={msg} index={i} />
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ maxWidth: 760, margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', gap: 12, padding: '12px 24px', alignItems: 'flex-start', animation: 'fadeIn 0.2s ease' }}>
              <div style={{
                width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                background: 'linear-gradient(135deg,#d47c2f,#e8943a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 3px 10px rgba(212,124,47,0.30)',
              }}>
                <Flame size={13} color="#fff" />
              </div>
              <div style={{
                background: 'var(--msg-bubble)', backdropFilter: 'blur(12px)',
                border: '1px solid var(--msg-border)',
                borderRadius: '4px 14px 14px 14px',
                padding: '11px 16px', display: 'flex', gap: 5, alignItems: 'center',
              }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)',
                    display: 'inline-block', animation: `bounce 1.2s ${i * 0.16}s ease-in-out infinite`, opacity: 0.6,
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} style={{ height: 8 }} />
      </div>

      {/* Input area */}
      <div style={{
        padding: messages.length === 0
          ? (sidebarOpen ? '0 40px 32px' : '0 40px 32px 72px')
          : '12px 20px 20px',
        maxWidth: messages.length === 0 ? 660 : '100%',
        width: '100%',
        margin: messages.length === 0 ? '0 auto' : '0',
        transition: 'padding 0.28s ease',
      }}>
        {/* Input box */}
        <div style={{
          background: focused ? 'var(--glass)' : 'var(--input-bg)',
          border: `1.5px solid ${focused ? 'var(--accent)' : 'var(--input-border)'}`,
          borderRadius: 16,
          padding: '12px 12px 10px 16px',
          boxShadow: focused
            ? '0 0 0 3px var(--accent-bg), 0 4px 20px rgba(0,0,0,0.06)'
            : '0 2px 12px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Ask Tofi anything…"
            rows={1}
            style={{
              width: '100%', resize: 'none', fontSize: 14.5, lineHeight: 1.6,
              color: 'var(--text-primary)', background: 'transparent',
              maxHeight: 140, display: 'block', marginBottom: 8,
            }}
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px'
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Tofi-groq-LLAMMA
            </div>
            <button
              onClick={handleSend}
              disabled={!canSend}
              style={{
                width: 34, height: 34, borderRadius: 10,
                background: canSend ? 'linear-gradient(135deg,#d47c2f,#e8943a)' : 'var(--accent-bg)',
                color: canSend ? '#fff' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                transform: canSend ? 'scale(1)' : 'scale(0.95)',
                boxShadow: canSend ? '0 3px 10px rgba(212,124,47,0.30)' : 'none',
                cursor: canSend ? 'pointer' : 'not-allowed',
              }}
              onMouseEnter={e => canSend && (e.currentTarget.style.transform = 'scale(1.08) rotate(-4deg)')}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Send size={14} />
            </button>
          </div>
        </div>

        {/* Suggestion pills - only on welcome screen */}
        {messages.length === 0 && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 14,
            justifyContent: 'center',
          }}>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => { setInput(s.text); inputRef.current?.focus() }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 13px', borderRadius: 20,
                  background: 'var(--glass)', border: '1px solid var(--glass-border)',
                  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                  color: 'var(--text-secondary)', fontSize: 12.5,
                  transition: 'all 0.18s ease',
                  animation: `fadeUp 0.4s ${i * 0.05}s both ease`,
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-bg)'; e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.color = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--glass)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              >
                <span style={{ color: 'var(--accent)', opacity: 0.8 }}>{s.icon}</span>
                {s.text}
              </button>
            ))}
          </div>
        )}

        {messages.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>
            Enter to send · Shift+Enter for new line
          </div>
        )}
      </div>
    </div>
  )
}