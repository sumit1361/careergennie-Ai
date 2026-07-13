import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getApplicationsForJob, updateApplicationStatus } from '../utils/api.js';

const STATUS_OPTIONS = ['applied', 'reviewed', 'accepted', 'rejected'];

const STATUS_STYLES = {
  applied: 'bg-zinc-700 text-zinc-100',
  reviewed: 'bg-cyan-900 text-cyan-200',
  accepted: 'bg-emerald-900 text-emerald-200',
  rejected: 'bg-red-950 text-red-300',
};

export default function JobApplications() {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const load = () => {
    setLoading(true);
    getApplicationsForJob(jobId)
      .then(({ data }) => setApplications(data.applications))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load applicants'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const handleStatusChange = async (applicationId, status) => {
    setUpdatingId(applicationId);
    try {
      await updateApplicationStatus(applicationId, status);
      setApplications((prev) =>
        prev.map((app) => (app._id === applicationId ? { ...app, status } : app))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <div className="text-center mt-16 text-zinc-400">Loading applicants...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-12 space-y-4">
      <h1 className="font-display text-2xl mb-2">Applicants</h1>

      {error && (
        <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-xl px-3 py-2">
          {error}
        </div>
      )}

      {applications.length === 0 && (
        <p className="text-zinc-400">No applications yet for this role.</p>
      )}

      {applications.map((app) => (
        <div key={app._id} className="cg-card flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">{app.studentId?.name}</p>
            <p className="text-sm text-zinc-500">{app.studentId?.email}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-accent font-display text-xl">{app.matchPercentage}%</span>
              <p className="text-xs text-zinc-500">match</p>
            </div>

            <span
              className={`text-xs px-3 py-1 rounded-full capitalize ${STATUS_STYLES[app.status]}`}
            >
              {app.status}
            </span>

            <select
              className="cg-input !w-auto text-xs"
              value={app.status}
              disabled={updatingId === app._id}
              onChange={(e) => handleStatusChange(app._id, e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}
