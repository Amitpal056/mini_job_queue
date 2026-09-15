export const STATUSES = ['pending', 'running', 'completed', 'failed'] as const;
export type JobStatus = typeof STATUSES[number];
export interface Job { id: string; title: string; type: string; status: JobStatus; createdAt: string }
const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, { headers: { 'Content-Type': 'application/json', ...options?.headers }, ...options });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = Array.isArray(payload?.message) ? payload.message.join(', ') : payload?.message;
    throw new Error(message ?? `Request failed (${response.status})`);
  }
  return response.status === 204 ? undefined as T : response.json();
}
export const api = {
  list: () => request<Job[]>('/jobs'),
  create: (job: Pick<Job, 'title' | 'type'>) => request<Job>('/jobs', { method: 'POST', body: JSON.stringify(job) }),
  updateStatus: (id: string, status: JobStatus) => request<Job>(`/jobs/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  remove: (id: string) => request<void>(`/jobs/${id}`, { method: 'DELETE' }),
};
