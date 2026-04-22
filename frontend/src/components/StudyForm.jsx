import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiCalendar, FiBook, FiTarget, FiSave, FiX } from 'react-icons/fi';

const StudyForm = ({ onSessionAdded, isModal }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    duration: 60,
    subject: 'Mathematics',
    focusLevel: 7,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('https://studydna-project3.onrender.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        onSessionAdded();
        setFormData({
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          duration: 60,
          subject: 'Mathematics',
          focusLevel: 7,
          notes: ''
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save session');
      }
    } catch (error) {
      console.error('Error saving session:', error);
      setError('Cannot connect to server. Please make sure backend is running on port 5000');
    } finally {
      setLoading(false);
    }
  };

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 
    'Computer Science', 'English', 'History', 'Other'
  ];

  return (
    <motion.div 
      className="study-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!isModal && (
        <div className="form-header">
          <div className="form-icon">📝</div>
          <h2>Log Your Study Session</h2>
          <p>Track your learning journey</p>
        </div>
      )}
      
      {error && (
        <div className="form-error">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>
              <FiCalendar className="input-icon" />
              <span>Date</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FiClock className="input-icon" />
              <span>Time</span>
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              <FiBook className="input-icon" />
              <span>Subject</span>
            </label>
            <select name="subject" value={formData.subject} onChange={handleChange}>
              {subjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              <FiClock className="input-icon" />
              <span>Duration (minutes)</span>
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="5"
              max="480"
              step="5"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>
            <FiTarget className="input-icon" />
            <span>Focus Level: {formData.focusLevel}/10</span>
          </label>
          <div className="focus-slider">
            <input
              type="range"
              name="focusLevel"
              value={formData.focusLevel}
              onChange={handleChange}
              min="1"
              max="10"
              step="1"
            />
            <div className="focus-levels">
              <span>😫 Low</span>
              <span>😐 Medium</span>
              <span>😊 High</span>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Notes (Optional)</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            placeholder="What did you study? Any challenges or achievements?"
          />
        </div>

        <div className="form-buttons">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading"></span>
            ) : (
              <>
                <FiSave /> Save Session
              </>
            )}
          </button>
          {isModal && (
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => onSessionAdded()}
            >
              <FiX /> Cancel
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default StudyForm;