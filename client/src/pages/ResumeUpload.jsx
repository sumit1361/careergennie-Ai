import { useState } from 'react';
import { uploadResume } from '../utils/api.js';

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type !== 'application/pdf') {
      setError('Please choose a PDF file.');
      setFile(null);
      return;
    }
    setError('');
    setFile(selected || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!file) {
      setError('Please attach your resume as a PDF.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobDescription', jobDescription);

      const { data } = await uploadResume(formData);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 space-y-6">
      <div className="cg-card">
        <h1 className="font-display text-2xl mb-1">Analyze your resume</h1>
        <p className="text-zinc-400 text-sm mb-6">
          Upload your resume as a PDF and, optionally, paste a job description to get an
          AI-driven score, matched skills, and improvement suggestions.
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Resume (PDF)</label>
            <input
              className="cg-input file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:text-zinc-950 file:px-3 file:py-1.5 file:text-sm file:font-semibold"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              required
            />
            {file && <p className="text-xs text-zinc-500 mt-1">{file.name}</p>}
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Job description (optional)</label>
            <textarea
              className="cg-input min-h-[120px]"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
          <button type="submit" className="cg-btn-primary w-full" disabled={submitting}>
            {submitting ? 'Analyzing...' : 'Analyze resume'}
          </button>
        </form>
      </div>

      {result && (
        <div className="cg-card">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-xl">Results</h2>
            <span className="text-accent font-display text-3xl">
              {result.resume.aiFeedback.score}
              <span className="text-zinc-500 text-base">/100</span>
            </span>
          </div>

          {result.matchPercentage !== null && (
            <p className="text-sm text-zinc-300 mb-4">
              Match against job description:{' '}
              <span className="text-accent font-semibold">{result.matchPercentage}%</span>
            </p>
          )}

          <div className="mb-4">
            <h3 className="text-xs uppercase tracking-wide text-zinc-500 mb-2">Detected skills</h3>
            <div className="flex flex-wrap gap-2">
              {result.resume.parsedProfile.skills.map((skill) => (
                <span
                  key={skill}
                  className="text-xs bg-surface-raised border border-zinc-700 rounded-full px-3 py-1"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-wide text-zinc-500 mb-2">Suggestions</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-zinc-300">
              {result.resume.aiFeedback.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
