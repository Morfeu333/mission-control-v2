import { useState, useCallback } from 'react'
import { BookOpen, FolderOpen, FileText, ExternalLink } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { oc } from '../lib/openclaw-api'
import { usePolling } from '../lib/usePolling'

const WORKSPACES = [
  {
    id: 'scraper',
    name: 'Scraper Agent',
    path: '/home/automatrix/.openclaw/workspace-scraper/memory/',
    description: 'Daily notes do agente de scraping Facebook',
    color: '#E85D1A',
  },
  {
    id: 'project-manager',
    name: 'Project Manager',
    path: '/home/automatrix/.openclaw/workspace-main/memory/',
    description: 'Notas do PM agent — Notion sync, leads processados',
    color: '#3B82F6',
  },
  {
    id: 'sdr',
    name: 'SDR Agent',
    path: '/home/automatrix/.openclaw/workspace-sdr/memory/',
    description: 'Daily notes do SDR — conversas FB, contatos capturados',
    color: '#8B5CF6',
  },
  {
    id: 'main',
    name: 'Main Agent',
    path: '/home/automatrix/.openclaw/workspace-main/memory/',
    description: 'Memory do agente principal (Memory Curator)',
    color: '#F59E0B',
  },
]

function today() {
  return new Date().toISOString().split('T')[0]
}

export default function Memory() {
  const [selectedWs, setSelectedWs] = useState<string | null>(null)
  const [sessionContent, setSessionContent] = useState<any>(null)

  const statusFetcher = useCallback(() => oc.status(), [])
  const sessionsFetcher = useCallback(() => oc.sessions(), [])

  const { data: ocStatus } = usePolling(statusFetcher, 30000)
  const { data: sessionsData } = usePolling(sessionsFetcher, 30000)

  const sessions: any[] = Array.isArray(sessionsData)
    ? sessionsData
    : (sessionsData as any)?.sessions ?? []

  const openSession = (s: any) => setSessionContent(s)

  return (
    <div>
      <PageHeader
        title="Memory"
        subtitle="Browser de memórias e notas diárias dos agentes"
      />

      {/* Workspace grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 28
      }}>
        {WORKSPACES.map((ws) => (
          <div
            key={ws.id}
            onClick={() => setSelectedWs(selectedWs === ws.id ? null : ws.id)}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 8, padding: 18, cursor: 'pointer',
              borderTop: `3px solid ${ws.color}`,
              transition: 'box-shadow 0.15s',
              boxShadow: selectedWs === ws.id ? '0 0 0 2px ' + ws.color + '44' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <FolderOpen size={18} color={ws.color} />
              <span style={{
                fontFamily: 'Georgia,serif', fontSize: 15, fontWeight: 'bold',
                color: 'var(--text-primary)'
              }}>{ws.name}</span>
            </div>
            <div style={{
              fontSize: 12, color: 'var(--text-muted)', fontFamily: 'system-ui',
              marginBottom: 10
            }}>
              {ws.description}
            </div>
            <div style={{
              fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace',
              background: 'var(--bg-secondary)', borderRadius: 4, padding: '4px 8px'
            }}>
              {ws.path}
            </div>
            {selectedWs === ws.id && (
              <div style={{
                marginTop: 12, padding: '10px', background: 'var(--bg-secondary)',
                borderRadius: 6, fontSize: 12, fontFamily: 'system-ui'
              }}>
                <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
                  Arquivos de hoje ({today()}):
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  color: 'var(--accent)', cursor: 'default'
                }}>
                  <FileText size={13} />
                  <span>{today()}.md</span>
                </div>
                <div style={{
                  marginTop: 8, fontSize: 11, color: 'var(--text-muted)',
                  fontStyle: 'italic'
                }}>
                  Para ler o conteúdo, acesse o arquivo diretamente no filesystem:
                  <br />
                  <code style={{
                    fontFamily: 'monospace', fontSize: 11,
                    background: '#E5E7EB', borderRadius: 3, padding: '1px 4px'
                  }}>
                    cat {ws.path}{today()}.md
                  </code>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* OpenClaw sessions */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8
      }}>
        <div style={{
          padding: '12px 16px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h3 style={{
            fontFamily: 'Georgia,serif', fontSize: 14, fontWeight: 'bold',
            color: 'var(--text-secondary)', margin: 0
          }}>
            OpenClaw Sessions
          </h3>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'system-ui' }}>
            {sessions.length} session{sessions.length !== 1 ? 's' : ''}
          </span>
        </div>

        {sessions.length === 0 ? (
          <div style={{
            padding: '24px', textAlign: 'center',
            color: 'var(--text-muted)', fontFamily: 'system-ui', fontSize: 13
          }}>
            <BookOpen size={32} color="var(--border-strong)" style={{ marginBottom: 8 }} />
            <div>
              {ocStatus ? 'Nenhuma sessão ativa.' : 'OpenClaw offline ou inacessível.'}
            </div>
          </div>
        ) : (
          <div style={{ padding: '8px 0' }}>
            {sessions.map((s: any, i: number) => {
              const key = s.key ?? s.sessionKey ?? s.id ?? `session-${i}`
              return (
                <div
                  key={key}
                  onClick={() => openSession(s)}
                  style={{
                    padding: '10px 16px', borderBottom: '1px solid var(--border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    cursor: 'pointer', transition: 'background 0.1s'
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                      {key}
                    </div>
                    {s.model && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'system-ui', marginTop: 2 }}>
                        {s.model}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {s.channel && (
                      <span style={{
                        fontSize: 11, background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)', borderRadius: 4,
                        padding: '2px 7px', fontFamily: 'system-ui', color: 'var(--text-muted)'
                      }}>{s.channel}</span>
                    )}
                    <ExternalLink size={12} color="var(--text-muted)" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Session detail modal */}
      {sessionContent && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          onClick={() => setSessionContent(null)}
        >
          <div
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 24, maxWidth: 540, width: '90%',
              maxHeight: '70vh', overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 16, margin: 0 }}>
                Session Details
              </h3>
              <button
                onClick={() => setSessionContent(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-muted)' }}
              >×</button>
            </div>
            <pre style={{
              fontSize: 11, fontFamily: 'monospace', background: 'var(--bg-secondary)',
              padding: 12, borderRadius: 6, overflow: 'auto', color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap', wordBreak: 'break-all'
            }}>
              {JSON.stringify(sessionContent, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
