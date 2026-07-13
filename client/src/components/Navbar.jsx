import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b border-zinc-800 bg-surface-raised/60 backdrop-blur sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-display text-lg text-accent">
          CareerGenie
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link to="/jobs" className="text-zinc-300 hover:text-white">
            Jobs
          </Link>
          {isAuthenticated && user?.role === 'student' && (
            <>
              <Link to="/dashboard/student" className="text-zinc-300 hover:text-white">
                Dashboard
              </Link>
              <Link to="/resume" className="text-zinc-300 hover:text-white">
                Resume Analyzer
              </Link>
              <Link to="/applications/mine" className="text-zinc-300 hover:text-white">
                My Applications
              </Link>
            </>
          )}
          {isAuthenticated && user?.role === 'recruiter' && (
            <>
              <Link to="/dashboard/recruiter" className="text-zinc-300 hover:text-white">
                Dashboard
              </Link>
              <Link to="/jobs/new" className="text-zinc-300 hover:text-white">
                Post a Job
              </Link>
            </>
          )}
          {isAuthenticated && user?.role === 'admin' && (
            <Link to="/admin" className="text-zinc-300 hover:text-white">
              Admin
            </Link>
          )}
          {isAuthenticated ? (
            <button onClick={handleLogout} className="text-zinc-300 hover:text-white">
              Log out ({user.name})
            </button>
          ) : (
            <>
              <Link to="/login" className="text-zinc-300 hover:text-white">
                Log in
              </Link>
              <Link to="/signup" className="cg-btn-primary !px-3 !py-1.5">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
