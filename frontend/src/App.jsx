import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useChatStore } from './store/chatStore'
import { useTheme, ThemeProvider } from './context/ThemeContext'
import ChatPage from './pages/ChatPage'
import TracesPage from './pages/TracesPage'
import {
  MessageSquare, Activity, Plus, Flame, Search,
  Settings2, ChevronLeft, ChevronRight, X, Check, Palette
} from 'lucide-react'
import './index.css'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </ThemeProvider>
  )
}

function AppShell() {
  const { conversations, activeConvId, loadMessages, newConversation, loadConversations } = useChatStore()
  const { theme, setTheme, themes } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [view, setView] = useState('recents') // 'recents' | 'all'
  const navigate = useNavigate()
  const searchRef = useRef(null)

  useEffect(() => { loadConversations() }, [])
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  const filtered = conversations.filter(c =>
    !searchQuery || c.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const displayed = view === 'recents' ? filtered.slice(0, 8) : filtered

  const handleNew = () => {
    newConversation()
    navigate('/')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', position: 'relative', background: 'var(--bg)' }}>
      {/* Ambient orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {[
          { w: 600, h: 600, top: '-100px', left: '-100px', dur: '18s', color: 'var(--orb1)' },
          { w: 500, h: 500, bottom: '-80px', right: '10%', dur: '22s', rev: true, color: 'var(--orb2)' },
          { w: 350, h: 350, top: '40%', right: '-50px', dur: '16s', delay: '4s', color: 'var(--orb3)' },
        ].map((o, i) => (
          <div key={i} style={{
            position: 'absolute', width: o.w, height: o.h, borderRadius: '50%',
            background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
            top: o.top, left: o.left, bottom: o.bottom, right: o.right,
            animation: `orbDrift ${o.dur} ease-in-out infinite ${o.delay || ''} ${o.rev ? 'reverse' : ''}`,
          }} />
        ))}
      </div>

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 260 : 0,
        minWidth: sidebarOpen ? 260 : 0,
        flexShrink: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--sidebar-bg)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        borderRight: `1px solid var(--divider)`,
        zIndex: 20,
        transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1), min-width 0.28s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: sidebarOpen ? '2px 0 20px rgba(0,0,0,0.06)' : 'none',
      }}>
        <div style={{ width: 260, display: 'flex', flexDirection: 'column', height: '100%' }}>

          {/* Logo row */}
          <div style={{ padding: '18px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: 'linear-gradient(135deg,#d47c2f,#e8943a,#f5c06a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 3px 12px rgba(212,124,47,0.40)',
                flexShrink: 0,
              }}>
                <Flame size={15} color="#fff" />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                Tofi
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} style={{
              width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', transition: 'all 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <ChevronLeft size={14} />
            </button>
          </div>

          {/* Search */}
          {searchOpen ? (
            <div style={{ padding: '0 12px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: 7,
                background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
                borderRadius: 10, padding: '7px 10px',
              }}>
                <Search size={12} color="var(--text-muted)" />
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search chats…"
                  style={{ flex: 1, fontSize: 12.5, background: 'transparent', color: 'var(--text-primary)' }}
                />
              </div>
              <button onClick={() => { setSearchOpen(false); setSearchQuery('') }} style={{
                color: 'var(--text-muted)', padding: 4, borderRadius: 6,
              }}>
                <X size={13} />
              </button>
            </div>
          ) : null}

          {/* Nav items */}
          <div style={{ padding: '0 10px', marginBottom: 6 }}>
            {[
              { icon: <Plus size={14} />, label: 'New chat', action: handleNew },
              { icon: <Search size={14} />, label: 'Search', action: () => setSearchOpen(s => !s) },
              { icon: <Settings2 size={14} />, label: 'Customize', action: () => setCustomizeOpen(s => !s) },
            ].map(({ icon, label, action }) => (
              <button key={label} onClick={action} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 10px', borderRadius: 9, marginBottom: 1,
                color: 'var(--text-secondary)', fontSize: 13, fontWeight: 400,
                transition: 'all 0.15s ease', textAlign: 'left',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-bg)'; e.currentTarget.style.color = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          {/* Customize panel */}
          {customizeOpen && (
            <div style={{
              margin: '0 10px 10px', padding: 14,
              background: 'var(--glass)', border: '1px solid var(--glass-border)',
              borderRadius: 12, animation: 'fadeIn 0.2s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <Palette size={13} color="var(--accent)" />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Theme</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.entries(themes).map(([key, t]) => (
                  <button key={key} onClick={() => setTheme(key)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 10px', borderRadius: 8,
                    background: theme === key ? 'var(--accent-bg)' : 'transparent',
                    border: `1px solid ${theme === key ? 'var(--accent-border)' : 'transparent'}`,
                    color: theme === key ? 'var(--accent)' : 'var(--text-secondary)',
                    fontSize: 13, fontWeight: theme === key ? 600 : 400,
                    transition: 'all 0.15s',
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        width: 14, height: 14, borderRadius: '50%',
                        background: key === 'amber' ? 'linear-gradient(135deg,#d47c2f,#f5c06a)'
                          : key === 'dark' ? 'linear-gradient(135deg,#1a1a1a,#444)'
                            : 'linear-gradient(135deg,#f8f8f6,#ddd)',
                        border: '1px solid rgba(0,0,0,0.15)',
                        flexShrink: 0,
                      }} />
                      {t.name}
                    </span>
                    {theme === key && <Check size={12} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Nav links */}
          <div style={{ padding: '0 10px', marginBottom: 8 }}>
            {[
              { to: '/', icon: <MessageSquare size={13} />, label: 'Chats' },
              { to: '/traces', icon: <Activity size={13} />, label: 'Traces' },
            ].map(({ to, icon, label }) => (
              <NavLink key={to} to={to} end style={{ textDecoration: 'none' }}>
                {({ isActive }) => (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '8px 10px', borderRadius: 9, marginBottom: 1,
                    background: isActive ? 'var(--accent-bg)' : 'transparent',
                    border: `1px solid ${isActive ? 'var(--accent-border)' : 'transparent'}`,
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 400, fontSize: 13,
                    transition: 'all 0.15s ease',
                  }}>
                    {icon} {label}
                  </div>
                )}
              </NavLink>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--divider)', margin: '0 14px 10px' }} />

          {/* Recents / All chats toggle */}
          <div style={{ padding: '0 14px', marginBottom: 8, display: 'flex', gap: 6 }}>
            {['recents', 'all'].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                background: view === v ? 'var(--accent-bg)' : 'transparent',
                border: `1px solid ${view === v ? 'var(--accent-border)' : 'transparent'}`,
                color: view === v ? 'var(--accent)' : 'var(--text-muted)',
                textTransform: 'capitalize', transition: 'all 0.15s',
              }}>
                {v === 'recents' ? 'Recents' : 'All Chats'}
              </button>
            ))}
          </div>

          {/* Conversation list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px' }}>
            {displayed.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '8px 6px', fontStyle: 'italic' }}>
                {searchQuery ? 'No results' : 'No conversations yet'}
              </div>
            )}
            {displayed.map(c => (
              <button key={c.id} onClick={() => { loadMessages(c.id); navigate('/') }} style={{
                width: '100%', textAlign: 'left',
                padding: '8px 10px', borderRadius: 8, marginBottom: 2,
                background: activeConvId === c.id ? 'var(--accent-bg)' : 'transparent',
                border: `1px solid ${activeConvId === c.id ? 'var(--accent-border)' : 'transparent'}`,
                color: activeConvId === c.id ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: 12.5, fontWeight: activeConvId === c.id ? 500 : 400,
                transition: 'all 0.15s', overflow: 'hidden',
                whiteSpace: 'nowrap', textOverflow: 'ellipsis',
              }}
                onMouseEnter={e => { if (activeConvId !== c.id) e.currentTarget.style.background = 'var(--accent-bg)' }}
                onMouseLeave={e => { if (activeConvId !== c.id) e.currentTarget.style.background = 'transparent' }}
              >
                {c.title || 'Untitled'}
              </button>
            ))}
          </div>

          {/* Bottom user section */}
          <div style={{
            padding: '10px 14px',
            borderTop: '1px solid var(--divider)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg,#d47c2f,#f5c06a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#fff',
              }}>G</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>Guest</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Free plan</div>
              </div>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#2db8a0', boxShadow: '0 0 5px #2db8a0' }} />
              Online
            </div>
          </div>
        </div>
      </aside>

      {/* Sidebar toggle button (when closed) */}
      {!sidebarOpen && (
        <button onClick={() => setSidebarOpen(true)} style={{
          position: 'fixed', left: 12, top: 14, zIndex: 30,
          width: 32, height: 32, borderRadius: 9,
          background: 'var(--glass)', border: '1px solid var(--glass-border)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-secondary)', boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          transition: 'all 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ChevronRight size={14} />
        </button>
      )}

      {/* Main */}
      <main style={{ flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <Routes>
          <Route path="/" element={<ChatPage sidebarOpen={sidebarOpen} />} />
          <Route path="/traces" element={<TracesPage />} />
        </Routes>
      </main>
    </div>
  )
}