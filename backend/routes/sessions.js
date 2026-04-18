const express = require('express');
const router = express.Router();
const StudySession = require('../models/StudySession');
const auth = require('../middleware/auth');
const { validateSession } = require('../middleware/validation');

// ============ CREATE Session ============
// Method 1: POST with JSON body (for web form)
router.post('/', auth, validateSession, async (req, res) => {
  try {
    const session = new StudySession({
      ...req.body,
      userId: req.userId
    });
    
    await session.save();
    
    res.status(201).json({
      success: true,
      message: 'Study session logged successfully!',
      data: session
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ============ BATCH CREATE Sessions ============
// Method 2: POST multiple sessions at once
router.post('/batch', auth, async (req, res) => {
  try {
    const { sessions } = req.body;
    
    if (!sessions || !Array.isArray(sessions)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of sessions'
      });
    }
    
    const sessionsWithUser = sessions.map(session => ({
      ...session,
      userId: req.userId
    }));
    
    const created = await StudySession.insertMany(sessionsWithUser);
    
    res.json({
      success: true,
      message: `${created.length} sessions logged successfully!`,
      data: created
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ============ READ Sessions ============
// Method 3: GET with filters (query parameters)
router.get('/', auth, async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      subject, 
      minFocus, 
      maxFocus,
      limit = 50,
      page = 1,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;
    
    const query = { userId: req.userId };
    
    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    // Subject filter
    if (subject) query.subject = subject;
    
    // Focus level filter
    if (minFocus || maxFocus) {
      query.focusLevel = {};
      if (minFocus) query.focusLevel.$gte = parseInt(minFocus);
      if (maxFocus) query.focusLevel.$lte = parseInt(maxFocus);
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    const sessions = await StudySession.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await StudySession.countDocuments(query);
    
    res.json({
      success: true,
      data: sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ GET Single Session ============
router.get('/:id', auth, async (req, res) => {
  try {
    const session = await StudySession.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        error: 'Session not found' 
      });
    }
    
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ UPDATE Session ============
router.put('/:id', auth, async (req, res) => {
  try {
    const session = await StudySession.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        error: 'Session not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Session updated successfully!',
      data: session
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ============ DELETE Session ============
router.delete('/:id', auth, async (req, res) => {
  try {
    const session = await StudySession.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        error: 'Session not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Session deleted successfully!'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ GET Statistics ============
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const { period = 'week' } = req.query; // week, month, year
    
    let startDate = new Date();
    if (period === 'week') startDate.setDate(startDate.getDate() - 7);
    if (period === 'month') startDate.setMonth(startDate.getMonth() - 1);
    if (period === 'year') startDate.setFullYear(startDate.getFullYear() - 1);
    
    const sessions = await StudySession.find({
      userId: req.userId,
      date: { $gte: startDate }
    });
    
    const totalHours = sessions.reduce((sum, s) => sum + (s.duration / 60), 0);
    const totalSessions = sessions.length;
    const avgFocus = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + s.focusLevel, 0) / sessions.length 
      : 0;
    const avgEnergy = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.energyLevel || 5), 0) / sessions.length
      : 0;
    
    // Subject breakdown
    const subjectStats = {};
    sessions.forEach(session => {
      if (!subjectStats[session.subject]) {
        subjectStats[session.subject] = {
          hours: 0,
          sessions: 0,
          avgFocus: 0,
          totalFocus: 0
        };
      }
      subjectStats[session.subject].hours += session.duration / 60;
      subjectStats[session.subject].sessions += 1;
      subjectStats[session.subject].totalFocus += session.focusLevel;
    });
    
    Object.keys(subjectStats).forEach(subject => {
      subjectStats[subject].avgFocus = 
        subjectStats[subject].totalFocus / subjectStats[subject].sessions;
      delete subjectStats[subject].totalFocus;
    });
    
    // Daily breakdown
    const dailyStats = {};
    sessions.forEach(session => {
      const dateKey = session.date.toISOString().split('T')[0];
      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = { hours: 0, sessions: 0 };
      }
      dailyStats[dateKey].hours += session.duration / 60;
      dailyStats[dateKey].sessions += 1;
    });
    
    res.json({
      success: true,
      period,
      summary: {
        totalHours: Math.round(totalHours * 10) / 10,
        totalSessions,
        averageFocus: Math.round(avgFocus * 10) / 10,
        averageEnergy: Math.round(avgEnergy * 10) / 10,
        consistencyScore: sessions.length > 0 
          ? Math.round((Object.keys(dailyStats).length / (period === 'week' ? 7 : 30)) * 100)
          : 0
      },
      subjectBreakdown: subjectStats,
      dailyBreakdown: dailyStats
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;