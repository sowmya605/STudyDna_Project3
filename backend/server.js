const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const auth = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/studydna';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📦 Database: ${mongoose.connection.name}`);
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

// Store sessions in memory (per user)
let allSessions = []; // Changed from Map to simple array for testing
let sessionId = 1;

// ============ AUTH ROUTES ============
app.use('/api/auth', authRoutes);

// ============ TEST ROUTE ============
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'STUDYDNA API is running',
    timestamp: new Date().toISOString()
  });
});

// ============ SESSION ROUTES (NO AUTH REQUIRED FOR TESTING) ============
app.get('/api/sessions', (req, res) => {
  console.log('GET /api/sessions - Returning', allSessions.length, 'sessions');
  res.json(allSessions);
});

app.post('/api/sessions', (req, res) => {
  console.log('POST /api/sessions - Received:', req.body);
  
  try {
    const { date, time, duration, subject, focusLevel, notes } = req.body;
    
    // Validate required fields
    if (!date || !time || !duration || !subject || !focusLevel) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'date, time, duration, subject, and focusLevel are required'
      });
    }
    
    const newSession = {
      _id: (sessionId++).toString(),
      date,
      time,
      duration: parseInt(duration),
      subject,
      focusLevel: parseInt(focusLevel),
      notes: notes || '',
      createdAt: new Date()
    };
    
    allSessions.unshift(newSession);
    console.log('✅ Session saved successfully! Total sessions:', allSessions.length);
    res.status(201).json(newSession);
  } catch (error) {
    console.error('Error saving session:', error);
    res.status(500).json({ error: 'Failed to save session' });
  }
});

app.delete('/api/sessions/:id', (req, res) => {
  allSessions = allSessions.filter(s => s._id !== req.params.id);
  res.json({ message: 'Deleted' });
});

// ============ AI INSIGHTS ============
app.get('/api/analytics/insights', (req, res) => {
  const sessions = allSessions;
  console.log('GET /api/analytics/insights - Processing', sessions.length, 'sessions');
  
  if (sessions.length === 0) {
    return res.json({
      consistencyScore: 0,
      productiveWindows: [],
      focusDropAnalysis: {
        dropDuration: 60,
        pattern: 'No data yet',
        recommendation: 'Log your first study session'
      },
      studyStyle: 'Need more data',
      burnoutRisk: { risk: 'Low', reason: 'Not enough data', recommendation: 'Log at least 3 sessions' },
      weeklySummary: {
        totalHours: 0,
        averageFocus: 0,
        topSubject: 'None',
        totalSessions: 0,
        improvement: 'Start logging sessions!'
      },
      explanations: {
        consistencyExplanation: 'No data yet',
        productivityExplanation: 'Log sessions to see insights',
        styleExplanation: 'Need 3+ sessions'
      }
    });
  }
  
  const totalHours = sessions.reduce((sum, s) => sum + (s.duration / 60), 0);
  const avgFocus = sessions.reduce((sum, s) => sum + s.focusLevel, 0) / sessions.length;
  const uniqueDays = [...new Set(sessions.map(s => s.date))].length;
  const consistencyScore = Math.min(100, Math.floor((uniqueDays / 7) * 100));
  
  const hourStats = {};
  sessions.forEach(s => {
    const hour = parseInt(s.time.split(':')[0]);
    if (!hourStats[hour]) hourStats[hour] = { total: 0, count: 0 };
    hourStats[hour].total += s.focusLevel;
    hourStats[hour].count++;
  });
  
  const productiveWindows = Object.entries(hourStats)
    .map(([h, d]) => ({ hour: parseInt(h), avgProductivity: Math.round((d.total/d.count)*10)/10, sessionCount: d.count }))
    .sort((a,b) => b.avgProductivity - a.avgProductivity)
    .slice(0, 3);
  
  const subjCount = {};
  sessions.forEach(s => { subjCount[s.subject] = (subjCount[s.subject] || 0) + 1; });
  const topSubject = Object.keys(subjCount).length ? Object.keys(subjCount).reduce((a,b) => subjCount[a] > subjCount[b] ? a : b) : 'None';
  
  res.json({
    consistencyScore: consistencyScore,
    productiveWindows: productiveWindows,
    focusDropAnalysis: {
      dropDuration: 60,
      pattern: `Focus typically drops after 60 minutes`,
      recommendation: `Take a break every 45 minutes`
    },
    studyStyle: avgFocus > 7 ? 'Deep-Focus Learner' : 'Balanced Learner',
    burnoutRisk: { risk: 'Low', reason: 'Healthy patterns', recommendation: 'Keep going!' },
    weeklySummary: {
      totalHours: Math.round(totalHours * 10) / 10,
      averageFocus: Math.round(avgFocus * 10) / 10,
      topSubject: topSubject,
      totalSessions: sessions.length,
      improvement: totalHours > 10 ? 'Great work!' : totalHours > 5 ? 'Good start!' : 'Keep logging!'
    },
    explanations: {
      consistencyExplanation: `You studied on ${uniqueDays} days. Score: ${consistencyScore}%`,
      productivityExplanation: productiveWindows.length ? `Best time: ${productiveWindows[0].hour}:00` : 'Log more sessions',
      styleExplanation: `Keep up the good work!`
    }
  });
});

app.get('/api/analytics/weekly-report', (req, res) => {
  const sessions = allSessions;
  const totalHours = sessions.reduce((sum, s) => sum + (s.duration / 60), 0);
  const avgFocus = sessions.length ? sessions.reduce((sum, s) => sum + s.focusLevel, 0) / sessions.length : 0;
  
  res.json({
    totalHours: totalHours.toFixed(1),
    averageFocus: avgFocus.toFixed(1),
    topSubject: 'General',
    totalSessions: sessions.length,
    improvement: sessions.length ? 'Keep going!' : 'Log your first session'
  });
});

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n╔═══════════════════════════════════════════════════╗`);
  console.log(`║     🧬 STUDYDNA BACKEND RUNNING 🧬               ║`);
  console.log(`╚═══════════════════════════════════════════════════╝`);
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  console.log(`\n📡 Available endpoints:`);
  console.log(`   POST /api/auth/register - Register new user`);
  console.log(`   POST /api/auth/login    - Login user`);
  console.log(`   POST /api/sessions      - Save study session (NO AUTH NEEDED)`);
  console.log(`   GET  /api/sessions      - Get all sessions (NO AUTH NEEDED)`);
  console.log(`   GET  /api/analytics/insights - Get AI insights (NO AUTH NEEDED)`);
  console.log(`   GET  /api/health        - Health check\n`);
});