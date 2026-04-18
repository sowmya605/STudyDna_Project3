
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBell, FiClock, FiAlertCircle, FiTarget, FiCheckCircle, 
  FiBarChart2, FiTrendingUp, FiTrendingDown, FiCalendar,
  FiStar, FiActivity, FiZap, FiBookOpen, FiAward
} from 'react-icons/fi';

const SmartFeatures = ({ sessions }) => {
  // Feature 1 & 3: Track study patterns & missed slots
  const [studyPatterns, setStudyPatterns] = useState({
    usualTimes: [],
    missedSlots: [],
    todayStatus: ''
  });
  
  // Feature 4: Goal Tracker
  const [dailyGoal, setDailyGoal] = useState({
    enabled: false,
    targetSubjects: 3,
    targetHours: 2,
    goalType: 'unique', // 'unique' for different subjects, 'total' for total entries
    progress: { 
      subjects: 0, 
      hours: 0, 
      subjectsPercentage: 0, 
      hoursPercentage: 0,
      subjectsCompleted: [],
      totalSubjectEntries: 0,
      timeAllocation: {},
      todaySessions: []
    }
  });
  
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [tempGoal, setTempGoal] = useState({ targetSubjects: 3, targetHours: 2, goalType: 'unique' });
  
  // Feature 5: Subject Improvement Percentage
  const [subjectImprovement, setSubjectImprovement] = useState({});
  
  // Reminder state
  const [reminder, setReminder] = useState(null);

  // Analytics stats for display
  const [analytics, setAnalytics] = useState({
    improvementRate: 0,
    improvementMessage: '',
    subjectsExplored: 0,
    weeklyGrowth: 0,
    weeklyGrowthMessage: '',
    bestFocusSubject: null,
    mostStudiedSubject: null,
    weakestSubject: null,
    peakProductivityHour: null,
    bestFocusTime: null,
    totalHours: 0,
    totalSessions: 0,
    avgFocus: 0,
    hasEnoughData: false
  });

  // Load data when sessions change
  useEffect(() => {
    if (sessions && sessions.length > 0) {
      calculateAnalytics();
      analyzeStudyPatterns();
      calculateSubjectImprovement();
      checkGoalProgress();
    }
  }, [sessions]);

  // Load saved goal from localStorage
  useEffect(() => {
    const savedGoal = localStorage.getItem('studydna_daily_goal');
    if (savedGoal) {
      const parsedGoal = JSON.parse(savedGoal);
      setDailyGoal(parsedGoal);
      setTempGoal({
        targetSubjects: parsedGoal.targetSubjects,
        targetHours: parsedGoal.targetHours,
        goalType: parsedGoal.goalType || 'unique'
      });
    }
  }, []);

  // Check for reminders periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (sessions && sessions.length > 0) {
        checkForReminders();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [sessions, studyPatterns, dailyGoal]);

  // ========== IMPROVEMENT RATE CALCULATION ==========
  const calculateImprovementRate = () => {
    if (!sessions || sessions.length < 2) {
      return { rate: 0, message: "Need more sessions (at least 2)" };
    }
    
    const sortedSessions = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));
    const earlyCount = Math.max(1, Math.floor(sortedSessions.length * 0.3));
    const earlySessions = sortedSessions.slice(0, earlyCount);
    const recentCount = Math.max(1, Math.floor(sortedSessions.length * 0.3));
    const recentSessions = sortedSessions.slice(-recentCount);
    
    const earlyAvgFocus = earlySessions.reduce((sum, s) => sum + s.focusLevel, 0) / earlySessions.length;
    const recentAvgFocus = recentSessions.reduce((sum, s) => sum + s.focusLevel, 0) / recentSessions.length;
    
    let improvementRate = 0;
    if (earlyAvgFocus > 0) {
      improvementRate = ((recentAvgFocus - earlyAvgFocus) / earlyAvgFocus) * 100;
    } else if (recentAvgFocus > 0) {
      improvementRate = 100;
    }
    
    let message = "";
    if (improvementRate > 20) message = "Excellent progress! 🚀";
    else if (improvementRate > 10) message = "Great improvement! 📈";
    else if (improvementRate > 0) message = "Getting better! 👍";
    else if (improvementRate === 0) message = "Steady pace! 🎯";
    else if (improvementRate > -10) message = "Slight dip, keep going! 💪";
    else message = "Needs attention, review your strategy! ⚠️";
    
    return { rate: improvementRate, message: message };
  };

  // ========== MAIN ANALYTICS CALCULATION ==========
  const calculateAnalytics = () => {
    if (!sessions || sessions.length === 0) return;

    const totalHours = sessions.reduce((sum, s) => sum + (s.duration / 60), 0);
    const totalSessions = sessions.length;
    const avgFocus = sessions.reduce((sum, s) => sum + s.focusLevel, 0) / sessions.length;

    const uniqueSubjects = [...new Set(sessions.map(s => s.subject))];
    const subjectsExplored = uniqueSubjects.length;

    const subjectStats = {};
    sessions.forEach(session => {
      if (!subjectStats[session.subject]) {
        subjectStats[session.subject] = {
          totalHours: 0,
          totalSessions: 0,
          focusSum: 0,
          avgFocus: 0
        };
      }
      subjectStats[session.subject].totalHours += session.duration / 60;
      subjectStats[session.subject].totalSessions += 1;
      subjectStats[session.subject].focusSum += session.focusLevel;
    });

    Object.keys(subjectStats).forEach(subject => {
      subjectStats[subject].avgFocus = subjectStats[subject].focusSum / subjectStats[subject].totalSessions;
    });

    let bestFocusSubject = null;
    let highestFocus = 0;
    let mostStudiedSubject = null;
    let mostHours = 0;
    let weakestSubject = null;
    let lowestFocus = 10;

    Object.keys(subjectStats).forEach(subject => {
      if (subjectStats[subject].avgFocus > highestFocus) {
        highestFocus = subjectStats[subject].avgFocus;
        bestFocusSubject = subject;
      }
      if (subjectStats[subject].totalHours > mostHours) {
        mostHours = subjectStats[subject].totalHours;
        mostStudiedSubject = subject;
      }
      if (subjectStats[subject].avgFocus < lowestFocus) {
        lowestFocus = subjectStats[subject].avgFocus;
        weakestSubject = subject;
      }
    });

    const improvement = calculateImprovementRate();

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const last7DaysStart = new Date(today);
    last7DaysStart.setDate(today.getDate() - 6);
    last7DaysStart.setHours(0, 0, 0, 0);
    
    const previous7DaysStart = new Date(last7DaysStart);
    previous7DaysStart.setDate(last7DaysStart.getDate() - 7);
    const previous7DaysEnd = new Date(last7DaysStart);
    previous7DaysEnd.setDate(last7DaysStart.getDate() - 1);
    
    const lastWeekSessions = sessions.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate >= last7DaysStart && sessionDate <= today;
    });
    
    const previousWeekSessions = sessions.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate >= previous7DaysStart && sessionDate <= previous7DaysEnd;
    });
    
    const lastWeekHours = lastWeekSessions.reduce((sum, s) => sum + (s.duration / 60), 0);
    const previousWeekHours = previousWeekSessions.reduce((sum, s) => sum + (s.duration / 60), 0);
    
    let weeklyGrowth = 0;
    let weeklyGrowthMessage = "";
    
    if (previousWeekHours > 0) {
      weeklyGrowth = ((lastWeekHours - previousWeekHours) / previousWeekHours) * 100;
      if (weeklyGrowth > 50) weeklyGrowthMessage = "Amazing growth! 🌟";
      else if (weeklyGrowth > 25) weeklyGrowthMessage = "Strong increase! 📈";
      else if (weeklyGrowth > 0) weeklyGrowthMessage = "Positive trend! 👍";
      else if (weeklyGrowth === 0) weeklyGrowthMessage = "Consistent effort! 🎯";
      else weeklyGrowthMessage = "Time to increase study time! ⚠️";
    } else if (lastWeekHours > 0) {
      weeklyGrowth = 100;
      weeklyGrowthMessage = "Great start! Keep going! 🌟";
    } else {
      weeklyGrowth = 0;
      weeklyGrowthMessage = "No data for comparison";
    }

    const hourStats = {};
    sessions.forEach(s => {
      const hour = parseInt(s.time.split(':')[0]);
      if (!hourStats[hour]) hourStats[hour] = { totalFocus: 0, count: 0 };
      hourStats[hour].totalFocus += s.focusLevel;
      hourStats[hour].count++;
    });
    
    let peakProductivityHour = null;
    let highestProductivity = 0;
    Object.keys(hourStats).forEach(hour => {
      const avg = hourStats[hour].totalFocus / hourStats[hour].count;
      if (avg > highestProductivity) {
        highestProductivity = avg;
        peakProductivityHour = parseInt(hour);
      }
    });

    let bestFocusTime = null;
    let maxFocus = 0;
    sessions.forEach(s => {
      if (s.focusLevel > maxFocus) {
        maxFocus = s.focusLevel;
        bestFocusTime = parseInt(s.time.split(':')[0]);
      }
    });

    setAnalytics({
      improvementRate: Math.round(improvement.rate),
      improvementMessage: improvement.message,
      subjectsExplored,
      weeklyGrowth: Math.round(weeklyGrowth),
      weeklyGrowthMessage: weeklyGrowthMessage,
      bestFocusSubject,
      mostStudiedSubject,
      weakestSubject: weakestSubject !== bestFocusSubject ? weakestSubject : (Object.keys(subjectStats).length === 1 ? null : weakestSubject),
      peakProductivityHour,
      bestFocusTime,
      totalHours: totalHours.toFixed(1),
      totalSessions,
      avgFocus: avgFocus.toFixed(1),
      hasEnoughData: sessions.length >= 2
    });
  };

  // ========== FEATURE 1 & 3: STUDY PATTERNS & REMINDERS ==========
  const analyzeStudyPatterns = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }

    const hourlyPattern = {};
    sessions.forEach(session => {
      const hour = parseInt(session.time.split(':')[0]);
      if (!hourlyPattern[hour]) {
        hourlyPattern[hour] = { count: 0, days: new Set() };
      }
      hourlyPattern[hour].count++;
      hourlyPattern[hour].days.add(session.date);
    });

    const usualTimes = Object.entries(hourlyPattern)
      .map(([hour, data]) => ({ 
        hour: parseInt(hour), 
        frequency: data.count,
        daysCount: data.days.size
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 3);

    const today = new Date();
    const todayHour = today.getHours();
    const missedSlots = [];
    
    usualTimes.forEach(time => {
      const hasStudiedToday = sessions.some(s => {
        const sessionDate = new Date(s.date).toDateString();
        const todayDate = new Date().toDateString();
        const sessionHour = parseInt(s.time.split(':')[0]);
        return sessionDate === todayDate && sessionHour === time.hour;
      });
      
      if (!hasStudiedToday && time.hour <= todayHour) {
        missedSlots.push(time.hour);
      }
    });

    setStudyPatterns({
      usualTimes,
      missedSlots,
      todayStatus: missedSlots.length > 0 ? 'missed_slots' : 'on_track'
    });
  };

  const checkForReminders = () => {
    const currentHour = new Date().getHours();
    const todaySessions = sessions.filter(s => {
      const sessionDate = new Date(s.date).toDateString();
      const todayDate = new Date().toDateString();
      return sessionDate === todayDate;
    });

    const upcomingUsualTime = studyPatterns.usualTimes.find(t => t.hour > currentHour && t.hour <= currentHour + 2);
    
    if (upcomingUsualTime && todaySessions.length === 0 && studyPatterns.missedSlots.length > 0) {
      setReminder({
        type: 'missed_slot',
        message: `⏰ You usually study at ${upcomingUsualTime.hour}:00 but haven't yet. Time to start!`,
        time: new Date().getTime()
      });
      setTimeout(() => setReminder(null), 10000);
    }

    if (dailyGoal.enabled) {
      const completedSubjects = dailyGoal.progress?.subjectsCompleted?.length || 0;
      const remainingSubjects = dailyGoal.targetSubjects - completedSubjects;
      
      if (remainingSubjects > 0 && currentHour >= 18 && todaySessions.length > 0) {
        setReminder({
          type: 'goal_reminder',
          message: `📚 You have ${remainingSubjects} more ${remainingSubjects === 1 ? 'subject' : 'subjects'} to complete today's goal!`,
          time: new Date().getTime()
        });
        setTimeout(() => setReminder(null), 8000);
      }
    }
  };

  // ========== FEATURE 4: GOAL TRACKER (FIXED) ==========
  const checkGoalProgress = () => {
    if (!dailyGoal.enabled) return;

    const todayDate = new Date().toDateString();
    const todaySessions = sessions.filter(s => new Date(s.date).toDateString() === todayDate);
    
    // Track UNIQUE subjects (different subjects)
    const uniqueSubjectsMap = new Map();
    // Track total subject entries (including repeats)
    let totalSubjectEntries = 0;
    let totalHoursToday = 0;
    
    todaySessions.forEach(session => {
      if (!uniqueSubjectsMap.has(session.subject)) {
        uniqueSubjectsMap.set(session.subject, { hours: 0, sessions: 0 });
      }
      const subjectData = uniqueSubjectsMap.get(session.subject);
      subjectData.hours += session.duration / 60;
      subjectData.sessions += 1;
      totalHoursToday += session.duration / 60;
      totalSubjectEntries++;
    });
    
    // Count based on goal type
    let subjectsCount = 0;
    if (dailyGoal.goalType === 'unique') {
      subjectsCount = uniqueSubjectsMap.size; // Count different subjects
    } else {
      subjectsCount = totalSubjectEntries; // Count total entries
    }
    
    const uniqueSubjects = uniqueSubjectsMap.size;
    const recommendedTimePerSubject = dailyGoal.targetHours / dailyGoal.targetSubjects;
    
    const timeAllocation = {};
    uniqueSubjectsMap.forEach((data, subject) => {
      timeAllocation[subject] = {
        studied: data.hours,
        recommended: recommendedTimePerSubject,
        remaining: Math.max(0, recommendedTimePerSubject - data.hours),
        percentage: Math.min(100, (data.hours / recommendedTimePerSubject) * 100),
        sessions: data.sessions
      };
    });
    
    const studiedSubjects = Array.from(uniqueSubjectsMap.keys());
    
    const progress = {
      subjects: subjectsCount,
      targetSubjects: dailyGoal.targetSubjects,
      subjectsPercentage: Math.min(100, (subjectsCount / dailyGoal.targetSubjects) * 100),
      hours: totalHoursToday,
      targetHours: dailyGoal.targetHours,
      hoursPercentage: Math.min(100, (totalHoursToday / dailyGoal.targetHours) * 100),
      subjectsCompleted: studiedSubjects,
      remainingSubjects: dailyGoal.targetSubjects - subjectsCount,
      totalSubjectEntries: totalSubjectEntries,
      timeAllocation: timeAllocation,
      todaySessions: todaySessions,
      goalType: dailyGoal.goalType
    };
    
    setDailyGoal(prev => ({ ...prev, progress }));
    
    const updatedGoal = { ...dailyGoal, progress };
    localStorage.setItem('studydna_daily_goal', JSON.stringify(updatedGoal));
  };

  // ========== FEATURE 5: SUBJECT IMPROVEMENT ANALYSIS ==========
  const calculateSubjectImprovement = () => {
    const subjectStats = {};
    
    sessions.forEach(session => {
      if (!subjectStats[session.subject]) {
        subjectStats[session.subject] = {
          sessions: [],
          totalHours: 0,
          avgFocus: 0,
          focusSum: 0,
          earliestFocus: null,
          latestFocus: null
        };
      }
      subjectStats[session.subject].sessions.push(session);
      subjectStats[session.subject].totalHours += session.duration / 60;
      subjectStats[session.subject].focusSum += session.focusLevel;
    });
    
    Object.keys(subjectStats).forEach(subject => {
      const stats = subjectStats[subject];
      stats.avgFocus = stats.focusSum / stats.sessions.length;
      
      const sortedSessions = [...stats.sessions].sort((a, b) => new Date(a.date) - new Date(b.date));
      
      if (sortedSessions.length >= 2) {
        stats.earliestFocus = sortedSessions[0].focusLevel;
        stats.latestFocus = sortedSessions[sortedSessions.length - 1].focusLevel;
        
        if (stats.earliestFocus > 0) {
          stats.improvementPercentage = ((stats.latestFocus - stats.earliestFocus) / stats.earliestFocus) * 100;
        } else {
          stats.improvementPercentage = stats.latestFocus > 0 ? 100 : 0;
        }
        
        stats.trend = stats.improvementPercentage > 5 ? 'improving' : 
                      stats.improvementPercentage < -5 ? 'declining' : 'stable';
      } else {
        stats.improvementPercentage = 0;
        stats.trend = 'need more data';
        stats.earliestFocus = stats.avgFocus;
        stats.latestFocus = stats.avgFocus;
      }
      
      const optimalFocus = 8;
      const currentFocus = stats.avgFocus;
      
      if (currentFocus < optimalFocus && stats.totalHours > 0) {
        const focusGap = optimalFocus - currentFocus;
        let additionalHours = (focusGap / 10) * stats.totalHours;
        additionalHours = Math.max(0.5, Math.min(additionalHours, 20));
        stats.hoursNeededForImprovement = additionalHours.toFixed(1);
        stats.improvementMessage = `Study ${additionalHours.toFixed(1)} more hours in ${subject} to reach optimal focus`;
      } else if (currentFocus >= optimalFocus) {
        stats.hoursNeededForImprovement = 0;
        stats.improvementMessage = `Excellent! You've mastered ${subject}. Maintain your current pace.`;
      } else {
        stats.hoursNeededForImprovement = 2;
        stats.improvementMessage = `Log more sessions in ${subject} to see improvement analysis`;
      }
    });
    
    setSubjectImprovement(subjectStats);
  };

  // ========== GOAL MANAGEMENT ==========
  const saveDailyGoal = () => {
    const newGoal = {
      enabled: true,
      targetSubjects: tempGoal.targetSubjects,
      targetHours: tempGoal.targetHours,
      goalType: tempGoal.goalType,
      progress: { 
        subjects: 0, 
        hours: 0, 
        subjectsPercentage: 0, 
        hoursPercentage: 0,
        subjectsCompleted: [],
        totalSubjectEntries: 0,
        timeAllocation: {},
        todaySessions: []
      }
    };
    setDailyGoal(newGoal);
    localStorage.setItem('studydna_daily_goal', JSON.stringify(newGoal));
    setShowGoalModal(false);
    setTimeout(() => checkGoalProgress(), 100);
  };

  const updateDailyGoal = () => {
    const updatedGoal = {
      ...dailyGoal,
      targetSubjects: tempGoal.targetSubjects,
      targetHours: tempGoal.targetHours,
      goalType: tempGoal.goalType
    };
    setDailyGoal(updatedGoal);
    localStorage.setItem('studydna_daily_goal', JSON.stringify(updatedGoal));
    setShowGoalModal(false);
    checkGoalProgress();
  };

  const disableGoal = () => {
    setDailyGoal({ ...dailyGoal, enabled: false });
    localStorage.removeItem('studydna_daily_goal');
  };

  if (!sessions || sessions.length === 0) {
    return (
      <div style={{ 
        background: 'var(--bg-secondary)', 
        borderRadius: '24px', 
        padding: '30px',
        textAlign: 'center',
        marginBottom: '30px',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎯</div>
        <h3>Smart Study Features</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Log your first study session to unlock all features!</p>
        <button style={{
          marginTop: '15px',
          padding: '10px 20px',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          border: 'none',
          borderRadius: '12px',
          color: 'white',
          cursor: 'pointer'
        }} onClick={() => {
          const logBtn = document.querySelector('.nav-tabs button:nth-child(2)');
          if (logBtn) logBtn.click();
        }}>Log Your First Session</button>
      </div>
    );
  }

  return (
    <>
      {/* Smart Reminder Notification */}
      <AnimatePresence>
        {reminder && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            style={{
              position: 'fixed',
              bottom: '120px',
              left: '30px',
              width: '340px',
              background: reminder.type === 'missed_slot' ? 'linear-gradient(135deg, #f093fb, #f5576c)' : 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '15px',
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              zIndex: 1000,
              cursor: 'pointer'
            }}
            onClick={() => setReminder(null)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiBell size={24} />
              <div>
                <strong style={{ fontSize: '14px' }}>Smart Reminder</strong>
                <p style={{ fontSize: '12px', marginTop: '5px', opacity: 0.9 }}>{reminder.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analytics Dashboard */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: '24px',
        padding: '25px',
        marginBottom: '30px',
        boxShadow: 'var(--card-shadow)',
        border: '1px solid var(--border-color)'
      }}>
        
        <h2 style={{ fontSize: '24px', marginBottom: '5px' }}>Advanced Study Analytics</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '25px' }}>Deep insights into your learning patterns and progress</p>

        {/* Stats Row 1 - 4 Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '25px' }}>
          {/* Improvement Rate */}
          <div style={{ background: 'var(--bg-primary)', borderRadius: '16px', padding: '15px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>IMPROVEMENT RATE</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: analytics.improvementRate >= 0 ? '#10b981' : '#ef4444' }}>
              {sessions.length < 2 ? 'Need more data' : (analytics.improvementRate >= 0 ? `+${analytics.improvementRate}%` : `${analytics.improvementRate}%`)}
            </div>
            <div style={{ fontSize: '11px', color: analytics.improvementRate >= 0 ? '#10b981' : '#ef4444' }}>
              {sessions.length < 2 ? 'Log 2+ sessions' : analytics.improvementMessage}
            </div>
          </div>

          {/* Subjects Explored */}
          <div style={{ background: 'var(--bg-primary)', borderRadius: '16px', padding: '15px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>SUBJECTS EXPLORED</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>{analytics.subjectsExplored}</div>
            <div style={{ fontSize: '11px', color: '#667eea' }}>Different subjects studied</div>
          </div>

          {/* Weekly Growth */}
          <div style={{ background: 'var(--bg-primary)', borderRadius: '16px', padding: '15px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>WEEKLY GROWTH</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: analytics.weeklyGrowth >= 0 ? '#10b981' : '#ef4444' }}>
              {analytics.weeklyGrowth === 100 && analytics.weeklyGrowthMessage === "Great start! Keep going! 🌟" ? '+100%' : 
               analytics.weeklyGrowth >= 0 ? `+${analytics.weeklyGrowth}%` : `${analytics.weeklyGrowth}%`}
            </div>
            <div style={{ fontSize: '11px', color: analytics.weeklyGrowth >= 0 ? '#10b981' : '#ef4444' }}>
              {analytics.weeklyGrowthMessage}
            </div>
          </div>

          {/* Average Focus */}
          <div style={{ background: 'var(--bg-primary)', borderRadius: '16px', padding: '15px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>AVERAGE FOCUS</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#8b5cf6' }}>{analytics.avgFocus}/10</div>
            <div style={{ fontSize: '11px', color: '#8b5cf6' }}>
              {analytics.avgFocus >= 7 ? 'Excellent focus! 🎯' : analytics.avgFocus >= 5 ? 'Good focus! 📈' : 'Needs improvement 💪'}
            </div>
          </div>
        </div>

        {/* Row 2: Subject Performance Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '25px' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))', borderRadius: '16px', padding: '18px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ fontSize: '12px', color: '#10b981', marginBottom: '5px' }}>⭐ Best Subject (Focus)</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{analytics.bestFocusSubject || 'N/A'}</div>
            <div style={{ fontSize: '11px', color: '#10b981' }}>Highest average focus</div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.05))', borderRadius: '16px', padding: '18px', border: '1px solid rgba(102, 126, 234, 0.2)' }}>
            <div style={{ fontSize: '12px', color: '#667eea', marginBottom: '5px' }}>📚 Most Studied Subject</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>{analytics.mostStudiedSubject || 'N/A'}</div>
            <div style={{ fontSize: '11px', color: '#667eea' }}>Most time invested</div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))', borderRadius: '16px', padding: '18px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div style={{ fontSize: '12px', color: '#ef4444', marginBottom: '5px' }}>⚠️ Needs Improvement</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
              {analytics.weakestSubject || (analytics.subjectsExplored === 1 ? 'Keep exploring!' : 'N/A')}
            </div>
            <div style={{ fontSize: '11px', color: '#ef4444' }}>
              {analytics.weakestSubject ? 'Lowest focus subject' : (analytics.subjectsExplored === 1 ? 'Add more subjects' : 'Log more sessions')}
            </div>
          </div>
        </div>

        {/* Row 3: Time Optimization */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '25px' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.05))', borderRadius: '16px', padding: '18px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <div style={{ fontSize: '12px', color: '#f59e0b', marginBottom: '5px' }}>⏰ Peak Productivity Hour</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
              {analytics.peakProductivityHour ? `${analytics.peakProductivityHour}:00 - ${analytics.peakProductivityHour+1}:00` : 'Log more sessions'}
            </div>
            <div style={{ fontSize: '11px', color: '#f59e0b' }}>Your brain works best during these hours! ⚡</div>
            <div style={{ marginTop: '10px', fontSize: '11px', padding: '5px 10px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', display: 'inline-block' }}>
              💡 Schedule difficult subjects here
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(102, 126, 234, 0.05))', borderRadius: '16px', padding: '18px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <div style={{ fontSize: '12px', color: '#8b5cf6', marginBottom: '5px' }}>🎯 Best Focus Time</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>
              {analytics.bestFocusTime ? `${analytics.bestFocusTime}:00` : 'Log more sessions'}
            </div>
            <div style={{ fontSize: '11px', color: '#8b5cf6' }}>Highest focus level recorded</div>
            <div style={{ marginTop: '10px', fontSize: '11px', padding: '5px 10px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', display: 'inline-block' }}>
              💡 Save important topics for this time
            </div>
          </div>
        </div>

        {/* FEATURE 5: Subject Improvement Analysis */}
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiBarChart2 /> Subject Improvement Analysis
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {Object.entries(subjectImprovement).length > 0 ? (
              Object.entries(subjectImprovement).map(([subject, data]) => (
                <div key={subject} style={{
                  padding: '15px',
                  background: 'var(--bg-primary)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <strong style={{ fontSize: '16px', color: '#667eea' }}>{subject}</strong>
                    <span style={{ 
                      fontSize: '11px', 
                      padding: '3px 10px', 
                      borderRadius: '12px',
                      background: data.trend === 'improving' ? 'rgba(16, 185, 129, 0.2)' : 
                                  data.trend === 'declining' ? 'rgba(239, 68, 68, 0.2)' : 
                                  'rgba(245, 158, 11, 0.2)',
                      color: data.trend === 'improving' ? '#10b981' : 
                             data.trend === 'declining' ? '#ef4444' : '#f59e0b'
                    }}>
                      {data.trend === 'improving' ? '📈 Improving' : 
                       data.trend === 'declining' ? '📉 Declining' : '➡️ Stable'}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                    <span>Total Hours: <strong>{data.totalHours?.toFixed(1)}h</strong></span>
                    <span>Avg Focus: <strong>{data.avgFocus?.toFixed(1)}/10</strong></span>
                    <span>Sessions: <strong>{data.sessions?.length}</strong></span>
                    <span>Improvement: <strong style={{ color: data.improvementPercentage > 0 ? '#10b981' : '#ef4444' }}>
                      {data.improvementPercentage > 0 ? `+${data.improvementPercentage?.toFixed(1)}%` : `${data.improvementPercentage?.toFixed(1)}%`}
                    </strong></span>
                  </div>
                  
                  <div style={{
                    padding: '10px',
                    background: data.hoursNeededForImprovement > 0 ? 'rgba(102, 126, 234, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '10px',
                    fontSize: '13px',
                    color: data.hoursNeededForImprovement > 0 ? '#667eea' : '#10b981'
                  }}>
                    {data.hoursNeededForImprovement > 0 ? (
                      <>
                        <FiTrendingUp style={{ display: 'inline', marginRight: '8px' }} />
                        {data.improvementMessage}
                      </>
                    ) : (
                      <>
                        <FiCheckCircle style={{ display: 'inline', marginRight: '8px' }} />
                        {data.improvementMessage}
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                <p>Log more sessions to see subject improvement analysis</p>
              </div>
            )}
          </div>
        </div>

        {/* FEATURE 4: Daily Goal Tracker (FIXED) */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))',
          borderRadius: '16px',
          padding: '20px',
          marginTop: '20px',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
              <FiTarget style={{ color: '#10b981' }} /> Daily Goal Tracker
            </h4>
            {!dailyGoal.enabled ? (
              <button onClick={() => setShowGoalModal(true)} style={{
                padding: '6px 12px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px'
              }}>Set Goal</button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setShowGoalModal(true)} style={{
                  padding: '6px 12px',
                  background: 'transparent',
                  border: '1px solid #667eea',
                  borderRadius: '8px',
                  color: '#667eea',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}>Edit Goal</button>
                <button onClick={disableGoal} style={{
                  padding: '6px 12px',
                  background: 'transparent',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}>Disable</button>
              </div>
            )}
          </div>
          
          {dailyGoal.enabled ? (
            <div>
              {/* Goal Type Indicator */}
              <div style={{ marginBottom: '10px', fontSize: '11px', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '20px', display: 'inline-block' }}>
                {dailyGoal.goalType === 'unique' ? '🎯 Counting DIFFERENT subjects' : '📝 Counting TOTAL subject entries'}
              </div>
              
              {/* Subjects Progress */}
              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>📚 Subjects: {dailyGoal.progress?.subjects || 0} / {dailyGoal.targetSubjects}</span>
                  <span>{Math.round(dailyGoal.progress?.subjectsPercentage || 0)}%</span>
                </div>
                <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${dailyGoal.progress?.subjectsPercentage || 0}%`, background: 'linear-gradient(90deg, #667eea, #764ba2)', borderRadius: '4px' }}></div>
                </div>
                {dailyGoal.goalType === 'unique' && dailyGoal.progress?.totalSubjectEntries > 0 && (
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Total subject entries today: {dailyGoal.progress.totalSubjectEntries}
                  </div>
                )}
              </div>
              
              {/* Hours Progress */}
              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>⏱️ Hours: {dailyGoal.progress?.hours?.toFixed(1) || 0} / {dailyGoal.targetHours}h</span>
                  <span>{Math.round(dailyGoal.progress?.hoursPercentage || 0)}%</span>
                </div>
                <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${dailyGoal.progress?.hoursPercentage || 0}%`, background: 'linear-gradient(90deg, #f093fb, #f5576c)', borderRadius: '4px' }}></div>
                </div>
              </div>
              
              {/* Subjects Completed */}
              {dailyGoal.progress?.subjectsCompleted?.length > 0 && (
                <div style={{ marginBottom: '15px', padding: '10px', background: 'var(--bg-primary)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>✅ Subjects Studied Today:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {dailyGoal.progress.subjectsCompleted.map((subject, idx) => (
                      <span key={idx} style={{ padding: '4px 10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '20px', fontSize: '12px', color: '#10b981' }}>
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Time Allocation */}
              {Object.keys(dailyGoal.progress?.timeAllocation || {}).length > 0 && (
                <div style={{ marginBottom: '15px', padding: '10px', background: 'var(--bg-primary)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>⏰ Time Allocation:</div>
                  {Object.entries(dailyGoal.progress.timeAllocation).map(([subject, data]) => (
                    <div key={subject} style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                        <span>{subject}</span>
                        <span>{data.studied.toFixed(1)}h / {data.recommended.toFixed(1)}h</span>
                      </div>
                      <div style={{ height: '4px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${data.percentage}%`, background: data.percentage >= 100 ? '#10b981' : '#f59e0b', borderRadius: '2px' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Goal Completion Status */}
              {dailyGoal.progress?.subjects >= dailyGoal.targetSubjects && dailyGoal.progress?.hours >= dailyGoal.targetHours ? (
                <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '12px' }}>
                  <FiCheckCircle style={{ display: 'inline', marginRight: '8px', color: '#10b981' }} />
                  <span style={{ color: '#10b981', fontWeight: '600' }}>🎉 Goal Achieved! Great job today! 🎉</span>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', fontSize: '12px' }}>
                  Remaining: {dailyGoal.targetSubjects - (dailyGoal.progress?.subjects || 0)} subjects & 
                  {(dailyGoal.targetHours - (dailyGoal.progress?.hours || 0)).toFixed(1)} hours
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
              <p>Set a daily goal to track your subjects and study time!</p>
              <p style={{ fontSize: '12px', marginTop: '8px' }}>Example: Study 3 different subjects for 2 hours today</p>
            </div>
          )}
        </div>

        {/* Missed Study Slots Alert */}
        {studyPatterns.missedSlots.length > 0 && (
          <div style={{
            marginTop: '15px',
            padding: '12px',
            background: 'rgba(245, 158, 11, 0.15)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#f59e0b',
            fontSize: '13px'
          }}>
            <FiAlertCircle />
            <span>⚠️ You missed your usual study time at {studyPatterns.missedSlots.map(h => `${h}:00`).join(', ')} today</span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer'
          }} onClick={() => {
            const logBtn = document.querySelector('.nav-tabs button:nth-child(2)');
            if (logBtn) logBtn.click();
          }}>
            📝 Log Session Now
          </button>
          <button style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            borderRadius: '12px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontWeight: '600',
            cursor: 'pointer'
          }} onClick={() => {
            const reportBtn = document.querySelector('.nav-tabs button:nth-child(5)');
            if (reportBtn) reportBtn.click();
          }}>
            📊 View Weekly Report
          </button>
        </div>
      </div>

      {/* Goal Setting Modal with Goal Type Option */}
      {showGoalModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(5px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} onClick={() => setShowGoalModal(false)}>
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '24px',
            padding: '30px',
            width: '90%',
            maxWidth: '450px'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>{dailyGoal.enabled ? 'Edit Your Daily Goal' : 'Set Your Daily Goal'}</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Goal Type</label>
              <select
                value={tempGoal.goalType}
                onChange={(e) => setTempGoal({ ...tempGoal, goalType: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  marginBottom: '10px'
                }}
              >
                <option value="unique">Different Subjects (Count unique subjects)</option>
                <option value="total">Total Subject Entries (Count each session)</option>
              </select>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '5px' }}>
                {tempGoal.goalType === 'unique' 
                  ? 'Example: Studying Mathematics twice counts as 1 subject' 
                  : 'Example: Studying Mathematics twice counts as 2 subjects'}
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Number of Subjects to Study</label>
              <input
                type="number"
                min="1"
                max="10"
                value={tempGoal.targetSubjects}
                onChange={(e) => setTempGoal({ ...tempGoal, targetSubjects: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Target Study Hours</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="8"
                value={tempGoal.targetHours}
                onChange={(e) => setTempGoal({ ...tempGoal, targetHours: parseFloat(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)'
                }}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '5px' }}>
                Time will be divided equally among your subjects
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowGoalModal(false)} style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--text-primary)'
              }}>Cancel</button>
              <button onClick={dailyGoal.enabled ? updateDailyGoal : saveDailyGoal} style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '600'
              }}>{dailyGoal.enabled ? 'Update Goal' : 'Set Goal'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SmartFeatures;