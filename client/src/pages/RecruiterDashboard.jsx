import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listMyJobs } from '../utils/api.js';

const STATUS_STYLES = {
  pending: 'bg-amber-900 text-amber-200',
  approved: 'bg-emerald-900 text-emerald-200',
  rejected: 'bg-red-950 text-red-300',
};

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMyJobs()
      .then(({ data }) => setJobs(data.jobs))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center mt-16 text-zinc-400">Loading dashboard...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-12 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Your job postings</h1>
        <Link to="/jobs/new" className="cg-btn-primary">
          Post a job
        </Link>
      </div>

      {jobs.length === 0 && (
        <p className="text-zinc-400 text-sm">You haven't posted any jobs yet.</p>
      )}

      {jobs.map((job) => (
        <div key={job._id} className="cg-card flex items-center justify-between">
          <div>
            <p className="font-medium">{job.title}</p>
            <p className="text-xs text-zinc-500">
              Deadline: {new Date(job.deadline).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-3 py-1 rounded-full capitalize ${STATUS_STYLES[job.status]}`}>
              {job.status}
            </span>
            <Link to={`/jobs/${job._id}/applications`} className="text-accent text-sm hover:underline">
              View applicants
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
