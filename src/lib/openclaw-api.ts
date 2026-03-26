const OC = '/openclaw'
const LOCAL = '/local'

async function ocFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${OC}${path}`, opts)
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

async function localFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${LOCAL}${path}`, opts)
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

export const oc = {
  status: () => ocFetch('/health'),
  cronJobs: () => localFetch('/cron/jobs'),
  cronRuns: (id: string) => localFetch(`/cron/runs/${encodeURIComponent(id)}`),
  triggerCron: (id: string) => localFetch(`/cron/trigger/${encodeURIComponent(id)}`, { method: 'POST' }),
}
