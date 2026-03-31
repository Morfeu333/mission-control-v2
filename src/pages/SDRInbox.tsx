import { useState, useCallback } from 'react'
import { MessageSquare, Circle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { convexApi } from '../lib/convex-api'
import { usePolling } from '../lib/usePolling'

function timeAgo(ts: number) {
  if (!ts) return '—'
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function DraftBox({
  title,
  text,
  bgColor,
  borderColor,
}: {
  title: string
  text: string
  bgColor: string
  borderColor: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{
      background: bgColor,
      border: `1px solid ${borderColor}`,
      borderRadius: 8,
      padding: '12px 14px',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8
      }}>
        <span style={{
          fontSize: 12, fontFamily: 'system-ui', fontWeight: 700,
          color: 'var(--text-secondary)'
        }}>
          {title}
        </span>
        <button
          onClick={handleCopy}
          style={{
            fontSize: 11, fontFamily: 'system-ui', cursor: 'pointer',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 4, padding: '3px 8px', color: 'var(--text-secondary)',
            transition: 'all 0.15s'
          }}
        >
          {copied ? 'Copiado!' : 'Copiar'}
        </button>
      </div>
      <pre style={{
        margin: 0, fontSize: 12, fontFamily: 'monospace',
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        color: 'var(--text-primary)', lineHeight: 1.5,
      }}>
        {text}
      </pre>
    </div>
  )
}

export default function SDRInbox() {
  const [selectedLead, setSelectedLead] = useState<any>(null)

  const pendingFetcher = useCallback(() => convexApi.leads.pendingSdr(), [])
  const messagesFetcher = useCallback(async () => {
    if (!selectedLead?._id) return []
    return convexApi.messages.byLead(selectedLead._id)
  }, [selectedLead?._id])

  const { data: leads } = usePolling<any[]>(pendingFetcher, 15000, [])
  const { data: messages } = usePolling<any[]>(messagesFetcher, 8000, [])

  const unreadCount = leads?.filter(
    (l: any) => l.lastFbReply === '' || l.lastFbMessageAt > l.lastFbReplyAt
  ).length ?? 0

  return (
    <div>
      <PageHeader
        title="SDR Inbox"
        subtitle={`${unreadCount} conversas aguardando resposta`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, height: 'calc(100vh - 140px)' }}>

        {/* Lead list */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{
            padding: '10px 14px', borderBottom: '1px solid var(--border)',
            background: 'var(--bg-secondary)'
          }}>
            <span style={{
              fontSize: 11, fontFamily: 'system-ui', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-secondary)'
            }}>
              Conversas ({leads?.length || 0})
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {(!leads || leads.length === 0) && (
              <div style={{
                padding: '32px 16px', textAlign: 'center',
                color: 'var(--text-muted)', fontSize: 13, fontFamily: 'system-ui'
              }}>
                Nenhuma conversa pendente.
              </div>
            )}
            {leads?.map((lead: any) => {
              const unread = lead.lastFbReply === '' || lead.lastFbMessageAt > lead.lastFbReplyAt
              const active = selectedLead?._id === lead._id
              return (
                <div
                  key={lead._id}
                  onClick={() => setSelectedLead(lead)}
                  style={{
                    padding: '12px 14px', borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    background: active ? 'rgba(232,93,26,0.08)' : 'transparent',
                    borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
                    transition: 'all 0.1s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{
                      fontFamily: 'system-ui', fontSize: 13, fontWeight: 600,
                      color: 'var(--text-primary)'
                    }}>
                      {lead.authorName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {unread && (
                        <Circle size={8} fill="#E85D1A" color="#E85D1A" />
                      )}
                      <span style={{
                        fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace'
                      }}>
                        {timeAgo(lead.lastFbMessageAt)}
                      </span>
                    </div>
                  </div>
                  <div style={{
                    fontSize: 11, color: 'var(--text-muted)', fontFamily: 'system-ui',
                    marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {lead.lastFbMessage || 'Sem mensagem'}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 5 }}>
                    <span style={{
                      fontSize: 10, background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)', borderRadius: 3,
                      padding: '1px 5px', fontFamily: 'system-ui', color: 'var(--text-muted)'
                    }}>
                      {lead.facebookMessagesCount} msgs
                    </span>
                    {lead.whatsapp && (
                      <span style={{
                        fontSize: 10, background: '#F0FDF4', color: '#059669',
                        border: '1px solid #BBF7D0', borderRadius: 3,
                        padding: '1px 5px', fontFamily: 'system-ui'
                      }}>📱 WA</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Conversation pane */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 8, display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
          {!selectedLead ? (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', fontSize: 14, fontFamily: 'system-ui'
            }}>
              <div style={{ textAlign: 'center' }}>
                <MessageSquare size={40} color="var(--border-strong)" style={{ marginBottom: 12 }} />
                <div>Selecione uma conversa</div>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{
                padding: '14px 20px', borderBottom: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <div style={{
                    fontFamily: 'Georgia,serif', fontSize: 16, fontWeight: 'bold',
                    color: 'var(--text-primary)'
                  }}>
                    {selectedLead.authorName}
                  </div>
                  <div style={{
                    fontSize: 12, color: 'var(--text-muted)', fontFamily: 'system-ui', marginTop: 2
                  }}>
                    {selectedLead.groupName} · {selectedLead.facebookMessagesCount} mensagens recebidas
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {selectedLead.whatsapp && (
                    <span style={{
                      fontSize: 12, background: '#F0FDF4', color: '#059669',
                      border: '1px solid #BBF7D0', borderRadius: 6,
                      padding: '4px 10px', fontFamily: 'system-ui'
                    }}>
                      WhatsApp: {selectedLead.whatsapp}
                    </span>
                  )}
                  {selectedLead.profileLink && (
                    <a
                      href={selectedLead.profileLink} target="_blank" rel="noopener noreferrer"
                      style={{
                        fontSize: 12, color: 'var(--accent)', fontFamily: 'system-ui',
                        textDecoration: 'none', padding: '4px 10px',
                        border: '1px solid var(--accent)', borderRadius: 6
                      }}
                    >
                      Facebook →
                    </a>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(!messages || messages.length === 0) && (
                  <div style={{
                    textAlign: 'center', color: 'var(--text-muted)',
                    fontSize: 13, fontFamily: 'system-ui', padding: '32px 0'
                  }}>
                    Sem mensagens registradas no Convex para este lead.
                    <br />
                    <span style={{ fontSize: 11, marginTop: 6, display: 'block' }}>
                      (Mensagens são registradas pelo SDR agent durante as interações)
                    </span>
                  </div>
                )}
                {messages?.map((msg: any) => (
                  <div key={msg._id} style={{
                    display: 'flex',
                    justifyContent: msg.direction === 'outbound' ? 'flex-end' : 'flex-start'
                  }}>
                    <div style={{
                      maxWidth: '70%',
                      background: msg.direction === 'outbound' ? 'var(--accent)' : 'var(--bg-secondary)',
                      color: msg.direction === 'outbound' ? 'white' : 'var(--text-primary)',
                      borderRadius: msg.direction === 'outbound' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      padding: '10px 14px',
                    }}>
                      <div style={{ fontSize: 13, fontFamily: 'system-ui', lineHeight: 1.5 }}>
                        {msg.content}
                      </div>
                      <div style={{
                        fontSize: 10, marginTop: 4, opacity: 0.7,
                        fontFamily: 'monospace',
                        color: msg.direction === 'outbound' ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)'
                      }}>
                        {new Date(msg.sentAt).toLocaleTimeString('pt-BR')} · {msg.sentBy}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Agent Drafts */}
              {(selectedLead.draftWhatsapp || selectedLead.draftEmail) && (
                <div style={{
                  padding: '12px 20px', borderTop: '1px solid var(--border)',
                  display: 'flex', flexDirection: 'column', gap: 10
                }}>
                  <div style={{
                    fontSize: 11, fontFamily: 'system-ui', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: 1,
                    color: 'var(--text-muted)', marginBottom: 2
                  }}>
                    Drafts dos Agentes
                  </div>
                  {selectedLead.draftWhatsapp && (
                    <DraftBox
                      title="💬 Draft WhatsApp"
                      text={selectedLead.draftWhatsapp}
                      bgColor="rgba(16,185,129,0.06)"
                      borderColor="rgba(16,185,129,0.2)"
                    />
                  )}
                  {selectedLead.draftEmail && (
                    <DraftBox
                      title="✉️ Draft Email"
                      text={selectedLead.draftEmail}
                      bgColor="rgba(59,130,246,0.06)"
                      borderColor="rgba(59,130,246,0.2)"
                    />
                  )}
                </div>
              )}

              {/* Lead context footer */}
              <div style={{
                padding: '10px 20px', borderTop: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
                display: 'flex', gap: 16, fontSize: 11, fontFamily: 'system-ui',
                color: 'var(--text-muted)'
              }}>
                <span>Status: <strong>{selectedLead.status}</strong></span>
                <span>Prioridade: <strong>{selectedLead.priority}</strong></span>
                <span>Canal: <strong>{selectedLead.preferredChannel || 'facebook'}</strong></span>
                {selectedLead.lastFbReply && (
                  <span style={{ marginLeft: 'auto', color: '#10B981' }}>
                    Último reply: {timeAgo(selectedLead.lastFbReplyAt)}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
