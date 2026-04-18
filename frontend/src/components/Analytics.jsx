import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiTrendingUp, FiAward, FiZap, FiBarChart2, FiStar, 
  FiActivity, FiSunrise, FiSunset, FiThumbsUp, FiTrendingDown,
  FiCalendar, FiTarget, FiClock, FiBookOpen
} from 'react-icons/fi';

const Analytics = ({ sessions }) => {
  const [stats, setStats] = useState({
    bestSubject: null,
    productiveHour: null,
    consistencyScore: 0,
    focusTrend: 0,
    totalSubjects: 0,
    bestFocusSubject: null,
    weakestSubject: null,
    avgDuration: 0,
    mostProductiveDay: null,
    streakDays: 0,
    improvementRate: 0,
    peakFocusTime: null,
    subjectMastery: {},
    weeklyGrowth: 0
  });

  useEffect(() => {
    if (sessions && sessions.length > 0) {
      calculateStats();
    }
  }, [sessions]);

  const calculateStats = () => {
    if (!sessions || sessions.length === 0) return;

    // Subject breakdown
    const subjectBreakdown = {};
    sessions.forEach(s => {
      if (!subjectBreakdown[s.subject]) {
        subjectBreakdown[s.subject] = { hours: 0, sessions: 0, focusSum: 0 };
      }
      subjectBreakdown[s.subject].hours += s.duration / 60;
      subjectBreakdown[s.subject].sessions += 1;
      subjectBreakdown[s.subject].focusSum += s.focusLevel;
    });
    
    Object.keys(subjectBreakdown).forEach(subject => {
      subjectBreakdown[subject].avgFocus = (subjectBreakdown[subject].focusSum / subjectBreakdown[subject].sessions).toFixed(1);
    });
    
    let bestSubject = null;
    let bestFocusSubject = null;
    let weakestSubject = null;
    let maxHours = 0;
    let maxFocus = 0;
    let minFocus = 10;
    
    Object.keys(subjectBreakdown).forEach(subject => {
      if (subjectBreakdown[subject].hours > maxHours) {
        maxHours = subjectBreakdown[subject].hours;
        bestSubject = subject;
      }
      const focusVal = parseFloat(subjectBreakdown[subject].avgFocus);
      if (focusVal > maxFocus) {
        maxFocus = focusVal;
        bestFocusSubject = subject;
      }
      if (focusVal < minFocus) {
        minFocus = focusVal;
        weakestSubject = subject;
      }
    });
    
    // Find productive hour
    const hourStats = {};
    sessions.forEach(s => {
      const hour = parseInt(s.time.split(':')[0]);
      if (!hourStats[hour]) hourStats[hour] = { total: 0, count: 0 };
      hourStats[hour].total += s.focusLevel;
      hourStats[hour].count++;
    });
    
    let productiveHour = null;
    let maxProductivity = 0;
    Object.keys(hourStats).forEach(hour => {
      const avg = hourStats[hour].total / hourStats[hour].count;
      if (avg > maxProductivity) {
        maxProductivity = avg;
        productiveHour = parseInt(hour);
      }
    });
    
    // Find peak focus time (best focus hour)
    let peakFocusTime = null;
    let maxFocusHour = 0;
    Object.keys(hourStats).forEach(hour => {
      const avg = hourStats[hour].total / hourStats[hour].count;
      if (avg > maxFocusHour) {
        maxFocusHour = avg;
        peakFocusTime = parseInt(hour);
      }
    });
    
    // Find most productive day
    const dayStats = {};
    sessions.forEach(s => {
      const day = new Date(s.date).getDay();
      if (!dayStats[day]) dayStats[day] = { total: 0, count: 0 };
      dayStats[day].total += s.focusLevel;
      dayStats[day].count++;
    });
    
    let mostProductiveDay = null;
    let maxDayFocus = 0;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    Object.keys(dayStats).forEach(day => {
      const avg = dayStats[day].total / dayStats[day].count;
      if (avg > maxDayFocus) {
        maxDayFocus = avg;
        mostProductiveDay = days[parseInt(day)];
      }
    });
    
    // Calculate streak
    const sortedDates = [...new Set(sessions.map(s => s.date))].sort();
    let currentStreak = 0;
    let tempStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i-1]);
      const curr = new Date(sortedDates[i]);
      const diff = (curr - prev) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      currentStreak = Math.max(currentStreak, tempStreak);
    }
    
    // Calculate improvement rate (compare first half vs second half)
    const midPoint = Math.floor(sessions.length / 2);
    const firstHalfAvg = sessions.slice(0, midPoint).reduce((sum, s) => sum + s.focusLevel, 0) / (midPoint || 1);
    const secondHalfAvg = sessions.slice(midPoint).reduce((sum, s) => sum + s.focusLevel, 0) / (sessions.length - midPoint || 1);
    const improvementRate = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    
    // Calculate weekly growth
    const lastWeek = sessions.filter(s => {
      const date = new Date(s.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    }).length;
    const previousWeek = sessions.filter(s => {
      const date = new Date(s.date);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= twoWeeksAgo && date < weekAgo;
    }).length;
    const weeklyGrowth = previousWeek === 0 ? 100 : ((lastWeek - previousWeek) / previousWeek) * 100;
    
    const totalSubjects = Object.keys(subjectBreakdown).length;
    const avgDuration = sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;
    const uniqueDays = [...new Set(sessions.map(s => s.date))].length;
    const consistencyScore = Math.min(100, Math.round((uniqueDays / 30) * 100));
    const focusTrend = (secondHalfAvg - firstHalfAvg).toFixed(1);
    
    setStats({
      bestSubject,
      bestFocusSubject,
      weakestSubject,
      productiveHour,
      peakFocusTime,
      mostProductiveDay,
      consistencyScore,
      focusTrend: parseFloat(focusTrend),
      totalSubjects,
      avgDuration: Math.round(avgDuration),
      streakDays: currentStreak,
      improvementRate: Math.round(improvementRate),
      weeklyGrowth: Math.round(weeklyGrowth),
      subjectMastery: subjectBreakdown
    });
  };

  if (!sessions || sessions.length === 0) {
    return (
      <div className="analytics-empty">
        <div className="empty-icon">📊</div>
        <h3>No Data Available</h3>
        <p>Log your first study session to see analytics!</p>
        <button className="primary-btn" onClick={() => {
          const logBtn = document.querySelector('.nav-tabs button:nth-child(2)');
          if (logBtn) logBtn.click();
        }}>Log Your First Session</button>
      </div>
    );
  }

  return (
    <motion.div className="analytics-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      
      {/* Header */}
      <div className="analytics-header-gradient">
        <div className="analytics-icon">📈</div>
        <h1>Advanced Study Analytics</h1>
        <p>Deep insights into your learning patterns and progress</p>
      </div>

      {/* Row 1: 4 Unique Stats Cards (Different from Dashboard) */}
      <div className="premium-stats-row">
        <div className="premium-stat-card">
          <div className="premium-stat-gradient purple">
            <FiTrendingUp />
          </div>
          <div className="premium-stat-content">
            <span className="premium-stat-label">Improvement Rate</span>
            <span className="premium-stat-value" style={{ color: stats.improvementRate >= 0 ? '#10b981' : '#ef4444' }}>
              {stats.improvementRate >= 0 ? `+${stats.improvementRate}%` : `${stats.improvementRate}%`}
            </span>
            <span className="premium-stat-trend">{stats.improvementRate >= 0 ? 'Getting better! 📈' : 'Needs attention 📉'}</span>
          </div>
        </div>
        <div className="premium-stat-card">
          <div className="premium-stat-gradient blue">
            <FiAward />
          </div>
          <div className="premium-stat-content">
            <span className="premium-stat-label">Study Streak</span>
            <span className="premium-stat-value">{stats.streakDays} <small>days</small></span>
            <span className="premium-stat-trend">{stats.streakDays >= 5 ? 'On fire! 🔥' : 'Keep going! 💪'}</span>
          </div>
        </div>
        <div className="premium-stat-card">
          <div className="premium-stat-gradient green">
            <FiBarChart2 />
          </div>
          <div className="premium-stat-content">
            <span className="premium-stat-label">Subjects Explored</span>
            <span className="premium-stat-value">{stats.totalSubjects}</span>
            <span className="premium-stat-trend">Keep diversifying! 📚</span>
          </div>
        </div>
        <div className="premium-stat-card">
          <div className="premium-stat-gradient orange">
            <FiActivity />
          </div>
          <div className="premium-stat-content">
            <span className="premium-stat-label">Weekly Growth</span>
            <span className="premium-stat-value" style={{ color: stats.weeklyGrowth >= 0 ? '#10b981' : '#ef4444' }}>
              {stats.weeklyGrowth >= 0 ? `+${stats.weeklyGrowth}%` : `${stats.weeklyGrowth}%`}
            </span>
            <span className="premium-stat-trend">vs last week</span>
          </div>
        </div>
      </div>

      {/* Row 2: 3 Performance Cards */}
      <div className="premium-insight-row">
        <div className="premium-insight-card">
          <div className="insight-glow purple">
            <div className="insight-emoji">⭐</div>
          </div>
          <div className="insight-text">
            <h4>Best Subject (Focus)</h4>
            <div className="insight-main">{stats.bestFocusSubject || 'N/A'}</div>
            <div className="insight-sub">Highest average focus</div>
          </div>
        </div>
        <div className="premium-insight-card">
          <div className="insight-glow blue">
            <div className="insight-emoji">🎯</div>
          </div>
          <div className="insight-text">
            <h4>Most Studied Subject</h4>
            <div className="insight-main">{stats.bestSubject || 'N/A'}</div>
            <div className="insight-sub">Most time invested</div>
          </div>
        </div>
        <div className="premium-insight-card">
          <div className="insight-glow orange">
            <div className="insight-emoji">⚠️</div>
          </div>
          <div className="insight-text">
            <h4>Needs Improvement</h4>
            <div className="insight-main">{stats.weakestSubject || 'N/A'}</div>
            <div className="insight-sub">Lowest focus subject</div>
          </div>
        </div>
      </div>

      {/* Row 3: Time Optimization Cards */}
      <div className="premium-large-row">
        <div className="premium-large-card">
          <div className="large-card-gradient">
            <FiSunrise />
          </div>
          <div className="large-card-content">
            <h4>Peak Productivity Hour</h4>
            <div className="large-value">{stats.productiveHour ? `${stats.productiveHour}:00 - ${stats.productiveHour+1}:00` : 'Log more sessions'}</div>
            <div className="large-sub">Your brain works best during these hours! ⚡</div>
            <div className="productivity-tip">💡 Schedule difficult subjects here</div>
          </div>
        </div>
        <div className="premium-large-card">
          <div className="large-card-gradient green">
            <FiSunset />
          </div>
          <div className="large-card-content">
            <h4>Best Focus Time</h4>
            <div className="large-value">{stats.peakFocusTime ? `${stats.peakFocusTime}:00` : 'Log more sessions'}</div>
            <div className="large-sub">Highest focus level recorded</div>
            <div className="productivity-tip">🎯 Save important topics for this time</div>
          </div>
        </div>
      </div>

      {/* Row 4: Consistency & Day Analysis */}
      <div className="premium-consistency-card">
        <div className="consistency-gradient">
          <div className="consistency-icon">📅</div>
          <div className="consistency-stats">
            <div className="consistency-item">
              <span>Consistency Score</span>
              <div className="consistency-value">{stats.consistencyScore}%</div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${stats.consistencyScore}%` }}></div>
              </div>
            </div>
            <div className="consistency-divider"></div>
            <div className="consistency-item">
              <span>Most Productive Day</span>
              <div className="bestday-value">{stats.mostProductiveDay || 'N/A'}</div>
              <div className="bestday-message">Your highest focus day</div>
            </div>
            <div className="consistency-divider"></div>
            <div className="consistency-item">
              <span>Focus Trend</span>
              <div className="streak-value" style={{ color: stats.focusTrend >= 0 ? '#10b981' : '#ef4444' }}>
                {stats.focusTrend >= 0 ? `+${stats.focusTrend}` : stats.focusTrend}
              </div>
              <div className="streak-message">{stats.focusTrend >= 0 ? 'Improving 📈' : 'Needs attention 📉'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 5: Subject Mastery Grid */}
      <div className="premium-subject-section">
        <h3><FiBarChart2 /> Subject Mastery Analysis</h3>
        <div className="premium-subject-grid">
          {Object.entries(stats.subjectMastery).map(([subject, data]) => (
            <div key={subject} className="premium-subject-card">
              <div className="subject-card-header">
                <span className="subject-name">{subject}</span>
                <span className="subject-badge">{data.sessions} sessions</span>
              </div>
              <div className="subject-card-stats">
                <div className="subject-stat">
                  <span>Total Hours</span>
                  <strong>{data.hours.toFixed(1)}h</strong>
                </div>
                <div className="subject-stat">
                  <span>Average Focus</span>
                  <div className="focus-bar-container">
                    <div className="focus-bar-fill" style={{ width: `${(parseFloat(data.avgFocus) / 10) * 100}%` }}></div>
                    <strong>{data.avgFocus}/10</strong>
                  </div>
                </div>
                <div className="subject-stat">
                  <span>Mastery Score</span>
                  <div className="efficiency-score">
                    <div className="efficiency-fill" style={{ width: `${(parseFloat(data.avgFocus) * (data.hours / 10))}%` }}></div>
                    <strong>{Math.min(100, Math.round((parseFloat(data.avgFocus) * data.hours) / 5))}%</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 6: Smart Recommendations */}
      <div className="premium-recommendations">
        <h3><FiThumbsUp /> Personalized Insights</h3>
        <div className="recommendations-premium-grid">
          {stats.consistencyScore < 60 && (
            <div className="premium-rec-card">
              <div className="rec-premium-icon">📅</div>
              <div className="rec-premium-content">
                <strong>Build Consistency</strong>
                <p>Study for 30 minutes daily to build a powerful learning habit</p>
                <div className="rec-action">🎯 Try studying at the same time each day</div>
              </div>
            </div>
          )}
          {stats.productiveHour && (
            <div className="premium-rec-card">
              <div className="rec-premium-icon">⏰</div>
              <div className="rec-premium-content">
                <strong>Leverage Peak Hours</strong>
                <p>Your brain is most active at {stats.productiveHour}:00 - schedule tough subjects now!</p>
                <div className="rec-action">⚡ Save easy tasks for low-energy periods</div>
              </div>
            </div>
          )}
          {stats.weakestSubject && (
            <div className="premium-rec-card">
              <div className="rec-premium-icon">🎯</div>
              <div className="rec-premium-content">
                <strong>Focus on {stats.weakestSubject}</strong>
                <p>This subject needs more attention. Try breaking it into smaller chunks.</p>
                <div className="rec-action">📚 Spend 15 extra minutes daily on this subject</div>
              </div>
            </div>
          )}
          <div className="premium-rec-card">
            <div className="rec-premium-icon">💪</div>
            <div className="rec-premium-content">
              <strong>Optimal Session Length</strong>
              <p>Your average session is {stats.avgDuration} minutes. {stats.avgDuration > 60 ? 'Consider taking more breaks' : 'Great job staying focused!'}</p>
              <div className="rec-action">🧘 Take a 5-min break every 45 minutes</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Analytics;