import { useEffect, useState } from 'react';
import {
  getAdminStats,
  listJobsForModeration,
  approveJob,
  rejectJob,
  listUsers,
  updateUserRole,
} from '../utils/api.js';

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([getAdminStats(), listJobsForModeration('pending'), listUsers()])
      .then(([statsRes, jobsRes, usersRes]) => {
        setStats(statsRes.data.stats);
        setPendingJobs(jobsRes.data.jobs);
        setUsers(usersRes.data.users);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load admin data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleModerate = async (jobId, action) => {
    try {
      if (action === 'approve') await approveJob(jobId);
      else await rejectJob(jobId);
      setPendingJobs((prev) => prev.filter((j) => j._id !== jobId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update job');
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await updateUserRole(userId, role);
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role } : u)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role');
    }
  };

  if (loading) return <div className="text-center mt-16 text-zinc-400">Loading admin panel...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-12 space-y-8">
      <h1 className="font-display text-2xl">Admin panel</h1>

      {error && (
        <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-xl px-3 py-2">
          {error}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="cg-card text-center">
              <p className="text-2xl font-display text-accent">{value}</p>
              <p className="text-xs text-zinc-500 mt-1 capitalize">
                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </p>
            </div>
          ))}
        </div>
      )}

      <section>
        <h2 className="font-display text-lg mb-3">Jobs awaiting approval</h2>
        {pendingJobs.length === 0 && <p className="text-zinc-400 text-sm">Nothing pending.</p>}
        <div className="space-y-3">
          {pendingJobs.map((job) => (
            <div key={job._id} className="cg-card flex items-center justify-between">
              <div>
                <p className="font-medium">{job.title}</p>
                <p className="text-xs text-zinc-500">Posted by {job.recruiterId?.name}</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="cg-btn-primary !px-3 !py-1.5"
                  onClick={() => handleModerate(job._id, 'approve')}
                >
                  Approve
                </button>
                <button
                  className="px-3 py-1.5 rounded-xl border border-red-900 text-red-300 hover:bg-red-950/40"
                  onClick={() => handleModerate(job._id, 'reject')}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg mb-3">Users</h2>
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u._id} className="cg-card flex items-center justify-between">
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-xs text-zinc-500">{u.email}</p>
              </div>
              <select
                className="cg-input !w-auto text-xs"
                value={u.role}
                onChange={(e) => handleRoleChange(u._id, e.target.value)}
              >
                <option value="student">student</option>
                <option value="recruiter">recruiter</option>
                <option value="admin">admin</option>
              </select>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
