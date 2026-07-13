import { useEffect, useState } from 'react';
import { getMyApplications } from '../utils/api.js';

const STATUS_STYLES = {
  applied: 'bg-zinc-700 text-zinc-100',
  reviewed: 'bg-cyan-900 text-cyan-200',
  accepted: 'bg-emerald-900 text-emerald-200',
  rejected: 'bg-red-950 text-red-300',
};

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyApplications()
      .then(({ data }) => setApplications(data.applications))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load applications'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center mt-16 text-zinc-400">Loading your applications...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-12 space-y-4">
      <h1 className="font-display text-2xl mb-2">My applications</h1>

      {error && (
        <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-xl px-3 py-2">
          {error}
        </div>
      )}

      {applications.length === 0 && (
        <p className="text-zinc-400">You haven't applied to anything yet.</p>
      )}

      {applications.map((app) => (
        <div key={app._id} className="cg-card flex items-center justify-between">
          <div>
            <p className="font-medium">{app.jobId?.title}</p>
            <p className="text-xs text-zinc-500">
              Deadline: {app.jobId?.deadline ? new Date(app.jobId.deadline).toLocaleDateString() : '—'}
            </p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full capitalize ${STATUS_STYLES[app.status]}`}>
            {app.status}
          </span>
        </div>
      ))}
    </div>
  );
}
