import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signup(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="cg-card">
        <h1 className="font-display text-2xl mb-1">Create your account</h1>
        <p className="text-zinc-400 text-sm mb-6">Join CareerGenie as a student or recruiter</p>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Full name</label>
            <input className="cg-input" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Email</label>
            <input
              className="cg-input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Password</label>
            <input
              className="cg-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">I am a...</label>
            <select className="cg-input" name="role" value={form.role} onChange={handleChange}>
              <option value="student">Student</option>
              <option value="recruiter">Recruiter</option>
            </select>
          </div>
          <button type="submit" className="cg-btn-primary w-full" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="text-sm text-zinc-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
