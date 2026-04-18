class AIAnalyzer {
  
  // Calculate Study Consistency Score
  calculateConsistencyScore(sessions) {
    if (sessions.length === 0) return 0;
    
    const uniqueDays = new Set();
    sessions.forEach(session => {
      uniqueDays.add(session.date);
    });
    
    const expectedDays = Math.min(30, sessions.length);
    const consistencyScore = Math.min(100, Math.floor((uniqueDays.size / expectedDays) * 100));
    return consistencyScore;
  }
  
  // Identify Productive Time Windows
  findProductiveWindows(sessions) {
    if (sessions.length === 0) return [];
    
    const hourlyProductivity = {};
    
    sessions.forEach(session => {
      const timeStr = session.time || session.startTime || '12:00';
      const hour = parseInt(timeStr.split(':')[0]);
      const productivityScore = session.focusLevel * (session.duration / 60);
      
      if (!hourlyProductivity[hour]) {
        hourlyProductivity[hour] = { totalScore: 0, count: 0 };
      }
      hourlyProductivity[hour].totalScore += productivityScore;
      hourlyProductivity[hour].count += 1;
    });
    
    const windows = [];
    for (const [hour, data] of Object.entries(hourlyProductivity)) {
      const avgScore = data.totalScore / data.count;
      windows.push({
        hour: parseInt(hour),
        avgProductivity: Math.round(avgScore * 10) / 10,
        sessionCount: data.count
      });
    }
    
    // Sort by productivity and get top 3
    windows.sort((a, b) => b.avgProductivity - a.avgProductivity);
    return windows.slice(0, 3);
  }
  
  // Detect Focus Drop Points
  detectFocusDropPoints(sessions) {
    if (sessions.length === 0) { 
      return { 
        dropDuration: 60, 
        pattern: 'No data available', 
        recommendation: 'Log your first study session' 
      };
    }
    
    const durationFocusMap = {};
    sessions.forEach(session => {
      const durationRange = Math.floor(session.duration / 30) * 30;
      if (!durationFocusMap[durationRange]) {
        durationFocusMap[durationRange] = { totalFocus: 0, count: 0 };
      }
      durationFocusMap[durationRange].totalFocus += session.focusLevel;
      durationFocusMap[durationRange].count += 1;
    });
    
    let dropDuration = 60;
    let previousFocus = 10;
    
    const sortedDurations = Object.keys(durationFocusMap).sort((a, b) => parseInt(a) - parseInt(b));
    
    for (const duration of sortedDurations) {
      const data = durationFocusMap[duration];
      const avgFocus = data.totalFocus / data.count;
      if (avgFocus < previousFocus - 1.5) {
        dropDuration = parseInt(duration);
        break;
      }
      previousFocus = avgFocus;
    }
    
    return {
      dropDuration: dropDuration,
      pattern: `Focus typically drops after ${dropDuration} minutes of continuous study`,
      recommendation: `Consider taking short breaks every ${Math.max(30, dropDuration - 15)} minutes`
    };
  }
  
  // Classify Study Style
  classifyStudyStyle(sessions) {
    if (sessions.length === 0) return 'Insufficient data';
    
    const avgDuration = sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;
    const avgFocus = sessions.reduce((sum, s) => sum + s.focusLevel, 0) / sessions.length;
    
    if (avgDuration <= 45 && avgFocus >= 7) {
      return 'Short-Burst Learner';
    } else if (avgDuration >= 90 && avgFocus >= 7) {
      return 'Deep-Focus Learner';
    } else if (avgDuration > 60 && avgFocus < 6) {
      return 'Struggling with Extended Sessions';
    } else {
      return 'Balanced Learner';
    }
  }
  
  // Detect Burnout Risk
  detectBurnoutRisk(sessions) {
    if (sessions.length < 3) { 
      return { 
        risk: 'Low', 
        reason: 'Not enough data to assess', 
        recommendation: 'Log at least 3 study sessions for accurate assessment' 
      };
    }
    
    const recentSessions = sessions.slice(-7);
    const longHoursCount = recentSessions.filter(s => s.duration > 120).length;
    const lowFocusCount = recentSessions.filter(s => s.focusLevel < 4).length;
    
    if (longHoursCount >= 3 && lowFocusCount >= 2) {
      return {
        risk: 'High',
        reason: 'Multiple long study sessions with consistently low focus levels',
        recommendation: 'Take a complete day off and reduce study duration to 45-60 minutes'
      };
    } else if (longHoursCount >= 2 || lowFocusCount >= 3) {
      return {
        risk: 'Medium',
        reason: 'Signs of fatigue detected with either long hours or low focus patterns',
        recommendation: 'Incorporate regular breaks and ensure 7-8 hours of sleep'
      };
    } else {
      return {
        risk: 'Low',
        reason: 'Study patterns appear healthy with balanced duration and focus',
        recommendation: 'Maintain current routine and monitor for any changes'
      };
    }
  }
  
  // Generate Weekly Summary
  generateWeeklySummary(sessions) {
    if (sessions.length === 0) {
      return {
        totalHours: 0,
        averageFocus: 0,
        topSubject: 'None',
        totalSessions: 0,
        improvement: 'Start logging your study sessions to receive insights!'
      };
    }
    
    const totalHours = sessions.reduce((sum, s) => sum + (s.duration / 60), 0);
    const averageFocus = sessions.reduce((sum, s) => sum + s.focusLevel, 0) / sessions.length;
    
    const subjectCount = {};
    sessions.forEach(s => {
      subjectCount[s.subject] = (subjectCount[s.subject] || 0) + 1;
    });
    
    const topSubject = Object.keys(subjectCount).length > 0 ? 
      Object.keys(subjectCount).reduce((a, b) => subjectCount[a] > subjectCount[b] ? a : b) : 'None';
    
    let improvement = '';
    if (totalHours > 20) {
      improvement = 'Excellent study hours this week! Focus on quality over quantity.';
    } else if (totalHours > 10) {
      improvement = 'Good progress! Try to increase consistency.';
    } else if (totalHours > 5) {
      improvement = 'Good start! Try to study at least 1 hour daily.';
    } else {
      improvement = 'Start with small, consistent study sessions. Even 30 minutes daily helps!';
    }
    
    return {
      totalHours: Math.round(totalHours * 10) / 10,
      averageFocus: Math.round(averageFocus * 10) / 10,
      topSubject: topSubject,
      totalSessions: sessions.length,
      improvement: improvement
    };
  }
  
  // Generate Explainable Insights
  generateExplainableInsights(sessions) {
    const consistencyScore = this.calculateConsistencyScore(sessions);
    const productiveWindows = this.findProductiveWindows(sessions);
    const focusDrop = this.detectFocusDropPoints(sessions);
    const studyStyle = this.classifyStudyStyle(sessions);
    const burnoutRisk = this.detectBurnoutRisk(sessions);
    const weeklySummary = this.generateWeeklySummary(sessions);
    
    // Calculate additional stats for explanations
    const avgDuration = sessions.length > 0 ? 
      sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length : 0;
    const avgFocus = sessions.length > 0 ? 
      sessions.reduce((sum, s) => sum + s.focusLevel, 0) / sessions.length : 0;
    
    return {
      consistencyScore: consistencyScore,
      productiveWindows: productiveWindows,
      focusDropAnalysis: focusDrop,
      studyStyle: studyStyle,
      burnoutRisk: burnoutRisk,
      weeklySummary: weeklySummary,
      explanations: {
        consistencyExplanation: `Your consistency score is ${consistencyScore}%. ${
          consistencyScore >= 70 ? 'Great job maintaining regular study habits!' :
          consistencyScore >= 40 ? 'Try to study more consistently throughout the week.' :
          'Start with a daily study schedule to build consistency.'
        }`,
        productivityExplanation: productiveWindows.length > 0 ? 
          `You are most productive at ${productiveWindows[0].hour}:00. Plan important topics during these hours.` :
          'Log more sessions to discover your peak productivity hours.',
        styleExplanation: `You are a ${studyStyle}. ${studyStyle === 'Deep-Focus Learner' ? 'Your long focus sessions are valuable!' : studyStyle === 'Short-Burst Learner' ? 'Short focused sessions work well for you!' : 'Consider gradually increasing session duration.'} Average session: ${Math.round(avgDuration)} minutes with ${avgFocus.toFixed(1)}/10 focus.`
      }
    };
  }
}

module.exports = new AIAnalyzer();