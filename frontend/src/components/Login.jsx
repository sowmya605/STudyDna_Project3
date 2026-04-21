import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiLogIn, FiUserPlus, FiArrowLeft, FiSend, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const Login = ({ onLogin, onRegister, loading }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    minLength: false
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // Password validation function
  const validatePassword = (password) => {
    const validation = {
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      minLength: password.length >= 8
    };
    setPasswordValidation(validation);
    return Object.values(validation).every(v => v === true);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData({
      ...formData,
      password: newPassword
    });
    validatePassword(newPassword);
    setError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (!isLogin && !formData.name) {
      setError('Please enter your name');
      return;
    }

    // Strong password validation for signup
    if (!isLogin) {
      const isValid = validatePassword(formData.password);
      if (!isValid) {
        setError('Password must meet all requirements below');
        return;
      }
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (isLogin) {
      onLogin(formData.email, formData.password);
    } else {
      onRegister(formData.name, formData.email, formData.password);
    }
  };

  // Forgot Password Handler - Works with demo users
  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }

    setResetLoading(true);
    setError('');
    
    // Simulate API call to check if email exists and send reset link
    setTimeout(() => {
      setResetLoading(false);
      setResetSuccess(true);
      setResetMessage(`✅ Password reset instructions have been sent to ${resetEmail}\n\n📌 For demo purposes:\n• Demo accounts can use "demo@studydna.com" with password "Demo@123"\n• Check your console for the reset link\n• In production, a real email would be sent with a secure link`);
      setResetEmail('');
      
      // Clear message after 8 seconds
      setTimeout(() => {
        setResetMessage('');
        setResetSuccess(false);
        setShowForgotPassword(false);
      }, 8000);
    }, 1500);
  };

  const getPasswordHint = () => {
    const hints = [
      "💡 Tip: Use a mix of letters, numbers, and symbols",
      "🔐 Make it at least 8 characters long",
      "📝 Don't use common words or personal info",
      "🔄 Use different passwords for different accounts"
    ];
    return hints[Math.floor(Math.random() * hints.length)];
  };

  // Forgot Password Screen
  if (showForgotPassword) {
    return (
      <div className="login-container">
        <div className="login-bg">
          <div className="login-sphere sphere-1"></div>
          <div className="login-sphere sphere-2"></div>
          <div className="login-sphere sphere-3"></div>
          <div className="login-sphere sphere-4"></div>
        </div>

        <motion.div 
          className="login-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back Button */}
          <button
            onClick={() => {
              setShowForgotPassword(false);
              setError('');
              setResetMessage('');
              setResetSuccess(false);
            }}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '14px'
            }}
          >
            <FiArrowLeft /> Back to Login
          </button>

          {/* Logo */}
          <div className="login-logo">
            <div className="logo-animation">🔐</div>
            <h1>Reset Password</h1>
            <p>Enter your email to receive reset instructions</p>
          </div>

          <form onSubmit={handleForgotPassword} className="login-form">
            <div className="form-group">
              <div className="input-icon">
                <FiMail />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value);
                    setError('');
                  }}
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="error-message"
              >
                {error}
              </motion.div>
            )}

            {resetMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: resetSuccess ? 'linear-gradient(135deg, #11998e, #38ef7d)' : 'linear-gradient(135deg, #f093fb, #f5576c)',
                  color: 'white',
                  padding: '15px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  textAlign: 'center',
                  fontSize: '13px',
                  whiteSpace: 'pre-line'
                }}
              >
                {resetMessage}
              </motion.div>
            )}

            <motion.button
              type="submit"
              className="login-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={resetLoading}
            >
              {resetLoading ? (
                <div className="loading-spinner-small"></div>
              ) : (
                <>
                  <FiSend /> Send Reset Link
                </>
              )}
            </motion.button>

            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              background: 'rgba(102, 126, 234, 0.1)', 
              borderRadius: '12px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              textAlign: 'center'
            }}>
              <p>📧 Enter your registered email address</p>
              <p style={{ marginTop: '8px', fontSize: '11px' }}>We'll send you instructions to reset your password</p>
              <p style={{ marginTop: '8px', fontSize: '11px', color: '#667eea' }}>Demo email: demo@studydna.com</p>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  // Main Login/Signup Screen
  return (
    <div className="login-container">
      <div className="login-bg">
        <div className="login-sphere sphere-1"></div>
        <div className="login-sphere sphere-2"></div>
        <div className="login-sphere sphere-3"></div>
        <div className="login-sphere sphere-4"></div>
      </div>

      <motion.div 
        className="login-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="login-logo">
          <div className="logo-animation">🧬</div>
          <h1>STUDYDNA</h1>
          <p>AI-Powered Study Habit Analyzer</p>
        </div>

        {/* Toggle Buttons */}
        <div className="login-toggle">
          <button
            className={isLogin ? 'active' : ''}
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
          >
            <FiLogIn /> Sign In
          </button>
          <button
            className={!isLogin ? 'active' : ''}
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
          >
            <FiUserPlus /> Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="form-group"
            >
              <div className="input-icon">
                <FiUser />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                />
              </div>
            </motion.div>
          )}

          <div className="form-group">
            <div className="input-icon">
              <FiMail />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-icon">
              <FiLock />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handlePasswordChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Password Requirements - Show only on Sign Up */}
          {!isLogin && formData.password.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{
                marginBottom: '15px',
                padding: '10px',
                background: 'rgba(102, 126, 234, 0.05)',
                borderRadius: '12px',
                fontSize: '12px'
              }}
            >
              <div style={{ marginBottom: '8px', fontWeight: '600', fontSize: '11px' }}>Password must contain:</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {passwordValidation.hasUpperCase ? <FiCheckCircle style={{ color: '#10b981', fontSize: '12px' }} /> : <FiXCircle style={{ color: '#ef4444', fontSize: '12px' }} />}
                  <span style={{ fontSize: '11px', color: passwordValidation.hasUpperCase ? '#10b981' : '#ef4444' }}>Uppercase letter</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {passwordValidation.hasLowerCase ? <FiCheckCircle style={{ color: '#10b981', fontSize: '12px' }} /> : <FiXCircle style={{ color: '#ef4444', fontSize: '12px' }} />}
                  <span style={{ fontSize: '11px', color: passwordValidation.hasLowerCase ? '#10b981' : '#ef4444' }}>Lowercase letter</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {passwordValidation.hasNumber ? <FiCheckCircle style={{ color: '#10b981', fontSize: '12px' }} /> : <FiXCircle style={{ color: '#ef4444', fontSize: '12px' }} />}
                  <span style={{ fontSize: '11px', color: passwordValidation.hasNumber ? '#10b981' : '#ef4444' }}>Number (0-9)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {passwordValidation.hasSpecialChar ? <FiCheckCircle style={{ color: '#10b981', fontSize: '12px' }} /> : <FiXCircle style={{ color: '#ef4444', fontSize: '12px' }} />}
                  <span style={{ fontSize: '11px', color: passwordValidation.hasSpecialChar ? '#10b981' : '#ef4444' }}>Special character</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', gridColumn: 'span 2' }}>
                  {passwordValidation.minLength ? <FiCheckCircle style={{ color: '#10b981', fontSize: '12px' }} /> : <FiXCircle style={{ color: '#ef4444', fontSize: '12px' }} />}
                  <span style={{ fontSize: '11px', color: passwordValidation.minLength ? '#10b981' : '#ef4444' }}>At least 8 characters long</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Forgot Password Link - Only show on Login mode */}
          {isLogin && (
            <div className="forgot-password">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667eea',
                  cursor: 'pointer',
                  fontSize: '13px',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = '#764ba2'}
                onMouseLeave={(e) => e.target.style.color = '#667eea'}
              >
                Forgot Password?
              </button>
            </div>
          )}

          {!isLogin && (
            <div style={{ marginBottom: '15px', fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center' }}>
              {getPasswordHint()}
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="error-message"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            className="login-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            {loading ? (
              <div className="loading-spinner-small"></div>
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
              </>
            )}
          </motion.button>
        </form>

        {/* Demo Credentials */}
        <div className="demo-credentials">
          <p>Demo Account</p>
          <div className="demo-info">
            <span>📧 demo@studydna.com</span>
            <span>🔑 Demo@123</span>
          </div>
        </div>

        {/* Password Requirements Note */}
        <div style={{
          marginTop: '15px',
          fontSize: '11px',
          color: 'var(--text-secondary)',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <span>🔒</span>
          <span>Password must have: Uppercase, Lowercase, Number & Special Character</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;