import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listJobs } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const [featuredJobs, setFeaturedJobs] = useState([]);

  useEffect(() => {
    listJobs()
      .then(({ data }) => setFeaturedJobs(data.jobs.slice(0, 3)))
      .catch(() => setFeaturedJobs([]));
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <section className="text-center pt-20 pb-16">
        <h1 className="font-display text-4xl sm:text-5xl leading-tight">
          Land your next role with a resume that <span className="text-accent">actually matches</span> the job.
        </h1>
        <p className="text-zinc-400 mt-4 max-w-xl mx-auto">
          CareerGenie scores your resume, tells you what to fix, and matches you to open
          roles by real keyword and skill similarity — not guesswork.
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          {isAuthenticated ? (
            <Link to="/resume" className="cg-btn-primary">
              Analyze my resume
            </Link>
          ) : (
            <>
              <Link to="/signup" className="cg-btn-primary">
                Get started
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-200 hover:border-zinc-500"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="font-display text-xl mb-4">Featured openings</h2>
        {featuredJobs.length === 0 ? (
          <p className="text-zinc-500 text-sm">No open roles yet — check back soon.</p>
        ) : (
          <div className="grid sm:grid-cols-3 gap-4">
            {featuredJobs.map((job) => (
              <Link key={job._id} to={`/jobs/${job._id}`} className="cg-card block hover:border-zinc-600">
                <h3 className="font-medium">{job.title}</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Deadline: {new Date(job.deadline).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mb-20 cg-card">
        <h2 className="font-display text-xl mb-3">Resume tips</h2>
        <ul className="list-disc list-inside text-sm text-zinc-300 space-y-1">
          <li>Lead with quantifiable achievements (percentages, metrics, dollar impact).</li>
          <li>List your tech stack explicitly — matching relies on recognizable keywords.</li>
          <li>Keep it tight: aim for 150–1200 words for the clearest signal.</li>
        </ul>
      </section>
    </div>
  );
}
