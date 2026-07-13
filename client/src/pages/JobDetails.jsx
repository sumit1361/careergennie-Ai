import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getJob, applyToJob, getMyResumes } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function JobDetails() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [compatibility, setCompatibility] = useState(null);

  useEffect(() => {
    getJob(id)
      .then(({ data }) => setJob(data.job))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load job'))
      .finally(() => setLoading(false));
  }, [id]);

  // Lightweight client-side "compatibility hint": overlap between the
  // student's most recently analyzed resume skills and this job's required
  // skills. Purely informational — the authoritative matchPercentage used
  // on applications is computed server-side by ml/analyzer.py.
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'student' || !job) return;
    getMyResumes()
      .then(({ data }) => {
        const latest = data.resumes?.[0];
        if (!latest || job.requiredSkills.length === 0) return;
        const resumeSkills = new Set(latest.parsedProfile.skills.map((s) => s.toLowerCase()));
        const overlap = job.requiredSkills.filter((s) => resumeSkills.has(s.toLowerCase()));
        setCompatibility({
          percentage: Math.round((overlap.length / job.requiredSkills.length) * 100),
          matched: overlap,
        });
      })
      .catch(() => setCompatibility(null));
  }, [isAuthenticated, user, job]);

  const handleApply = async () => {
    setApplying(true);
    setApplyMessage('');
    try {
      await applyToJob({ jobId: id });
      setApplyMessage('Application submitted.');
    } catch (err) {
      setApplyMessage(err.response?.data?.message || 'Application failed');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="text-center mt-16 text-zinc-400">Loading...</div>;
  if (error) return <div className="text-center mt-16 text-red-400">{error}</div>;
  if (!job) return null;

  return (
    <div className="max-w-2xl mx-auto mt-12">
      <div className="cg-card">
        <h1 className="font-display text-2xl">{job.title}</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Posted by {job.recruiterId?.name} · Deadline {new Date(job.deadline).toLocaleDateString()}
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          {job.requiredSkills.map((skill) => (
            <span
              key={skill}
              className="text-xs bg-surface-raised border border-zinc-700 rounded-full px-3 py-1"
            >
              {skill}
            </span>
          ))}
        </div>

        <p className="text-sm text-zinc-300 mt-6 whitespace-pre-line">{job.description}</p>

        {compatibility && (
          <div className="mt-6 border-t border-zinc-800 pt-4">
            <p className="text-sm text-zinc-300">
              Estimated compatibility with your latest resume:{' '}
              <span className="text-accent font-semibold">{compatibility.percentage}%</span>
            </p>
            {compatibility.matched.length > 0 && (
              <p className="text-xs text-zinc-500 mt-1">
                Matched skills: {compatibility.matched.join(', ')}
              </p>
            )}
          </div>
        )}

        {isAuthenticated && user?.role === 'student' && (
          <div className="mt-6">
            {applyMessage && <p className="text-sm text-accent mb-2">{applyMessage}</p>}
            <button className="cg-btn-primary" onClick={handleApply} disabled={applying}>
              {applying ? 'Applying...' : 'Apply to this role'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
