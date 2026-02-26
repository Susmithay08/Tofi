import { useState } from 'react'
import { ChevronDown, ChevronRight, Terminal, CheckCircle2 } from 'lucide-react'

const TOOL_META = {
  calculator:           { color: '#e07a30', bg: 'rgba(224,122,48,0.08)',  label: 'Calculator' },
  execute_python_code:  { color: '#2db8a0', bg: 'rgba(45,184,160,0.08)', label: 'Python Exec' },
  get_current_datetime: { color: '#4f90d4', bg: 'rgba(79,144,212,0.08)', label: 'DateTime' },
  search_knowledge_base:{ color: '#7c5cbf', bg: 'rgba(124,92,191,0.08)', label: 'Knowledge Base' },
  generate_json_schema: { color: '#e8607a', bg: 'rgba(232,96,122,0.08)', label: 'JSON Schema' },
}

export default function ToolCallViewer({ toolCalls }) {
  const [expanded, setExpanded] = useState({})
  if (!toolCalls?.length) return null

  return (
    <div style={{ marginBottom: 10, display:'flex', flexDirection:'column', gap:6 }}>
      {toolCalls.map((tc, i) => {
        const meta = TOOL_META[tc.tool] || { color:'#7c5cbf', bg:'rgba(124,92,191,0.08)', label: tc.tool }
        const open = expanded[i]
        return (
          <div key={i} style={{
            borderRadius: 10,
            background: meta.bg,
            border: `1px solid ${meta.color}30`,
            overflow: 'hidden',
            transition: 'box-shadow 0.2s',
            boxShadow: open ? `0 4px 16px ${meta.color}18` : 'none',
          }}>
            <button
              onClick={() => setExpanded(s => ({ ...s, [i]: !s[i] }))}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                color: meta.color,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                transition: 'opacity 0.15s',
              }}
            >
              {open
                ? <ChevronDown size={12} style={{ flexShrink:0 }} />
                : <ChevronRight size={12} style={{ flexShrink:0 }} />}
              <Terminal size={11} style={{ flexShrink:0 }} />
              <span>{meta.label}</span>
              {tc.output && (
                <span style={{
                  marginLeft:'auto',
                  display:'flex',
                  alignItems:'center',
                  gap:3,
                  fontSize:10,
                  fontWeight:500,
                  color: meta.color,
                  opacity: 0.7,
                }}>
                  <CheckCircle2 size={10} /> done
                </span>
              )}
            </button>

            {open && (
              <div style={{ padding:'0 12px 10px', display:'flex', flexDirection:'column', gap:6 }}>
                <div>
                  <div style={{ fontSize:9.5, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4 }}>Input</div>
                  <pre style={{
                    fontSize: 11.5,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-secondary)',
                    background: 'rgba(255,255,255,0.6)',
                    padding: '8px 10px',
                    borderRadius: 8,
                    overflow: 'auto',
                    maxHeight: 100,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    border: '1px solid rgba(255,255,255,0.8)',
                  }}>
                    {JSON.stringify(tc.input, null, 2)}
                  </pre>
                </div>
                {tc.output && (
                  <div>
                    <div style={{ fontSize:9.5, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4 }}>Output</div>
                    <pre style={{
                      fontSize: 11.5,
                      fontFamily: 'var(--font-mono)',
                      color: meta.color,
                      background: 'rgba(255,255,255,0.6)',
                      padding: '8px 10px',
                      borderRadius: 8,
                      overflow: 'auto',
                      maxHeight: 160,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      border: '1px solid rgba(255,255,255,0.8)',
                    }}>
                      {tc.output}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
