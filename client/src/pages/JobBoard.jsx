import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listJobs, applyToJob } from '../utils/api.js';

export default function JobBoard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    listJobs()
      .then(({ data }) => setJobs(data.jobs))
      .catch(() => setMessage('Failed to load jobs'))
      .finally(() => setLoading(false));
  }, []);

  const handleApply = async (jobId) => {
    setApplyingId(jobId);
    setMessage('');
    try {
      await applyToJob({ jobId });
      setMessage('Application submitted.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Application failed');
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) {
    return <div className="text-center mt-16 text-zinc-400">Loading jobs...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-12 space-y-4">
      <h1 className="font-display text-2xl mb-2">Open roles</h1>

      {message && <p className="text-sm text-accent">{message}</p>}

      {jobs.length === 0 && <p className="text-zinc-400">No open roles right now.</p>}

      {jobs.map((job) => (
        <div key={job._id} className="cg-card">
          <div className="flex items-start justify-between">
            <div>
              <Link to={`/jobs/${job._id}`} className="font-display text-lg hover:text-accent">
                {job.title}
              </Link>
              <p className="text-sm text-zinc-400 mt-1">{job.description}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {job.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs bg-surface-raised border border-zinc-700 rounded-full px-3 py-1"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <button
              className="cg-btn-primary shrink-0"
              onClick={() => handleApply(job._id)}
              disabled={applyingId === job._id}
            >
              {applyingId === job._id ? 'Applying...' : 'Apply'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
