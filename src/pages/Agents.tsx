import { useCallback } from 'react'
import { Bot, Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { convexApi } from '../lib/convex-api'
import { oc } from '../lib/openclaw-api'
import { usePolling } from '../lib/usePolling'

function timeAgo(ts: number) {
  if (!ts) return 'never'
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function formatDuration(ms: number) {
  if (!ms) return '—'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}

const STATUS_COLORS: Record<string, { dot: string; bg: string; text: string }> = {
  running: { dot: '#10B981', bg: '#F0FDF4', text: '#059669' },
  idle: { dot: '#D1D5DB', bg: '#F9FAFB', text: '#6B7280' },
  error: { dot: '#DC2626', bg: '#FEF2F2', text: '#DC2626' },
}

export default function Agents() {
  const agentsFetcher = useCallback(() => convexApi.agents.getAll(), [])
  const runsFetcher = useCallback(() => convexApi.agentRuns.recent(40), [])
  const cronJobsFetcher = useCallback(() => oc.cronJobs(), [])

  const { data: agents, loading: agentsLoading } = usePolling<any[]>(agentsFetcher, 15000, [])
  const { data: runs } = usePolling<any[]>(runsFetcher, 15000, [])
  const { data: cronData } = usePolling(cronJobsFetcher, 30000)
  const cronJobs: any[] = Array.isArray(cronData) ? cronData : (cronData as any)?.jobs ?? []

  return (
    <div>
      <PageHeader title="Agents" subtitle="Status em tempo real dos agentes OpenClaw" />

      {/* Agent cards */}
      {agentsLoading && (!agents || agents.length === 0) && (
        <p style={{ color: 'var(--text-muted)', fontFamily: 'system-ui', fontSize: 13 }}>
          Carregando agentes...
        </p>
      )}

      {agents?.length === 0 && !agentsLoading && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 8, padding: 32, textAlign: 'center',
          color: 'var(--text-muted)', fontFamily: 'system-ui'
        }}>
          <Bot size={40} color="var(--border-strong)" style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 14 }}>Nenhum agente registrou heartbeat ainda.</div>
          <div style={{ fontSize: 12, marginTop: 6 }}>
            Os agentes registram status via POST /api/mc/agents/heartbeat
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, marginBottom: 24 }}>
        {agents?.map((agent: any) => {
          const s = STATUS_COLORS[agent.status] || STATUS_COLORS.idle
          return (
            <div key={agent.agentId} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 8, padding: 20, borderTop: `3px solid ${s.dot}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{
                    fontFamily: 'Georgia,serif', fontSize: 16, fontWeight: 'bold',
                    color: 'var(--text-primary)'
                  }}>
                    {agent.name}
                  </div>
                  <div style={{
                    fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 2
                  }}>
                    {agent.agentId}
                  </div>
                </div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: s.bg, color: s.text,
                  borderRadius: 12, padding: '3px 10px',
                  fontSize: 11, fontFamily: 'system-ui', fontWeight: 600
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: s.dot, display: 'inline-block'
                  }} />
                  {agent.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  ['Last Heartbeat', timeAgo(agent.lastHeartbeat)],
                  ['Last Run', agent.lastRunStatus || '—'],
                  ['Errors', agent.consecutiveErrors === 0
                    ? '✓ 0'
                    : `⚠ ${agent.consecutiveErrors}`],
                  ['Task', agent.currentTask?.slice(0, 30) || '—'],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <div style={{
                      fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase',
                      letterSpacing: 0.8, fontFamily: 'system-ui', marginBottom: 2
                    }}>{label}</div>
                    <div style={{
                      fontSize: 12, fontFamily: 'monospace',
                      color: label === 'Errors' && agent.consecutiveErrors > 0
                        ? '#DC2626' : 'var(--text-primary)'
                    }}>{String(value)}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent runs table */}
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
            Recent Runs
          </h3>
          <Activity size={16} color="var(--text-muted)" />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)' }}>
                {['Agent', 'Horário', 'Status', 'Novos', 'Atualizados', 'Duração', 'Resumo'].map((h) => (
                  <th key={h} style={{
                    padding: '8px 12px', textAlign: 'left',
                    fontFamily: 'system-ui', fontWeight: 600, fontSize: 11,
                    color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8,
                    borderBottom: '1px solid var(--border)'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(!runs || runs.length === 0) && (
                <tr>
                  <td colSpan={7} style={{
                    padding: '24px', textAlign: 'center',
                    color: 'var(--text-muted)', fontFamily: 'system-ui'
                  }}>
                    Sem runs registrados...
                  </td>
                </tr>
              )}
              {runs?.map((run: any) => (
                <tr key={run._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{
                      fontFamily: 'monospace', fontSize: 11,
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 3, padding: '1px 6px'
                    }}>{run.agentId}</span>
                  </td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>
                    {new Date(run.runAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      {run.status === 'ok'
                        ? <CheckCircle size={13} color="#10B981" />
                        : run.status === 'error'
                        ? <AlertTriangle size={13} color="#DC2626" />
                        : <Activity size={13} color="#F59E0B" />}
                      <span style={{
                        fontFamily: 'system-ui', fontSize: 11,
                        color: run.status === 'ok' ? '#10B981' : run.status === 'error' ? '#DC2626' : '#F59E0B'
                      }}>{run.status}</span>
                    </span>
                  </td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 11, color: '#10B981' }}>+{run.leadsNew}</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 11, color: '#3B82F6' }}>~{run.leadsUpdated}</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>
                    {formatDuration(run.durationMs)}
                  </td>
                  <td style={{
                    padding: '8px 12px', fontFamily: 'system-ui', fontSize: 11,
                    color: run.status === 'error' ? '#DC2626' : 'var(--text-muted)',
                    maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {run.status === 'error' ? run.errorMessage : run.summary}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cron Status Section */}
      {cronJobs.length > 0 && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, marginTop: 24
        }}>
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <h3 style={{
              fontFamily: 'Georgia,serif', fontSize: 14, fontWeight: 'bold',
              color: 'var(--text-secondary)', margin: 0
            }}>
              Cron Status
            </h3>
            <Clock size={16} color="var(--text-muted)" />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  {['Nome', 'Status', 'Erros', 'Último Run', 'Duração', 'Próximo Run'].map((h) => (
                    <th key={h} style={{
                      padding: '8px 12px', textAlign: 'left',
                      fontFamily: 'system-ui', fontWeight: 600, fontSize: 11,
                      color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8,
                      borderBottom: '1px solid var(--border)'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cronJobs.map((job: any) => {
                  const id = job.id ?? job.name
                  const enabled = job.enabled ?? true
                  const state = job.state ?? {}
                  const errors = state.consecutiveErrors ?? 0
                  const lastRunAtMs = state.lastRunAtMs
                  const nextRunAtMs = state.nextRunAtMs
                  const lastStatus = state.lastRunStatus ?? state.lastStatus
                  const lastDurationMs = state.lastDurationMs

                  const lastRunStr = lastRunAtMs
                    ? timeAgo(lastRunAtMs)
                    : '—'
                  const nextRunStr = nextRunAtMs
                    ? new Date(nextRunAtMs).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
                    : '—'
                  const durationStr = lastDurationMs
                    ? (lastDurationMs < 60000
                      ? `${(lastDurationMs / 1000).toFixed(1)}s`
                      : `${Math.floor(lastDurationMs / 60000)}m ${Math.floor((lastDurationMs % 60000) / 1000)}s`)
                    : '—'

                  return (
                    <tr key={id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 12px', fontFamily: 'system-ui', fontSize: 12, fontWeight: 500 }}>
                        {job.name}
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 11, fontFamily: 'system-ui', fontWeight: 600,
                          color: enabled ? '#059669' : '#9CA3AF'
                        }}>
                          <span style={{
                            width: 5, height: 5, borderRadius: '50%',
                            background: enabled ? '#059669' : '#9CA3AF',
                            display: 'inline-block'
                          }} />
                          {enabled ? 'enabled' : 'disabled'}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 11 }}>
                        <span style={{ color: errors > 0 ? '#DC2626' : '#10B981' }}>
                          {errors === 0 ? '✓ 0' : `⚠ ${errors}`}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>
                          {lastRunStr}
                        </div>
                        {lastStatus && (
                          <div style={{
                            fontSize: 10, fontFamily: 'system-ui', fontWeight: 600,
                            color: lastStatus === 'ok' ? '#10B981' : '#DC2626'
                          }}>
                            {lastStatus}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>
                        {durationStr}
                      </td>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 11, color: 'var(--accent)' }}>
                        {nextRunStr}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
