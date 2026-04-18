
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiAlertTriangle, FiCalendar, FiClock, FiTarget, FiCheckCircle, 
  FiBookOpen, FiZap, FiTrendingUp, FiStar, FiAward, FiDownload,
  FiSunrise, FiMoon, FiActivity, FiBarChart2
} from 'react-icons/fi';

const ExamRescue = ({ sessions }) => {
  const [examDate, setExamDate] = useState('');
  const [daysRemaining, setDaysRemaining] = useState(null);
  const [rescuePlan, setRescuePlan] = useState(null);
  const [showPlan, setShowPlan] = useState(false);
  const [error, setError] = useState('');

  // Get user's weak subjects based on study data
  const getWeakSubjects = () => {
    if (!sessions || sessions.length === 0) {
      return ['Review all subjects', 'Focus on fundamentals'];
    }
    
    const subjectStats = {};
    sessions.forEach(session => {
      if (!subjectStats[session.subject]) {
        subjectStats[session.subject] = { totalSessions: 0, avgFocus: 0, focusSum: 0 };
      }
      subjectStats[session.subject].totalSessions += 1;
      subjectStats[session.subject].focusSum += session.focusLevel;
    });
    
    Object.keys(subjectStats).forEach(subject => {
      subjectStats[subject].avgFocus = subjectStats[subject].focusSum / subjectStats[subject].totalSessions;
    });
    
    const weakSubjects = Object.entries(subjectStats)
      .sort((a, b) => a[1].avgFocus - b[1].avgFocus)
      .slice(0, 3)
      .map(([subject]) => subject);
    
    return weakSubjects.length > 0 ? weakSubjects : ['Review all subjects', 'Focus on weak areas'];
  };

  const calculateDaysRemaining = () => {
    if (!examDate) return null;
    
    // Parse the date correctly
    const exam = new Date(examDate);
    const today = new Date();
    
    // Reset time part for accurate day calculation
    today.setHours(0, 0, 0, 0);
    exam.setHours(0, 0, 0, 0);
    
    const diffTime = exam - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const generateRescuePlan = (days) => {
    const weakSubjects = getWeakSubjects();
    
    if (days <= 1) {
      return {
        mode: '🚨 EMERGENCY MODE',
        modeColor: '#ef4444',
        message: '⚠️ ONLY 1 DAY LEFT! Focus only on high-yield topics and important questions.',
        schedule: [
          { time: '🌅 Morning Session (4-5 hours)', tasks: [
            '📌 Review ONLY IMPORTANT QUESTIONS from each chapter',
            '📖 Go through SUMMARY notes (not full chapters)',
            '📝 Memorize KEY FORMULAS and DEFINITIONS',
            '📄 Solve 2-3 sample papers (timed)'
          ]},
          { time: '☀️ Afternoon Session (3-4 hours)', tasks: [
            '🎯 Focus on WEAK topics: ' + weakSubjects.slice(0, 2).join(', '),
            '✍️ Practice most COMMON questions',
            '📊 Review mistakes from practice papers'
          ]},
          { time: '🌙 Evening Session (2-3 hours)', tasks: [
            '🔄 Quick revision of all important points',
            '😌 Rest and relax - don\'t study new topics',
            '😴 Get good sleep (7-8 hours)'
          ]}
        ],
        tips: [
          '⚠️ Don\'t study new topics - focus on revision only',
          '🎯 Prioritize high-weightage chapters',
          '📝 Practice time management with timer',
          '😴 Get enough sleep before exam',
          '🥤 Stay hydrated and eat well'
        ],
        prioritySubjects: weakSubjects,
        hoursPerDay: 10
      };
    } 
    else if (days <= 3) {
      return {
        mode: '⚡ CRASH COURSE MODE',
        modeColor: '#f59e0b',
        message: `⚡ ${days} days left! Intensive revision with practice tests.`,
        schedule: [
          { day: `📅 Day 1 (${days} days left)`, tasks: [
            '📚 Complete FULL SYLLABUS revision',
            '🎯 Focus on ' + weakSubjects[0] + ' - your weakest subject',
            '✍️ Solve chapter-wise important questions',
            '📝 Create revision notes/summaries'
          ]},
          { day: `📅 Day 2 (${days-1} days left)`, tasks: [
            '📊 Practice MOCK TESTS (2-3 papers)',
            '🔍 Review and analyze mistakes',
            '🎯 Focus on ' + (weakSubjects[1] || 'second weak subject'),
            '📖 Memorize key formulas and concepts'
          ]},
          { day: `📅 Day 3 (Exam Eve)`, tasks: [
            '🔄 Quick revision of all chapters',
            '📌 Review important questions only',
            '😌 Don\'t study new topics',
            '😴 Rest and prepare mentally'
          ]}
        ],
        tips: [
          '📊 Take at least 2 full mock tests',
          '⏱️ Practice time management',
          '📝 Focus on problem areas',
          '🔄 Revise what you already know',
          '💪 Stay confident and positive'
        ],
        prioritySubjects: weakSubjects,
        hoursPerDay: 8
      };
    } 
    else if (days <= 7) {
      return {
        mode: '📚 INTENSIVE PREP MODE',
        modeColor: '#8b5cf6',
        message: `📚 ${days} days left! Structured preparation with complete coverage.`,
        schedule: [
          { day: `📅 Day 1 (${days} days left)`, tasks: [
            '📖 Complete Chapter 1 & 2 thoroughly',
            '✍️ Solve practice questions',
            '📝 Make notes for revision'
          ]},
          { day: `📅 Day 2 (${days-1} days left)`, tasks: [
            '📖 Complete Chapter 3 & 4',
            '🎯 Focus on ' + weakSubjects[0],
            '📊 Practice numerical/problems'
          ]},
          { day: `📅 Day 3 (${days-2} days left)`, tasks: [
            '📖 Complete Chapter 5 & 6',
            '📝 Take first MOCK TEST',
            '🔍 Analyze weak areas'
          ]},
          { day: `📅 Day 4 (${days-3} days left)`, tasks: [
            '🔄 Review weak topics identified',
            '🎯 Focus on ' + (weakSubjects[1] || 'difficult chapters'),
            '✍️ Practice more questions'
          ]},
          { day: `📅 Day 5 (${days-4} days left)`, tasks: [
            '📖 Complete remaining chapters',
            '📊 Take second MOCK TEST',
            '⏱️ Work on time management'
          ]},
          { day: `📅 Day 6 (${days-5} days left)`, tasks: [
            '🔄 Full syllabus revision',
            '📄 Solve previous year papers',
            '💬 Clarify doubts'
          ]},
          { day: `📅 Day 7 (Exam Eve)`, tasks: [
            '📌 Light revision only',
            '📝 Review important formulas',
            '😴 Rest and relax'
          ]}
        ],
        tips: [
          '📖 Cover 2 chapters per day',
          '📝 Take notes while studying',
          '🎯 Identify and focus on weak areas',
          '⏰ Stick to the schedule',
          '🔄 Revise daily what you studied'
        ],
        prioritySubjects: weakSubjects,
        hoursPerDay: 6
      };
    } 
    else {
      return {
        mode: '🎯 COMPREHENSIVE PREP MODE',
        modeColor: '#10b981',
        message: `🎯 ${days} days left! Complete preparation with spaced revision.`,
        schedule: [
          { week: '📚 Week 1', tasks: [
            '📖 Complete 30% of syllabus',
            '💡 Focus on conceptual clarity',
            '📝 Make detailed notes'
          ]},
          { week: '📚 Week 2', tasks: [
            '📖 Complete next 30% of syllabus',
            '✍️ Start solving practice questions',
            '🔄 Weekly revision'
          ]},
          { week: '📚 Week 3', tasks: [
            '📖 Complete remaining syllabus',
            '🎯 Focus on weak subjects: ' + weakSubjects.join(', '),
            '📊 Take topic-wise tests'
          ]},
          { week: '📚 Week 4', tasks: [
            '🔄 Full syllabus revision',
            '📝 Take mock tests (3-4 papers)',
            '🔍 Review and improve weak areas'
          ]},
          { week: '🎯 Final Days', tasks: [
            '📌 Quick revision of all topics',
            '⭐ Focus on important questions',
            '😴 Rest before exam'
          ]}
        ],
        tips: [
          '📚 Study 4-5 hours daily consistently',
          '📝 Create revision notes as you go',
          '🎯 Take weekly mock tests',
          '🔄 Use spaced repetition for revision',
          '💪 Maintain a steady pace'
        ],
        prioritySubjects: weakSubjects,
        hoursPerDay: 5
      };
    }
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setExamDate(selectedDate);
    setError('');
    
    if (selectedDate) {
      const days = calculateDaysRemaining();
      setDaysRemaining(days);
      
      if (days < 0) {
        setError('Exam date has already passed! Please select a future date.');
      } else if (days === 0) {
        setDaysRemaining(1); // Treat today as 1 day for emergency mode
      }
    } else {
      setDaysRemaining(null);
    }
  };

  const handleGeneratePlan = () => {
    console.log("Generate button clicked");
    console.log("Exam date:", examDate);
    
    if (!examDate) {
      setError('Please select your exam date');
      return;
    }
    
    const days = calculateDaysRemaining();
    console.log("Days remaining:", days);
    
    if (days < 0) {
      setError('Exam date has already passed! Please select a future date.');
      return;
    }
    
    // Use 1 day if exam is today
    const effectiveDays = days === 0 ? 1 : days;
    
    if (effectiveDays >= 0) {
      const plan = generateRescuePlan(effectiveDays);
      setRescuePlan(plan);
      setShowPlan(true);
    }
  };

  const getDaysMessage = () => {
    if (daysRemaining === null) return null;
    if (daysRemaining < 0) return { text: "❌ Exam date has passed!", color: "#ef4444" };
    if (daysRemaining === 0) return { text: "🚨 EXAM IS TODAY! Emergency mode activated!", color: "#ef4444" };
    if (daysRemaining === 1) return { text: "⚠️ ONLY 1 DAY LEFT! Emergency mode recommended!", color: "#ef4444" };
    if (daysRemaining <= 3) return { text: `⚡ ${daysRemaining} days left - Crash course mode!`, color: "#f59e0b" };
    if (daysRemaining <= 7) return { text: `📚 ${daysRemaining} days left - Intensive prep mode`, color: "#8b5cf6" };
    return { text: `🎯 ${daysRemaining} days left - Comprehensive preparation`, color: "#10b981" };
  };

  const daysMessage = getDaysMessage();
  const todayDate = new Date().toISOString().split('T')[0];

  return (
    <motion.div 
      className="exam-rescue-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: 'var(--bg-secondary)',
        borderRadius: '24px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: 'var(--card-shadow)',
        border: '1px solid var(--border-color)'
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>⏰</div>
        <h2 style={{ fontSize: '24px', marginBottom: '5px' }}>Last-Minute Exam Rescue</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Get a personalized crash study plan based on your exam date</p>
      </div>

      {/* Date Selector */}
      {!showPlan ? (
        <div>
          <div style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(245, 158, 11, 0.05))',
            borderRadius: '20px',
            padding: '25px',
            marginBottom: '20px',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <FiCalendar size={32} style={{ color: '#ef4444' }} />
              <div>
                <h3 style={{ fontSize: '18px', marginBottom: '5px' }}>When is your exam?</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Select your exam date to generate a customized rescue plan</p>
              </div>
            </div>
            
            <input
              type="date"
              value={examDate}
              onChange={handleDateChange}
              min={todayDate}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '16px',
                marginBottom: '15px'
              }}
            />
            
            {error && (
              <div style={{
                padding: '10px',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '8px',
                marginBottom: '15px',
                color: '#ef4444',
                fontSize: '13px',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}
            
            {daysRemaining !== null && daysRemaining >= 0 && !error && (
              <div style={{
                padding: '12px',
                background: `rgba(${daysMessage.color === '#ef4444' ? '239,68,68' : daysMessage.color === '#f59e0b' ? '245,158,11' : daysMessage.color === '#8b5cf6' ? '139,92,246' : '16,185,129'}, 0.1)`,
                borderRadius: '12px',
                textAlign: 'center',
                marginBottom: '15px'
              }}>
                <span style={{ color: daysMessage.color, fontWeight: '600' }}>{daysMessage.text}</span>
              </div>
            )}
            
            <button
              onClick={handleGeneratePlan}
              disabled={!examDate || (daysRemaining !== null && daysRemaining < 0) || !!error}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontWeight: '600',
                fontSize: '16px',
                cursor: (!examDate || (daysRemaining !== null && daysRemaining < 0) || !!error) ? 'not-allowed' : 'pointer',
                opacity: (!examDate || (daysRemaining !== null && daysRemaining < 0) || !!error) ? 0.5 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              🚀 Generate Rescue Plan
            </button>
          </div>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Mode Banner */}
            <div style={{
              background: `linear-gradient(135deg, ${rescuePlan.modeColor}20, ${rescuePlan.modeColor}10)`,
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '25px',
              border: `2px solid ${rescuePlan.modeColor}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '5px' }}>
                {rescuePlan.mode === '🚨 EMERGENCY MODE' ? '🚨' : 
                 rescuePlan.mode === '⚡ CRASH COURSE MODE' ? '⚡' :
                 rescuePlan.mode === '📚 INTENSIVE PREP MODE' ? '📚' : '🎯'}
              </div>
              <h3 style={{ fontSize: '20px', color: rescuePlan.modeColor }}>{rescuePlan.mode}</h3>
              <p style={{ color: 'var(--text-primary)', marginTop: '8px' }}>{rescuePlan.message}</p>
              <div style={{
                display: 'inline-block',
                padding: '4px 12px',
                background: `${rescuePlan.modeColor}20`,
                borderRadius: '20px',
                fontSize: '12px',
                marginTop: '10px'
              }}>
                📅 {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining • ⏱️ {rescuePlan.hoursPerDay} hours/day
              </div>
            </div>

            {/* Study Schedule */}
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiClock /> Study Schedule
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {rescuePlan.schedule.map((item, idx) => (
                  <div key={idx} style={{
                    background: 'var(--bg-primary)',
                    borderRadius: '16px',
                    padding: '18px',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div style={{
                      fontWeight: '600',
                      color: rescuePlan.modeColor,
                      marginBottom: '12px',
                      fontSize: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <FiTarget size={16} />
                      {item.time || item.day || item.week}
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {item.tasks.map((task, taskIdx) => (
                        <li key={taskIdx} style={{ marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Subjects */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(102, 126, 234, 0.05))',
              borderRadius: '16px',
              padding: '18px',
              marginBottom: '25px',
              border: '1px solid rgba(139, 92, 246, 0.2)'
            }}>
              <h3 style={{ fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiStar /> Priority Subjects (Focus on these)
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {rescuePlan.prioritySubjects.map((subject, idx) => (
                  <span key={idx} style={{
                    padding: '6px 14px',
                    background: 'rgba(139, 92, 246, 0.15)',
                    borderRadius: '20px',
                    fontSize: '13px',
                    color: '#8b5cf6'
                  }}>
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.05)',
              borderRadius: '16px',
              padding: '18px',
              marginBottom: '20px',
              border: '1px solid rgba(16, 185, 129, 0.15)'
            }}>
              <h3 style={{ fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiAward /> Quick Tips for Success
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {rescuePlan.tips.map((tip, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <FiCheckCircle style={{ color: '#10b981', fontSize: '14px' }} />
                    {tip}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  const planText = `
═══════════════════════════════════════
  ${rescuePlan.mode}
═══════════════════════════════════════

${rescuePlan.message}

📅 Days Remaining: ${daysRemaining}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 STUDY SCHEDULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${rescuePlan.schedule.map(item => `
${'='.repeat(50)}
${item.time || item.day || item.week}
${'-'.repeat(30)}
${item.tasks.map(t => `• ${t}`).join('\n')}
`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 PRIORITY SUBJECTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${rescuePlan.prioritySubjects.join(', ')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 QUICK TIPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${rescuePlan.tips.map(t => `✓ ${t}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️ Hours per day: ${rescuePlan.hoursPerDay}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generated by STUDYDNA - Exam Rescue Mode
              `;
                  const blob = new Blob([planText], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `exam_rescue_plan_${daysRemaining}days.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#10b981',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: '600'
                }}
              >
                <FiDownload /> Download Plan
              </button>
              <button
                onClick={() => {
                  setShowPlan(false);
                  setExamDate('');
                  setDaysRemaining(null);
                  setRescuePlan(null);
                  setError('');
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: '600'
                }}
              >
                🔄 Start Over
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default ExamRescue;