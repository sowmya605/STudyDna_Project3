const express = require('express');
const router = express.Router();
const StudySession = require('../models/StudySession');
const aiAnalyzer = require('../services/aiAnalyzer');

// Get AI insights
router.get('/insights', async (req, res) => {
  try {
    const { userId, days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const sessions = await StudySession.find({
      userId: userId || 'default-user',
      date: { $gte: startDate }
    }).sort({ date: 1 });
    
    const insights = aiAnalyzer.generateExplainableInsights(sessions);
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get weekly report
router.get('/weekly-report', async (req, res) => {
  try {
    const { userId } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    const sessions = await StudySession.find({
      userId: userId || 'default-user',
      date: { $gte: startDate }
    }).sort({ date: 1 });
    
    const weeklyReport = aiAnalyzer.generateWeeklySummary(sessions);
    res.json(weeklyReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get subject-wise analysis
router.get('/subject-analysis', async (req, res) => {
  try {
    const { userId } = req.query;
    const sessions = await StudySession.find({
      userId: userId || 'default-user'
    });
    
    const subjectAnalysis = {};
    sessions.forEach(session => {
      if (!subjectAnalysis[session.subject]) {
        subjectAnalysis[session.subject] = {
          totalHours: 0,
          totalSessions: 0,
          averageFocus: 0,
          focusSum: 0
        };
      }
      subjectAnalysis[session.subject].totalHours += session.duration / 60;
      subjectAnalysis[session.subject].totalSessions += 1;
      subjectAnalysis[session.subject].focusSum += session.focusLevel;
    });
    
    // Calculate averages
    Object.keys(subjectAnalysis).forEach(subject => {
      subjectAnalysis[subject].averageFocus = 
        subjectAnalysis[subject].focusSum / subjectAnalysis[subject].totalSessions;
      delete subjectAnalysis[subject].focusSum;
    });
    
    res.json(subjectAnalysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;