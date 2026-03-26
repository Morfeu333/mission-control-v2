import { useState, useCallback } from 'react'
import { Play, Clock, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { oc } from '../lib/openclaw-api'
import { usePolling } from '../lib/usePolling'

function formatNextRun(cron: any) {
  if (!cron) return '—'
  // Support both flat fields and state nested object (local cron format)
  const next = cron.state?.nextRunAtMs ?? cron.nextRun ?? cron.next_run ?? cron.nextRunAt
  if (!next) return '—'
  const d = new Date(next)
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function formatLastRun(cron: any) {
  // Support both flat fields and state nested object (local cron format)
  const last = cron.state?.lastRunAtMs ?? cron.lastRun ?? cron.last_run ?? cron.lastRunAt
  if (!last) return '—'
  const d = new Date(last)
  const s = Math.floor((Date.now() - d.getTime()) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function formatSchedule(schedule: any) {
  if (!schedule) return '—'
  if (typeof schedule === 'string') return schedule
  if (schedule.kind === 'every') {
    const ms = schedule.everyMs
    if (ms < 60000) return `every ${ms / 1000}s`
    if (ms < 3600000) return `every ${ms / 60000}m`
    if (ms < 86400000) return `every ${ms / 3600000}h`
    return `every ${ms / 86400000}d`
  }
  if (schedule.kind === 'cron') return `cron: ${schedule.expr}`
  return JSON.stringify(schedule)
}

function CronStatusBadge({ enabled }: { enabled: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: enabled ? '#F0FDF4' : '#F9FAFB',
      color: enabled ? '#059669' : '#9CA3AF',
      border: `1px solid ${enabled ? '#BBF7D0' : '#E5E7EB'}`,
      borderRadius: 10, padding: '2px 8px', fontSize: 11,
      fontFamily: 'system-ui', fontWeight: 600
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%',
        background: enabled ? '#059669' : '#9CA3AF',
        display: 'inline-block'
      }} />
      {enabled ? 'enabled' : 'disabled'}
    </span>
  )
}

export default function Crons() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [triggeringId, setTriggeringId] = useState<string | null>(null)
  const [runHistory, setRunHistory] = useState<Record<string, any[]>>({})
  const [message, setMessage] = useState<{ text: string; type: 'ok' | 'err' } | null>(null)

  const cronsFetcher = useCallback(() => oc.cronJobs(), [])
  const statusFetcher = useCallback(() => oc.status(), [])

  const { data: cronsData, loading, refresh } = usePolling(cronsFetcher, 30000)
  const { data: ocStatus } = usePolling(statusFetcher, 30000)

  const jobs: any[] = Array.isArray(cronsData)
    ? cronsData
    : (cronsData as any)?.jobs ?? []

  const showMessage = (text: string, type: 'ok' | 'err') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 4000)
  }

  const triggerCron = async (id: string, name: string) => {
    setTriggeringId(id)
    try {
      await oc.triggerCron(id)
      showMessage(`✓ "${name}" triggered successfully`, 'ok')
      setTimeout(refresh, 2000)
    } catch (e) {
      showMessage(`Error: ${e}`, 'err')
    } finally {
      setTriggeringId(null)
    }
  }

  const toggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }
    setExpandedId(id)
    if (!runHistory[id]) {
      try {
        const data = await oc.cronRuns(id)
        setRunHistory((prev) => ({
          ...prev,
          [id]: Array.isArray(data) ? data : data.runs ?? []
        }))
      } catch { /* ignore */ }
    }
  }

  return (
    <div>
      <PageHeader
        title="Cron Jobs"
        subtitle="Gerenciamento de crons via OpenClaw"
        actions={
          <button
            onClick={refresh}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--bg-card)', color: 'var(--text-secondary)',
              border: '1px solid var(--border)', borderRadius: 6, padding: '7px 14px',
              cursor: 'pointer', fontSize: 13, fontFamily: 'system-ui'
            }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        }
      />

      {/* Toast */}
      {message && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 300,
          background: message.type === 'ok' ? '#F0FDF4' : '#FEF2F2',
          border: `1px solid ${message.type === 'ok' ? '#BBF7D0' : '#FECACA'}`,
          color: message.type === 'ok' ? '#059669' : '#DC2626',
          borderRadius: 8, padding: '12px 20px', fontSize: 13,
          fontFamily: 'system-ui', boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
        }}>
          {message.text}
        </div>
      )}

      {/* OpenClaw status */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 8, padding: '12px 16px', marginBottom: 20,
        display: 'flex', gap: 24, alignItems: 'center', fontSize: 13, fontFamily: 'system-ui'
      }}>
        <span style={{ color: 'var(--text-muted)' }}>OpenClaw:</span>
        {ocStatus && (ocStatus as any).ok === true ? (
          <span style={{ color: '#10B981', fontWeight: 600 }}>● live ✓</span>
        ) : (
          <span style={{ color: '#DC2626', fontWeight: 600 }}>● Offline</span>
        )}
        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 12 }}>
          {jobs.length} cron job{jobs.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading && jobs.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontFamily: 'system-ui' }}>Carregando crons...</p>
      )}

      {!loading && jobs.length === 0 && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '40px', textAlign: 'center',
          color: 'var(--text-muted)', fontFamily: 'system-ui'
        }}>
          <Clock size={36} color="var(--border-strong)" style={{ marginBottom: 12 }} />
          <div>Nenhum cron job configurado.</div>
          <div style={{ fontSize: 12, marginTop: 6 }}>Configure crons no openclaw.json</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {jobs.map((job: any) => {
          const id = job.id ?? job._id ?? job.name
          const name = job.name ?? id
          const enabled = job.enabled ?? job.active ?? true
          const schedule = job.schedule ?? job.cron ?? '—'
          const expanded = expandedId === id
          const runs = runHistory[id] ?? []
          const lastStatus = job.state?.lastRunStatus ?? job.lastRunStatus
          const consecutiveErrors = job.state?.consecutiveErrors ?? job.consecutiveErrors ?? 0

          return (
            <div key={id} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 8, overflow: 'hidden'
            }}>
              {/* Job header row */}
              <div style={{
                padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 14,
                flexWrap: 'wrap'
              }}>
                {/* Expand button */}
                <button
                  onClick={() => toggleExpand(id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: 0, display: 'flex'
                  }}
                >
                  {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {/* Name + schedule */}
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{
                    fontFamily: 'system-ui', fontSize: 14, fontWeight: 600,
                    color: 'var(--text-primary)'
                  }}>{name}</div>
                  <div style={{
                    fontSize: 11, color: 'var(--text-muted)',
                    fontFamily: 'monospace', marginTop: 2
                  }}>{formatSchedule(schedule)}</div>
                </div>

                <CronStatusBadge enabled={enabled} />

                {/* Last status */}
                {lastStatus && (
                  <span style={{
                    fontSize: 11, fontFamily: 'monospace', fontWeight: 600,
                    color: lastStatus === 'ok' ? '#10B981' : '#DC2626'
                  }}>
                    {lastStatus === 'ok' ? '✓ ok' : `✗ ${lastStatus}`}
                    {consecutiveErrors > 0 && ` (${consecutiveErrors} err)`}
                  </span>
                )}

                {/* Last run */}
                <div style={{ minWidth: 100 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'system-ui', marginBottom: 1 }}>
                    LAST RUN
                  </div>
                  <div style={{ fontSize: 12, fontFamily: 'monospace' }}>
                    {formatLastRun(job)}
                  </div>
                </div>

                {/* Next run */}
                <div style={{ minWidth: 110 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'system-ui', marginBottom: 1 }}>
                    NEXT RUN
                  </div>
                  <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--accent)' }}>
                    {formatNextRun(job)}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
                  <button
                    onClick={() => triggerCron(id, name)}
                    disabled={triggeringId === id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      background: triggeringId === id ? '#D1D5DB' : 'var(--accent)',
                      color: triggeringId === id ? '#6B7280' : 'white',
                      border: 'none', borderRadius: 6, padding: '6px 12px',
                      cursor: triggeringId === id ? 'default' : 'pointer',
                      fontSize: 12, fontFamily: 'system-ui', fontWeight: 600
                    }}
                  >
                    <Play size={12} />
                    {triggeringId === id ? 'Running...' : 'Run'}
                  </button>
                </div>
              </div>

              {/* Expanded: run history */}
              {expanded && (
                <div style={{
                  borderTop: '1px solid var(--border)',
                  padding: '12px 18px', background: 'var(--bg-secondary)'
                }}>
                  <div style={{
                    fontSize: 11, fontFamily: 'system-ui', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: 1,
                    color: 'var(--text-muted)', marginBottom: 8
                  }}>
                    Run History
                  </div>
                  {runs.length === 0 ? (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'system-ui' }}>
                      Sem histórico disponível.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {runs.slice(0, 10).map((run: any, i: number) => {
                        const isOk = run.status === 'ok' || run.success
                        const ts = run.runAtMs ?? run.runAt ?? run.startedAt ?? run.ts
                        const totalTokens = run.usage
                          ? (run.usage.inputTokens || 0) + (run.usage.outputTokens || 0)
                          : null
                        return (
                          <div key={i} style={{
                            padding: '8px 10px', borderRadius: 6,
                            background: isOk ? 'rgba(16,185,129,0.05)' : 'rgba(220,38,38,0.05)',
                            border: `1px solid ${isOk ? 'rgba(16,185,129,0.2)' : 'rgba(220,38,38,0.2)'}`,
                          }}>
                            <div style={{
                              display: 'flex', gap: 12, fontSize: 11, fontFamily: 'monospace',
                              alignItems: 'center', marginBottom: run.summary ? 5 : 0
                            }}>
                              <span style={{ color: isOk ? '#10B981' : '#DC2626', fontWeight: 700 }}>
                                {isOk ? '✓' : '✗'}
                              </span>
                              <span style={{ color: 'var(--text-muted)' }}>
                                {ts ? new Date(ts).toLocaleString('pt-BR') : '—'}
                              </span>
                              {run.durationMs && (
                                <span style={{ color: 'var(--text-secondary)' }}>
                                  {Math.round(run.durationMs / 1000)}s
                                </span>
                              )}
                              {totalTokens !== null && (
                                <span style={{ color: '#8B5CF6', marginLeft: 'auto' }}>
                                  {totalTokens.toLocaleString()} tokens
                                </span>
                              )}
                            </div>
                            {run.summary && (
                              <div style={{
                                fontSize: 11, fontFamily: 'system-ui',
                                color: 'var(--text-secondary)', lineHeight: 1.5,
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical' as any,
                              }}>
                                {run.summary}
                              </div>
                            )}
                            {run.error && (
                              <div style={{ fontSize: 11, color: '#DC2626', fontFamily: 'monospace', marginTop: 3 }}>
                                {run.error}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
