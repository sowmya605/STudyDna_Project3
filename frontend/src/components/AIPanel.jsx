import React from 'react';

const AIPanel = ({ insights }) => {
  // Default data if no insights
  const data = insights || {
    studyStyle: 'Not enough data',
    burnoutRisk: { risk: 'Low', reason: 'Need more sessions', recommendation: 'Log 3+ sessions' },
    focusDropAnalysis: { dropDuration: 60, pattern: 'No data', recommendation: 'Log your first session' },
    weeklySummary: { totalHours: 0, averageFocus: 0, topSubject: 'None', totalSessions: 0, improvement: 'Start logging!' },
    productiveWindows: []
  };

  // Calculate AI predictions
  const getPredictedScore = () => {
    const focus = data.weeklySummary?.averageFocus || 0;
    const sessions = data.weeklySummary?.totalSessions || 0;
    if (focus >= 7 && sessions >= 10) return '85-95% (Excellent)';
    if (focus >= 6 && sessions >= 8) return '75-85% (Good)';
    if (focus >= 5 && sessions >= 5) return '65-75% (Average)';
    if (sessions > 0) return 'Below 65% (Needs Improvement)';
    return 'Log sessions to predict';
  };

  const getRecommendation = () => {
    const focus = data.weeklySummary?.averageFocus || 0;
    const sessions = data.weeklySummary?.totalSessions || 0;
    if (focus < 6 && sessions > 0) return 'Try the Pomodoro technique (25 min study, 5 min break) to improve focus';
    if (sessions < 5 && sessions > 0) return 'Increase study frequency - even 30 minutes daily makes a difference';
    if (focus >= 7 && sessions >= 10) return 'Challenge yourself with advanced topics or teach others';
    return 'Log 5+ sessions for personalized recommendations';
  };

  return (
    <div style={{ padding: '30px', background: '#ffffff', borderRadius: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#1a1a2e' }}>🤖 AI Study Intelligence</h2>
      
      {/* Row 1: 3 Main Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🧠</div>
          <h3 style={{ marginBottom: '10px', fontSize: '16px' }}>Learning Style</h3>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#667eea' }}>{data.studyStyle}</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            {data.studyStyle === 'Deep-Focus Learner' && 'Best for complex topics'}
            {data.studyStyle === 'Short-Burst Learner' && 'Perfect for memorization'}
            {data.studyStyle === 'Balanced Learner' && 'Adaptable to any subject'}
            {data.studyStyle === 'Not enough data' && 'Log 3+ sessions to discover'}
          </div>
        </div>
        
        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎯</div>
          <h3 style={{ marginBottom: '10px', fontSize: '16px' }}>Focus Pattern</h3>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>{data.focusDropAnalysis?.pattern || 'Analyzing...'}</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>{data.focusDropAnalysis?.recommendation}</div>
        </div>
        
        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>⚠️</div>
          <h3 style={{ marginBottom: '10px', fontSize: '16px' }}>Burnout Risk</h3>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: data.burnoutRisk?.risk === 'High' ? '#ef4444' : data.burnoutRisk?.risk === 'Medium' ? '#f59e0b' : '#10b981' }}>
            {data.burnoutRisk?.risk || 'Low'}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>{data.burnoutRisk?.reason}</div>
          <div style={{ fontSize: '11px', marginTop: '5px', color: '#667eea' }}>💡 {data.burnoutRisk?.recommendation}</div>
        </div>
      </div>

      {/* Row 2: Focus Duration & Performance Prediction */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '16px' }}>
          <h3 style={{ marginBottom: '15px' }}>⏰ Focus Duration Analysis</h3>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea', marginBottom: '10px' }}>
            {data.focusDropAnalysis?.dropDuration || 60} minutes
          </div>
          <p style={{ color: '#666', marginBottom: '10px', lineHeight: '1.5' }}>
            {data.focusDropAnalysis?.dropDuration <= 45 && 'Your focus drops quickly. Take short breaks every 30 minutes.'}
            {data.focusDropAnalysis?.dropDuration > 45 && data.focusDropAnalysis?.dropDuration <= 90 && 'Good focus stamina! You maintain concentration well.'}
            {data.focusDropAnalysis?.dropDuration > 90 && 'Excellent focus endurance! You can study for extended periods.'}
          </p>
          <div style={{ marginTop: '15px', padding: '10px', background: '#e8f4f8', borderRadius: '10px', fontSize: '13px' }}>
            💡 Recommended: Study {Math.max(25, (data.focusDropAnalysis?.dropDuration || 60) - 15)} min, break 5 min
          </div>
        </div>
        
        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '16px' }}>
          <h3 style={{ marginBottom: '15px' }}>📈 AI Performance Prediction</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '10px' }}>
            {getPredictedScore()}
          </div>
          <p style={{ color: '#666', marginBottom: '10px', lineHeight: '1.5' }}>
            Based on your current study patterns and consistency
          </p>
          <div style={{ marginTop: '15px', padding: '10px', background: '#f3e8ff', borderRadius: '10px', fontSize: '13px' }}>
            🎯 {getRecommendation()}
          </div>
        </div>
      </div>

      {/* Row 3: Weekly Summary */}
      <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '16px', marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '15px' }}>📊 Weekly Performance Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '15px' }}>
          <div style={{ textAlign: 'center', padding: '10px', background: '#fff', borderRadius: '10px' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>Total Hours</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>{data.weeklySummary?.totalHours || 0}h</div>
          </div>
          <div style={{ textAlign: 'center', padding: '10px', background: '#fff', borderRadius: '10px' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>Avg Focus</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{data.weeklySummary?.averageFocus || 0}/10</div>
          </div>
          <div style={{ textAlign: 'center', padding: '10px', background: '#fff', borderRadius: '10px' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>Total Sessions</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{data.weeklySummary?.totalSessions || 0}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '10px', background: '#fff', borderRadius: '10px' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>Top Subject</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#8b5cf6' }}>{data.weeklySummary?.topSubject || 'None'}</div>
          </div>
        </div>
        <div style={{ padding: '12px', background: '#e8f4f8', borderRadius: '10px', textAlign: 'center' }}>
          {data.weeklySummary?.improvement || 'Keep logging your sessions for AI insights!'}
        </div>
      </div>

      {/* Row 4: AI Learning Recommendations (NEW - replaces duplicate content) */}
      <div style={{ padding: '20px', background: 'linear-gradient(135deg, #667eea15, #764ba215)', borderRadius: '16px', marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>🎓</span> AI Learning Recommendations
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
          <div style={{ padding: '15px', background: '#fff', borderRadius: '12px' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📖</div>
            <strong>Active Recall Technique</strong>
            <p style={{ fontSize: '13px', marginTop: '8px', color: '#666' }}>Test yourself before re-reading - improves memory retention by 50%</p>
          </div>
          <div style={{ padding: '15px', background: '#fff', borderRadius: '12px' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔄</div>
            <strong>Spaced Repetition</strong>
            <p style={{ fontSize: '13px', marginTop: '8px', color: '#666' }}>Review material after 1 day, 3 days, then 1 week for best results</p>
          </div>
          <div style={{ padding: '15px', background: '#fff', borderRadius: '12px' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎯</div>
            <strong>Focus Environment</strong>
            <p style={{ fontSize: '13px', marginTop: '8px', color: '#666' }}>Create a distraction-free zone - silence phone, close unnecessary tabs</p>
          </div>
          <div style={{ padding: '15px', background: '#fff', borderRadius: '12px' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>😴</div>
            <strong>Sleep & Learning</strong>
            <p style={{ fontSize: '13px', marginTop: '8px', color: '#666' }}>7-8 hours of sleep improves memory consolidation by 40%</p>
          </div>
        </div>
      </div>

      {/* Row 5: Study Tips Grid */}
      <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '16px' }}>
        <h3 style={{ marginBottom: '15px' }}>💡 Quick Study Tips</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '10px', background: '#fff', borderRadius: '10px', fontSize: '13px' }}>
            📝 Take notes by hand for better retention
          </div>
          <div style={{ padding: '10px', background: '#fff', borderRadius: '10px', fontSize: '13px' }}>
            🎯 Set specific, achievable goals each session
          </div>
          <div style={{ padding: '10px', background: '#fff', borderRadius: '10px', fontSize: '13px' }}>
            💧 Stay hydrated - water boosts brain function
          </div>
          <div style={{ padding: '10px', background: '#fff', borderRadius: '10px', fontSize: '13px' }}>
            🧘 Take 5-min movement breaks every hour
          </div>
          <div style={{ padding: '10px', background: '#fff', borderRadius: '10px', fontSize: '13px' }}>
            📚 Teach what you learn to someone else
          </div>
          <div style={{ padding: '10px', background: '#fff', borderRadius: '10px', fontSize: '13px' }}>
            🎧 Instrumental music can improve focus
          </div>
        </div>
      </div>

      {/* AI Transparency Note */}
      <div style={{ marginTop: '30px', padding: '15px', background: '#f0f4ff', borderRadius: '12px', textAlign: 'center' }}>
        <div style={{ fontSize: '12px', color: '#667eea', marginBottom: '5px' }}>🔬 AI Transparency</div>
        <p style={{ fontSize: '12px', color: '#666' }}>STUDYDNA uses rule-based AI to analyze your study patterns. All insights are generated from your actual session data.</p>
      </div>
    </div>
  );
};

export default AIPanel;