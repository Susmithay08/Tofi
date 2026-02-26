import { useEffect, useState } from 'react'
import api from '../api/client'
import { Activity, Clock, Wrench, TrendingUp, Zap, RefreshCw } from 'lucide-react'

const TOOL_COLORS = {
  calculator: '#d47c2f',
  execute_python_code: '#2db8a0',
  get_current_datetime: '#4f90d4',
  search_knowledge_base: '#b8621a',
  generate_json_schema: '#e8943a',
}

function StatCard({ label, value, icon, color, index }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--glass)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${hovered ? 'var(--accent-border)' : 'var(--glass-border)'}`,
        borderRadius: 14, padding: '16px 18px',
        boxShadow: hovered ? '0 6px 24px rgba(0,0,0,0.08)' : '0 2px 12px rgba(0,0,0,0.04)',
        animation: `fadeUp 0.4s ${index * 0.07}s both ease`,
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <span style={{
          width: 26, height: 26, borderRadius: 7,
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color,
        }}>{icon}</span>
        <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {label}
        </span>
      </div>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800,
        color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.03em',
      }}>
        {value ?? '—'}
      </div>
    </div>
  )
}

export default function TracesPage() {
  const [traces, setTraces] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rotating, setRotating] = useState(false)

  const load = async () => {
    setRotating(true)
    try {
      const [t, s] = await Promise.all([api.get('/traces/'), api.get('/traces/stats')])
      setTraces(t.data)
      setStats(s.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false); setTimeout(() => setRotating(false), 600) }
  }

  useEffect(() => { load(); const iv = setInterval(load, 10000); return () => clearInterval(iv) }, [])

  const maxDur = traces.length ? Math.max(...traces.map(t => parseFloat(t.duration_ms) || 0)) : 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '13px 24px',
        background: 'var(--glass)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--divider)',
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Trace <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Viewer</span>
        </div>
        <button onClick={load} style={{
          marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 12px', borderRadius: 20,
          fontSize: 11.5, fontWeight: 600, color: 'var(--accent)',
          background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
          transition: 'all 0.2s ease',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#d47c2f,#e8943a)'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent-bg)'; e.currentTarget.style.color = 'var(--accent)' }}
        >
          <RefreshCw size={11} style={{ transition: 'transform 0.6s', transform: rotating ? 'rotate(360deg)' : 'none' }} />
          Refresh
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
            <StatCard label="Total" value={stats.total_traces} icon={<Activity size={13} />} color="var(--accent)" index={0} />
            <StatCard label="Avg Duration" value={`${stats.avg_duration_ms}ms`} icon={<Clock size={13} />} color="#b8621a" index={1} />
            <StatCard label="Tool Calls" value={Object.values(stats.tool_usage || {}).reduce((a, b) => a + b, 0)} icon={<Wrench size={13} />} color="#e8943a" index={2} />
            <StatCard label="Recent" value={stats.recent_count} icon={<TrendingUp size={13} />} color="#2db8a0" index={3} />
          </div>
        )}

        {/* Tool usage */}
        {stats?.tool_usage && Object.keys(stats.tool_usage).length > 0 && (
          <div style={{
            background: 'var(--glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)', borderRadius: 14, padding: 18,
            marginBottom: 20, animation: 'fadeUp 0.4s 0.3s both ease',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
              Tool Usage
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {Object.entries(stats.tool_usage).sort((a, b) => b[1] - a[1]).map(([tool, count]) => {
                const max = Math.max(...Object.values(stats.tool_usage))
                const pct = (count / max) * 100
                const color = TOOL_COLORS[tool] || 'var(--accent)'
                return (
                  <div key={tool}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{tool.replace(/_/g, ' ')}</span>
                      <span style={{ fontSize: 12, color, fontWeight: 700 }}>{count}×</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--accent-bg)', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{
                        width: `${pct}%`, height: '100%',
                        background: `linear-gradient(90deg,${color}88,${color})`,
                        borderRadius: 10, transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Trace list */}
        <div style={{
          background: 'var(--glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)', borderRadius: 14, overflow: 'hidden',
          animation: 'fadeUp 0.4s 0.4s both ease',
        }}>
          <div style={{
            padding: '10px 18px', borderBottom: '1px solid var(--divider)',
            display: 'grid', gridTemplateColumns: '1fr 160px 110px 80px', gap: 12,
            fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.07em',
          }}>
            <span>Span</span><span>Tools Used</span><span>Duration</span><span>Time</span>
          </div>

          {loading && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Loading traces…</div>
          )}
          {!loading && traces.length === 0 && (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <Zap size={26} style={{ color: 'var(--accent-border)', margin: '0 auto 10px', display: 'block' }} />
              <div style={{ color: 'var(--text-secondary)', fontSize: 13.5, fontWeight: 500 }}>No traces yet</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>Start chatting to see agent traces appear here</div>
            </div>
          )}

          {traces.map((t, i) => {
            const dur = parseFloat(t.duration_ms) || 0
            const pct = (dur / maxDur) * 100
            const tools = t.metadata?.tools_used || []
            return (
              <div key={t.id}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                style={{
                  padding: '12px 18px',
                  borderBottom: i < traces.length - 1 ? '1px solid var(--divider)' : 'none',
                  display: 'grid', gridTemplateColumns: '1fr 160px 110px 80px', gap: 12,
                  alignItems: 'center', transition: 'background 0.15s ease',
                  animation: `fadeUp 0.3s ${Math.min(i * 0.03, 0.3)}s both ease`,
                }}
              >
                <div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-primary)', fontWeight: 500, marginBottom: 2 }}>{t.span_name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{t.conversation_id?.slice(0, 8)}…</div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {tools.length === 0 && <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>—</span>}
                  {tools.map((tool, j) => {
                    const c = TOOL_COLORS[tool] || 'var(--accent)'
                    return (
                      <span key={j} style={{
                        fontSize: 9.5, padding: '2px 7px',
                        background: `${c}14`, border: `1px solid ${c}28`,
                        borderRadius: 20, color: c, fontWeight: 600,
                      }}>
                        {tool.replace(/_/g, ' ')}
                      </span>
                    )
                  })}
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: dur > 3000 ? '#b8621a' : '#2db8a0', marginBottom: 3 }}>
                    {t.duration_ms}ms
                  </div>
                  <div style={{ height: 4, background: 'var(--accent-bg)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`, height: '100%',
                      background: dur > 3000 ? 'linear-gradient(90deg,#b8621a,#d47c2f)' : 'linear-gradient(90deg,#2db8a0,#7dd4c8)',
                      borderRadius: 10,
                    }} />
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {new Date(t.created_at).toLocaleTimeString()}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}