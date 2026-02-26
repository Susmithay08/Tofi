import { useState } from 'react'
import { Flame, User, ChevronDown, ChevronUp } from 'lucide-react'

const TOOL_COLORS = {
  calculator: '#d47c2f',
  execute_python_code: '#2db8a0',
  get_current_datetime: '#4f90d4',
  search_knowledge_base: '#b8621a',
  generate_json_schema: '#e8943a',
}

export default function MessageBubble({ message, index }) {
  const isUser = message.role === 'user'
  const [expandedTools, setExpandedTools] = useState({})
  const toggleTool = (id) => setExpandedTools(p => ({ ...p, [id]: !p[id] }))

  return (
    <div style={{
      display: 'flex', gap: 12,
      padding: '10px 24px',
      flexDirection: isUser ? 'row-reverse' : 'row',
      animation: `fadeUp 0.3s ${Math.min(index * 0.03, 0.2)}s both ease`,
    }}>
      {/* Avatar */}
      <div style={{
        width: 30, height: 30, borderRadius: 9, flexShrink: 0,
        background: isUser
          ? 'var(--user-bubble)'
          : 'linear-gradient(135deg,#d47c2f,#e8943a)',
        border: isUser ? '1px solid var(--user-border)' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: isUser ? 'none' : '0 3px 10px rgba(212,124,47,0.28)',
        marginTop: 2,
      }}>
        {isUser
          ? <User size={13} color="var(--accent)" />
          : <Flame size={13} color="#fff" />
        }
      </div>

      <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {/* Bubble */}
        <div style={{
          background: isUser ? 'var(--user-bubble)' : 'var(--msg-bubble)',
          backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          border: isUser ? '1px solid var(--user-border)' : '1px solid var(--msg-border)',
          borderRadius: isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
          padding: '11px 15px',
          fontSize: 13.5, lineHeight: 1.65,
          color: 'var(--text-primary)',
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>
          {message.content}
        </div>

        {/* Tool calls */}
        {message.tool_calls?.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {message.tool_calls.map((tc, i) => {
              const color = TOOL_COLORS[tc.tool] || '#d47c2f'
              const expanded = expandedTools[`${index}-${i}`]
              return (
                <div key={i} style={{
                  background: 'var(--glass)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${color}28`,
                  borderRadius: 10, overflow: 'hidden',
                }}>
                  <button onClick={() => toggleTool(`${index}-${i}`)} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 7,
                    padding: '6px 10px', cursor: 'pointer', background: 'transparent',
                  }}>
                    <span style={{
                      fontSize: 9.5, padding: '2px 7px',
                      background: `${color}14`, border: `1px solid ${color}28`,
                      borderRadius: 20, color, fontWeight: 700,
                    }}>
                      {tc.tool.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', flex: 1, textAlign: 'left', fontFamily: 'var(--font-mono)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {JSON.stringify(tc.input).slice(0, 48)}…
                    </span>
                    {expanded ? <ChevronUp size={10} color="var(--text-muted)" /> : <ChevronDown size={10} color="var(--text-muted)" />}
                  </button>
                  {expanded && (
                    <div style={{ padding: '0 10px 9px', borderTop: `1px solid ${color}14` }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', margin: '7px 0 3px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Input</div>
                      <pre style={{
                        fontSize: 10.5, fontFamily: 'var(--font-mono)',
                        color: 'var(--text-secondary)',
                        background: `${color}08`, borderRadius: 6, padding: '5px 8px',
                        overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                      }}>{JSON.stringify(tc.input, null, 2)}</pre>
                      {tc.output && <>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', margin: '7px 0 3px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Output</div>
                        <pre style={{
                          fontSize: 10.5, fontFamily: 'var(--font-mono)',
                          color: 'var(--text-secondary)',
                          background: `${color}08`, borderRadius: 6, padding: '5px 8px',
                          overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                        }}>{tc.output}</pre>
                      </>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Duration */}
        {message.duration_ms && (
          <div style={{ fontSize: 10.5, color: 'var(--text-muted)', textAlign: isUser ? 'right' : 'left' }}>
            {message.duration_ms}ms
          </div>
        )}
      </div>
    </div>
  )
}