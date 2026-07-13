import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyResumes, getMyApplications } from '../utils/api.js';

export default function StudentDashboard() {
  const [resumes, setResumes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyResumes(), getMyApplications()])
      .then(([resumeRes, appRes]) => {
        setResumes(resumeRes.data.resumes);
        setApplications(appRes.data.applications);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center mt-16 text-zinc-400">Loading dashboard...</div>;

  const latestResume = resumes[0];

  return (
    <div className="max-w-3xl mx-auto mt-12 space-y-6">
      <h1 className="font-display text-2xl">Your dashboard</h1>

      <div className="cg-card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg">Latest resume analysis</h2>
          <Link to="/resume" className="text-accent text-sm hover:underline">
            Re-analyze
          </Link>
        </div>
        {latestResume ? (
          <div>
            <p className="text-3xl font-display text-accent">{latestResume.aiFeedback.score}/100</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {latestResume.parsedProfile.skills.slice(0, 8).map((skill) => (
                <span
                  key={skill}
                  className="text-xs bg-surface-raised border border-zinc-700 rounded-full px-3 py-1"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-zinc-400 text-sm">
            You haven't uploaded a resume yet.{' '}
            <Link to="/resume" className="text-accent hover:underline">
              Upload one now
            </Link>
            .
          </p>
        )}
      </div>

      <div className="cg-card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg">Applications</h2>
          <Link to="/applications/mine" className="text-accent text-sm hover:underline">
            View all
          </Link>
        </div>
        {applications.length === 0 ? (
          <p className="text-zinc-400 text-sm">
            No applications yet.{' '}
            <Link to="/jobs" className="text-accent hover:underline">
              Browse open roles
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-2">
            {applications.slice(0, 5).map((app) => (
              <li key={app._id} className="flex items-center justify-between text-sm">
                <span>{app.jobId?.title}</span>
                <span className="text-zinc-500 capitalize">{app.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
