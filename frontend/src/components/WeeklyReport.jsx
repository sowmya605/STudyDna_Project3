import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiTarget, FiBookOpen, FiCalendar, FiTrendingUp, FiAward, FiBarChart2, FiSun, FiMoon } from 'react-icons/fi';

const WeeklyReport = ({ insights, sessions }) => {
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateReport();
  }, [sessions]);

  const generateReport = () => {
    setLoading(true);
    
    if (!sessions || sessions.length === 0) {
      setWeeklyData(null);
      setLoading(false);
      return;
    }
    
    // Get last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }
    
    const weeklySessions = sessions.filter(s => last7Days.includes(s.date));
    
    if (weeklySessions.length === 0) {
      setWeeklyData(null);
      setLoading(false);
      return;
    }
    
    const totalHours = weeklySessions.reduce((sum, s) => sum + (s.duration / 60), 0);
    const avgFocus = weeklySessions.reduce((sum, s) => sum + s.focusLevel, 0) / weeklySessions.length;
    
    const subjectCount = {};
    weeklySessions.forEach(s => {
      subjectCount[s.subject] = (subjectCount[s.subject] || 0) + 1;
    });
    
    let topSubject = 'None';
    let maxCount = 0;
    Object.keys(subjectCount).forEach(subject => {
      if (subjectCount[subject] > maxCount) {
        maxCount = subjectCount[subject];
        topSubject = subject;
      }
    });
    
    const dailyBreakdown = last7Days.map(date => {
      const daySessions = weeklySessions.filter(s => s.date === date);
      const dayHours = daySessions.reduce((sum, s) => sum + (s.duration / 60), 0);
      const dayFocus = daySessions.length > 0 
        ? daySessions.reduce((sum, s) => sum + s.focusLevel, 0) / daySessions.length 
        : 0;
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hours: dayHours,
        focus: dayFocus,
        sessions: daySessions.length
      };
    });
    
    const daysStudied = dailyBreakdown.filter(d => d.sessions > 0).length;
    const consistencyRate = (daysStudied / 7) * 100;
    
    let performanceLevel = '';
    let performanceMessage = '';
    if (totalHours > 20 && avgFocus > 7) {
      performanceLevel = 'excellent';
      performanceMessage = 'Outstanding! You\'re in the top tier of learners! 🏆';
    } else if (totalHours > 15 && avgFocus > 6) {
      performanceLevel = 'great';
      performanceMessage = 'Great progress! Your study habits are showing results! 🌟';
    } else if (totalHours > 10) {
      performanceLevel = 'good';
      performanceMessage = 'Good effort! Consistency is key to improvement! 📈';
    } else if (totalHours > 5) {
      performanceLevel = 'average';
      performanceMessage = 'Solid start! Increase frequency for better results! 💪';
    } else {
      performanceLevel = 'starting';
      performanceMessage = 'Every session counts! Keep building momentum! 🌱';
    }
    
    setWeeklyData({
      totalHours: totalHours.toFixed(1),
      avgFocus: avgFocus.toFixed(1),
      totalSessions: weeklySessions.length,
      topSubject,
      consistencyRate: Math.round(consistencyRate),
      dailyBreakdown,
      performanceLevel,
      performanceMessage,
      daysStudied,
      totalHoursRaw: totalHours
    });
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="weekly-loading">
        <div className="loading-animation">
          <div className="loader"></div>
          <p>Analyzing your study patterns...</p>
        </div>
      </div>
    );
  }

  if (!weeklyData) {
    return (
      <div className="weekly-empty">
        <div className="empty-state-icon">📊</div>
        <h3>No Data for This Week</h3>
        <p>You haven't logged any study sessions in the last 7 days.</p>
        <button className="primary-btn" onClick={() => {
          const logBtn = document.querySelector('.nav-tabs button:nth-child(2)');
          if (logBtn) logBtn.click();
        }}>Log Your First Session</button>
      </div>
    );
  }

  // Find max values for chart scaling
  const maxHours = Math.max(...weeklyData.dailyBreakdown.map(d => d.hours), 1);
  const maxFocus = Math.max(...weeklyData.dailyBreakdown.map(d => d.focus), 5);

  return (
    <motion.div className="weekly-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      
      {/* Header */}
      <div className="weekly-header">
        <div className="weekly-icon">📋</div>
        <h2>Weekly Performance Report</h2>
        <p>Your study journey from the past 7 days</p>
      </div>

      {/* Performance Banner */}
      <div className={`performance-banner ${weeklyData.performanceLevel}`}>
        <div className="banner-icon">
          {weeklyData.performanceLevel === 'excellent' ? '🏆' : 
           weeklyData.performanceLevel === 'great' ? '🌟' :
           weeklyData.performanceLevel === 'good' ? '📈' : '💪'}
        </div>
        <div className="banner-content">
          <h4>Week {weeklyData.daysStudied}/7 days studied</h4>
          <p>{weeklyData.performanceMessage}</p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="weekly-stats-row">
        <div className="weekly-stat-card">
          <div className="stat-icon-bg purple"><FiClock /></div>
          <div className="stat-info">
            <span>Total Hours</span>
            <strong>{weeklyData.totalHours} hrs</strong>
          </div>
        </div>
        <div className="weekly-stat-card">
          <div className="stat-icon-bg blue"><FiTarget /></div>
          <div className="stat-info">
            <span>Avg Focus</span>
            <strong>{weeklyData.avgFocus}/10</strong>
          </div>
        </div>
        <div className="weekly-stat-card">
          <div className="stat-icon-bg green"><FiBookOpen /></div>
          <div className="stat-info">
            <span>Top Subject</span>
            <strong>{weeklyData.topSubject}</strong>
          </div>
        </div>
        <div className="weekly-stat-card">
          <div className="stat-icon-bg orange"><FiCalendar /></div>
          <div className="stat-info">
            <span>Consistency</span>
            <strong>{weeklyData.consistencyRate}%</strong>
          </div>
        </div>
      </div>

      {/* Beautiful Bar Chart Section */}
      <div className="chart-container">
        <div className="chart-header">
          <h3><FiBarChart2 /> Daily Study Pattern</h3>
          <div className="chart-legend">
            <div className="legend-item"><div className="legend-color hours"></div><span>Study Hours</span></div>
            <div className="legend-item"><div className="legend-color focus"></div><span>Focus Level</span></div>
          </div>
        </div>
        
        <div className="bar-chart-wrapper">
          {weeklyData.dailyBreakdown.map((day, idx) => (
            <div key={idx} className="bar-column">
              <div className="bar-label">{day.date}</div>
              <div className="bars-container">
                <div className="bar-wrapper">
                  <div 
                    className="hours-bar" 
                    style={{ height: `${(day.hours / maxHours) * 120}px` }}
                  >
                    <span className="bar-tooltip">{day.hours}h</span>
                  </div>
                  <span className="bar-value">{day.hours}h</span>
                </div>
                <div className="bar-wrapper">
                  <div 
                    className="focus-bar" 
                    style={{ height: `${(day.focus / maxFocus) * 120}px` }}
                  >
                    <span className="bar-tooltip">{day.focus.toFixed(1)}</span>
                  </div>
                  <span className="bar-value">{day.focus.toFixed(1)}</span>
                </div>
              </div>
              <div className="bar-sessions">{day.sessions} session{day.sessions !== 1 ? 's' : ''}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Details Table */}
      <div className="daily-details">
        <h3><FiCalendar /> Daily Breakdown</h3>
        <div className="details-table">
          <div className="table-header">
            <span>Day</span>
            <span>Date</span>
            <span>Hours</span>
            <span>Focus</span>
            <span>Sessions</span>
          </div>
          {weeklyData.dailyBreakdown.map((day, idx) => (
            <div key={idx} className="table-row">
              <span className="day-name">{day.date}</span>
              <span className="date">{day.fullDate}</span>
              <span className="hours">{day.hours}h</span>
              <span className="focus">
                <div className="focus-indicator">
                  <div className="focus-progress" style={{ width: `${(day.focus / 10) * 100}%` }}></div>
                  <span>{day.focus.toFixed(1)}/10</span>
                </div>
              </span>
              <span className="sessions">{day.sessions}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements Section */}
      <div className="achievements-weekly">
        <h3><FiAward /> Key Achievements</h3>
        <div className="achievements-weekly-grid">
          {weeklyData.daysStudied >= 5 && (
            <div className="achievement-weekly-card">
              <div className="achievement-icon">🎯</div>
              <div className="achievement-text">
                <strong>Consistency Champion</strong>
                <p>Studied on {weeklyData.daysStudied} out of 7 days</p>
              </div>
            </div>
          )}
          {weeklyData.avgFocus >= 7 && (
            <div className="achievement-weekly-card">
              <div className="achievement-icon">🧠</div>
              <div className="achievement-text">
                <strong>Focus Master</strong>
                <p>Average focus of {weeklyData.avgFocus}/10</p>
              </div>
            </div>
          )}
          {weeklyData.totalHoursRaw >= 15 && (
            <div className="achievement-weekly-card">
              <div className="achievement-icon">📚</div>
              <div className="achievement-text">
                <strong>Dedicated Learner</strong>
                <p>{weeklyData.totalHours} hours of focused study</p>
              </div>
            </div>
          )}
          <div className="achievement-weekly-card">
            <div className="achievement-icon">📈</div>
            <div className="achievement-text">
              <strong>Progress Tracker</strong>
              <p>{weeklyData.totalSessions} sessions completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Next Week Goals */}
      <div className="goals-weekly">
        <h3>🎯 Goals for Next Week</h3>
        <div className="goals-weekly-grid">
          <div className="goal-weekly-card">
            <input type="checkbox" id="goal1" />
            <label htmlFor="goal1">Study at least {weeklyData.consistencyRate < 70 ? '5 days' : 'every day'} next week</label>
          </div>
          <div className="goal-weekly-card">
            <input type="checkbox" id="goal2" />
            <label htmlFor="goal2">Increase average focus by {weeklyData.avgFocus < 7 ? '1 point' : 'maintaining high focus'}</label>
          </div>
          <div className="goal-weekly-card">
            <input type="checkbox" id="goal3" />
            <label htmlFor="goal3">Complete {weeklyData.totalSessions + 5} study sessions</label>
          </div>
          <div className="goal-weekly-card">
            <input type="checkbox" id="goal4" />
            <label htmlFor="goal4">Review and revise {weeklyData.topSubject !== 'None' ? weeklyData.topSubject : 'your weakest subject'}</label>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WeeklyReport;