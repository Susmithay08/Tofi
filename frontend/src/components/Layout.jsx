import { Outlet, NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { MessageSquare, Activity, Plus, Sparkles, Clock } from 'lucide-react'
import { useChatStore } from '../store/chatStore'
import { formatDistanceToNow } from 'date-fns'

export default function Layout() {
  const { conversations, activeConvId, loadConversations, loadMessages, newConversation } = useChatStore()
  const [hoveredConv, setHoveredConv] = useState(null)
  const [newBtnHover, setNewBtnHover] = useState(false)

  useEffect(() => { loadConversations() }, [])

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: 268,
        background: 'rgba(255,255,255,0.60)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        borderRight: '1px solid rgba(255,255,255,0.85)',
        boxShadow: '2px 0 24px rgba(124,92,191,0.06)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        animation: 'fadeIn 0.4s ease',
      }}>
        {/* Logo */}
        <div style={{
          padding: '22px 20px 18px',
          borderBottom: '1px solid rgba(124,92,191,0.10)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: 'var(--grad-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(124,92,191,0.35)',
            animation: 'pulseGlow 3s ease-in-out infinite',
          }}>
            <Sparkles size={18} color="#fff" />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}>
              Agent<span style={{ color: 'var(--accent)' }}>OS</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em', fontWeight: 500 }}>
              AI PLATFORM
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '14px 12px', display:'flex', flexDirection:'column', gap:4, borderBottom:'1px solid rgba(124,92,191,0.08)' }}>
          {[
            { to: '/', end: true, icon: <MessageSquare size={15} />, label: 'Chat' },
            { to: '/traces', icon: <Activity size={15} />, label: 'Traces' },
          ].map(({ to, end, icon, label }) => (
            <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '9px 12px',
              borderRadius: 10,
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-bg)' : 'transparent',
              border: `1px solid ${isActive ? 'var(--accent-border)' : 'transparent'}`,
              fontSize: 13.5,
              fontWeight: isActive ? 600 : 400,
              textDecoration: 'none',
              transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
              boxShadow: isActive ? '0 2px 12px rgba(124,92,191,0.12)' : 'none',
            })}>
              {icon} {label}
            </NavLink>
          ))}
        </nav>

        {/* Conversations */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'14px 12px', gap:4, overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
            <span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, letterSpacing:'0.07em', textTransform:'uppercase' }}>
              History
            </span>
            <button
              onMouseEnter={() => setNewBtnHover(true)}
              onMouseLeave={() => setNewBtnHover(false)}
              onClick={newConversation}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 11.5,
                fontWeight: 600,
                background: newBtnHover ? 'var(--grad-primary)' : 'var(--accent-bg)',
                color: newBtnHover ? '#fff' : 'var(--accent)',
                border: '1px solid var(--accent-border)',
                transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                transform: newBtnHover ? 'scale(1.05)' : 'scale(1)',
                boxShadow: newBtnHover ? '0 4px 14px rgba(124,92,191,0.3)' : 'none',
              }}
            >
              <Plus size={11} /> New
            </button>
          </div>

          <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:3 }}>
            {conversations.length === 0 && (
              <div style={{ padding:'20px 10px', textAlign:'center', color:'var(--text-muted)', fontSize:12 }}>
                No conversations yet
              </div>
            )}
            {conversations.map((c, i) => {
              const active = c.id === activeConvId
              const hovered = hoveredConv === c.id
              return (
                <div
                  key={c.id}
                  onClick={() => loadMessages(c.id)}
                  onMouseEnter={() => setHoveredConv(c.id)}
                  onMouseLeave={() => setHoveredConv(null)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    background: active ? 'var(--glass-strong)' : hovered ? 'rgba(255,255,255,0.5)' : 'transparent',
                    border: `1px solid ${active ? 'var(--accent-border)' : hovered ? 'rgba(255,255,255,0.7)' : 'transparent'}`,
                    boxShadow: active ? '0 2px 16px rgba(124,92,191,0.10)' : 'none',
                    transition: 'all 0.2s ease',
                    animation: `fadeUp 0.35s ${i * 0.04}s both ease`,
                  }}
                >
                  <div style={{ fontSize:12.5, color: active ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: active ? 500 : 400, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {c.title || 'New chat'}
                  </div>
                  <div style={{ fontSize:10.5, color:'var(--text-muted)', marginTop:2, display:'flex', alignItems:'center', gap:3 }}>
                    <Clock size={9} />
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(124,92,191,0.08)',
          fontSize: 10.5,
          color: 'var(--text-muted)',
          textAlign: 'center',
        }}>
          Groq · LLaMA3-70B · LangGraph
        </div>
      </aside>

      <main style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <Outlet />
      </main>
    </div>
  )
}
