import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './index.css';
import DashboardRouter from './components/DashboardRouter';
import { FieldDetailPage } from './pages/FieldDetailPage';
import { AlertsPage } from './pages/AlertsPage';
import { ReportsPage } from './pages/ReportsPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import ImageAnalysisPage from './pages/ImageAnalysisPage';
import HyperspectralPage from './pages/HyperspectralPage';
import { LandingPage } from './pages/LandingPage';

// Component to handle authenticated routes
const AuthenticatedApp: React.FC<{ user: any; onLogout: () => void; onLogin: (userData: any) => void; onSignup: (userData: any) => void }> = ({ user, onLogout, onLogin, onSignup }) => {
  const location = useLocation();
  
  // Don't show header on landing, login, or signup pages
  const hideHeader = ['/', '/login', '/signup'].includes(location.pathname);

  return (
    <>
      {!hideHeader && (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-soft" style={{backgroundColor: 'var(--agricare-light)'}}>
                <span className="font-heading text-xl" style={{color: 'var(--agricare-primary)'}}>🌱</span>
              </div>
              <div>
                <h1 className="text-xl font-heading font-semibold" style={{color: 'var(--agricare-primary)'}}>AgriCare</h1>
                <p className="text-sm text-gray-600 -mt-1">Smart Agriculture Solutions</p>
              </div>
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              {/* Basic navigation for all users */}
              <Link to="/alerts" className="text-gray-600 hover:text-green-600 transition-colors">Alerts</Link>
              <Link to="/reports" className="text-gray-600 hover:text-green-600 transition-colors">Reports</Link>
              
              {/* Advanced tools only for researchers, students, and consultants */}
              {(user?.role === 'researcher' || user?.role === 'student' || user?.role === 'consultant') && (
                <>
                  <Link to="/hyperspectral" className="text-gray-600 hover:text-green-600 transition-colors">Hyperspectral Analysis</Link>
                  <Link to="/image-analysis" className="text-gray-600 hover:text-green-600 transition-colors">Image Analysis</Link>
                </>
              )}
              
              <div className="flex items-center gap-4">
                <div className="text-gray-600 text-xs">
                  <span className="font-medium">{user?.name || 'User'}</span>
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs capitalize">
                    {user?.role || 'farmer'}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="text-gray-600 hover:text-red-500 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </nav>
          </div>
        </header>
      )}
      <main className={hideHeader ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardRouter user={user} />} />
          <Route path="/fields/:id" element={<FieldDetailPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/hyperspectral" element={<HyperspectralPage />} />
          <Route path="/image-analysis" element={<ImageAnalysisPage />} />
          <Route path="/login" element={<LoginPage onLogin={onLogin} />} />
          <Route path="/signup" element={<SignupPage onSignup={onSignup} />} />
        </Routes>
      </main>
    </>
  );
};

function App() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('agricare_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('agricare_user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('agricare_user', JSON.stringify(userData));
  };

  const handleSignup = (userData: any) => {
    setUser(userData);
    localStorage.setItem('agricare_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('agricare_user');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AgriCare...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user ? (
          <AuthenticatedApp user={user} onLogout={handleLogout} onLogin={handleLogin} onSignup={handleSignup} />
        ) : (
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/signup" element={<SignupPage onSignup={handleSignup} />} />
            {/* Redirect to landing page for any other route when not authenticated */}
            <Route path="*" element={<LandingPage />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
