import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import JobBoard from './pages/JobBoard.jsx';
import JobDetails from './pages/JobDetails.jsx';
import ResumeUpload from './pages/ResumeUpload.jsx';
import CreateJob from './pages/CreateJob.jsx';
import JobApplications from './pages/JobApplications.jsx';
import MyApplications from './pages/MyApplications.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import RecruiterDashboard from './pages/RecruiterDashboard.jsx';
import AdminPanel from './pages/AdminPanel.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-surface-base">
      <Navbar />
      <main className="px-4 pb-16">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/jobs" element={<JobBoard />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/dashboard/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <ResumeUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications/mine"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <MyApplications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/recruiter"
            element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/new"
            element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <CreateJob />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/:jobId/applications"
            element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <JobApplications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
