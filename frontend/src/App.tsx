import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { api, STATUSES } from './api';
import type { Job, JobStatus } from './api';

const transitions: Record<JobStatus, JobStatus[]> = {
  pending: ['running', 'failed'], running: ['completed', 'failed'], completed: [], failed: [],
};

export default function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState<JobStatus | 'all'>('all');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const load = async () => { setLoading(true); setError(''); try { setJobs(await api.list()); } catch (e) { setError(e instanceof Error ? e.message : 'Could not load jobs.'); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  const counts = useMemo(() => Object.fromEntries(STATUSES.map(s => [s, jobs.filter(j => j.status === s).length])) as Record<JobStatus, number>, [jobs]);
  const visible = filter === 'all' ? jobs : jobs.filter(job => job.status === filter);
  const create = async (event: FormEvent) => { event.preventDefault(); setSaving(true); setError(''); try { const job = await api.create({ title: title.trim(), type: type.trim() }); setJobs(current => [job, ...current]); setTitle(''); setType(''); } catch (e) { setError(e instanceof Error ? e.message : 'Could not create job.'); } finally { setSaving(false); } };
  const changeStatus = async (job: Job, status: JobStatus) => { setError(''); try { const updated = await api.updateStatus(job.id, status); setJobs(current => current.map(item => item.id === job.id ? updated : item)); } catch (e) { setError(e instanceof Error ? e.message : 'Could not update job.'); await load(); } };
  const remove = async (id: string) => { setError(''); try { await api.remove(id); setJobs(current => current.filter(job => job.id !== id)); } catch (e) { setError(e instanceof Error ? e.message : 'Could not delete job.'); } };
  return <main>
    <header><div><p className="eyebrow">OPERATIONS</p><h1>Job Queue</h1><p className="muted">Create, track, and manage background work.</p></div><button className="secondary" onClick={() => void load()} disabled={loading}>Refresh</button></header>
    <section className="counts" aria-label="Job counts">{STATUSES.map(status => <button className={filter === status ? 'count active' : 'count'} onClick={() => setFilter(filter === status ? 'all' : status)} key={status}><strong>{counts[status]}</strong><span>{status}</span></button>)}</section>
    <section className="panel"><h2>Add a job</h2><form onSubmit={create}><label>Title<input required maxLength={120} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Generate monthly report" /></label><label>Type<input required maxLength={60} value={type} onChange={e => setType(e.target.value)} placeholder="e.g. report" /></label><button disabled={saving}>{saving ? 'Creating…' : 'Create job'}</button></form></section>
    {error && <p className="error" role="alert">{error}</p>}
    <section className="panel list"><div className="list-heading"><h2>{filter === 'all' ? 'All jobs' : `${filter} jobs`}</h2><span>{visible.length} shown</span></div>{loading ? <p className="muted">Loading jobs…</p> : visible.length === 0 ? <p className="empty">No jobs here yet.</p> : <div className="table-wrap"><table><thead><tr><th>Job</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead><tbody>{visible.map(job => <tr key={job.id}><td><strong>{job.title}</strong><small>{job.type}</small></td><td><span className={`badge ${job.status}`}>{job.status}</span></td><td>{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(job.createdAt))}</td><td><div className="actions">{transitions[job.status].map(next => <button className="action" key={next} onClick={() => void changeStatus(job, next)}>Mark {next}</button>)}<button className="danger" onClick={() => void remove(job.id)}>Delete</button></div></td></tr>)}</tbody></table></div>}</section>
  </main>;
}
