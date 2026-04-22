import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSun, FiMoon, FiPlus, FiLogOut, FiClock, FiBookOpen } from 'react-icons/fi';
import Dashboard from './components/Dashboard';
import StudyForm from './components/StudyForm';
import Analytics from './components/Analytics';
import AIPanel from './components/AIPanel';
import WeeklyReport from './components/WeeklyReport';
import Login from './components/Login';
import Chatbot from './components/Chatbot';
import './styles/globals.css';
import './styles/App.css';
import './styles/Login.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sessions, setSessions] = useState([]);
  const [insights, setInsights] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    fetchSessions();
    fetchInsights();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const fetchSessions = async () => {
    try {
      const response = await fetch('https://studydna-project3.onrender.com');
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchInsights = async () => {
    try {
      const response = await fetch('https://studydna-project3.onrender.com');
      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error('Error fetching insights:', error);
    }
  };

  const handleSessionAdded = () => {
    fetchSessions();
    fetchInsights();
    setShowFormModal(false);
    toast.success('Study session logged successfully! 🎉');
  };

  // Login function
  const handleLogin = (email, password) => {
    setLoading(true);
    setTimeout(() => {
      const userName = email.split('@')[0];
      const userData = {
        name: userName,
        email: email,
        loginTime: new Date().toISOString()
      };
      setUser(userData);
      setIsLoggedIn(true);
      setLoading(false);
      toast.success(`Welcome back, ${userName}! 🎉`);
    }, 1000);
  };

  // Register function
  const handleRegister = (name, email, password) => {
    setLoading(true);
    setTimeout(() => {
      const userData = {
        name: name,
        email: email,
        loginTime: new Date().toISOString()
      };
      setUser(userData);
      setIsLoggedIn(true);
      setLoading(false);
      toast.success(`Welcome to STUDYDNA, ${name}! 🎉`);
    }, 1000);
  };

  // LOGOUT FUNCTION - Simple and working
  const handleLogout = () => {
    console.log("Logout button clicked");
    setIsLoggedIn(false);
    setUser(null);
    toast.success('Logged out successfully!');
  };

  const totalHours = sessions.reduce((sum, s) => sum + (s.duration / 60), 0);
  const totalSessions = sessions.length;

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'log-session', label: '✏️ Log Session' },
    { id: 'analytics', label: '📈 Analytics' },
    { id: 'ai-insights', label: '🤖 AI Insights' },
    { id: 'weekly-report', label: '📝 Weekly Report' }
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} onRegister={handleRegister} loading={loading} />;
  }

  // Show main app if logged in
  return (
    <div className="app">
      <Toaster position="top-right" />
      
      <div className="animated-bg">
        <div className="gradient-sphere sphere-1"></div>
        <div className="gradient-sphere sphere-2"></div>
        <div className="gradient-sphere sphere-3"></div>
      </div>

      <header className="header">
        <div className="logo-section">
          <div className="logo-icon">🧬</div>
          <div>
            <h1>STUDYDNA</h1>
            <p className="tagline">AI-Powered Study Habit Analyzer</p>
          </div>
        </div>
        
        <div className="header-right">
          {/* Theme Toggle */}
          <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? <FiSun /> : <FiMoon />}
          </button>
          
          {/* Stats Badges */}
          <div className="stats-badges">
            <div className="stat-badge">
              <FiClock />
              <div>
                <small>Total Hours</small>
                <strong>{totalHours.toFixed(1)}h</strong>
              </div>
            </div>
            <div className="stat-badge">
              <FiBookOpen />
              <div>
                <small>Sessions</small>
                <strong>{totalSessions}</strong>
              </div>
            </div>
          </div>
          
          {/* User Info and Logout Button - Direct visible button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              padding: '5px 10px',
              background: 'var(--bg-primary)',
              borderRadius: '40px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                {user?.name || 'User'}
              </span>
            </div>
            
            <button 
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                border: 'none',
                borderRadius: '40px',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <FiLogOut /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <nav className="nav-tabs">
        {tabs.map(tab => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? 'active' : ''}
          >
            {tab.label}
          </motion.button>
        ))}
      </nav>

      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'dashboard' && <Dashboard sessions={sessions} insights={insights} />}
            {activeTab === 'log-session' && <StudyForm onSessionAdded={handleSessionAdded} />}
            {activeTab === 'analytics' && <Analytics sessions={sessions} />}
            {activeTab === 'ai-insights' && <AIPanel insights={insights} />}
            {activeTab === 'weekly-report' && <WeeklyReport insights={insights} sessions={sessions} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <motion.button className="fab" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowFormModal(true)}>
        <FiPlus />
      </motion.button>

      {showFormModal && (
        <div className="modal-overlay" onClick={() => setShowFormModal(false)}>
          <motion.div className="modal-content" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()}>
            <StudyForm onSessionAdded={handleSessionAdded} isModal={true} />
          </motion.div>
        </div>
      )}

      <Chatbot sessions={sessions} />
    </div>
  );
}

export default App;