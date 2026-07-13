import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../utils/api.js';

export default function CreateJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    requiredSkills: '',
    deadline: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        deadline: form.deadline,
        requiredSkills: form.requiredSkills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const { data } = await createJob(payload);
      navigate(`/jobs/${data.job._id}/applications`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12">
      <div className="cg-card">
        <h1 className="font-display text-2xl mb-1">Post a job</h1>
        <p className="text-zinc-400 text-sm mb-6">
          List an opening for students to discover and apply to.
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Title</label>
            <input className="cg-input" name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Description</label>
            <textarea
              className="cg-input min-h-[140px]"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              Required skills <span className="text-zinc-600">(comma-separated)</span>
            </label>
            <input
              className="cg-input"
              name="requiredSkills"
              placeholder="React, Node.js, MongoDB"
              value={form.requiredSkills}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Application deadline</label>
            <input
              className="cg-input"
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="cg-btn-primary w-full" disabled={submitting}>
            {submitting ? 'Posting...' : 'Post job'}
          </button>
        </form>
      </div>
    </div>
  );
}
