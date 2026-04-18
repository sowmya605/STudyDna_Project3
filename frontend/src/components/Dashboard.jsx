import React from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import SmartFeatures from './SmartFeatures';
import ImageToNotes from './ImageToNotes';
import ExamRescue from './ExamRescue';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const Dashboard = ({ sessions, insights }) => {
  const totalHours = sessions.reduce((sum, s) => sum + (s.duration / 60), 0);
  const avgFocus = sessions.length > 0 
    ? sessions.reduce((sum, s) => sum + s.focusLevel, 0) / sessions.length 
    : 0;

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  });

  const dailyHours = last7Days.map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const dateStr = date.toISOString().split('T')[0];
    return sessions
      .filter(s => s.date === dateStr)
      .reduce((sum, s) => sum + (s.duration / 60), 0);
  });

  const lineChartData = {
    labels: last7Days,
    datasets: [
      {
        label: 'Study Hours',
        data: dailyHours,
        borderColor: 'rgb(102, 126, 234)',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(102, 126, 234)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  };

  const subjectData = sessions.reduce((acc, session) => {
    acc[session.subject] = (acc[session.subject] || 0) + (session.duration / 60);
    return acc;
  }, {});

  const doughnutData = {
    labels: Object.keys(subjectData),
    datasets: [
      {
        data: Object.values(subjectData),
        backgroundColor: [
          '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'
        ],
        borderWidth: 0,
        borderRadius: 10
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'var(--text-primary)'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'var(--border-color)'
        },
        ticks: {
          color: 'var(--text-secondary)'
        }
      },
      x: {
        grid: {
          color: 'var(--border-color)'
        },
        ticks: {
          color: 'var(--text-secondary)'
        }
      }
    }
  };

  const stats = [
    { icon: '⏱️', label: 'Total Study Hours', value: totalHours.toFixed(1), unit: 'hrs', trend: 'Total across all sessions' },
    { icon: '🎯', label: 'Average Focus', value: avgFocus.toFixed(1), unit: '/10', trend: avgFocus > 7 ? 'Great focus!' : 'Building focus' },
    { icon: '📅', label: 'Total Sessions', value: sessions.length, unit: '', trend: `${sessions.length} sessions logged` },
    { icon: '📊', label: 'Consistency Score', value: insights?.consistencyScore || 0, unit: '%', trend: insights?.consistencyScore >= 70 ? 'Excellent routine!' : 'Stay consistent!' }
  ];

  return (
    <div className="dashboard">
      <SmartFeatures sessions={sessions} />
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <h3>{stat.label}</h3>
            <div className="stat-value">
              {stat.value}<span style={{ fontSize: '20px' }}>{stat.unit}</span>
            </div>
            <div className="stat-trend">{stat.trend}</div>
          </div>
        ))}
      </div>

      <div className="charts-container">
        <div className="chart-card">
          <h3>📈 Weekly Study Pattern</h3>
          <div style={{ height: '350px' }}>
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3>📚 Subject Distribution</h3>
          <div style={{ height: '350px' }}>
            <Doughnut data={doughnutData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Recent Study Sessions */}
      <div className="recent-sessions">
        <div className="section-header">
          <h3>📋 Recent Study Sessions</h3>
          <span className="session-count">{sessions.length} total sessions</span>
        </div>
        
        {sessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            <p>No study sessions logged yet. Click the + button to log your first session!</p>
          </div>
        ) : (
          <div className="sessions-list">
            {sessions.slice(0, 5).map((session, idx) => (
              <div key={session._id || idx} className="session-item">
                <div className="session-date">
                  <span className="date">{new Date(session.date).toLocaleDateString()}</span>
                  <span className="time">{session.time}</span>
                </div>
                <div className="session-info">
                  <span className="subject">{session.subject}</span>
                  <span className="duration">{session.duration} min</span>
                </div>
                <div className="session-focus">
                  <div className="focus-bar">
                    <div 
                      className="focus-fill" 
                      style={{ width: `${(session.focusLevel / 10) * 100}%` }}
                    ></div>
                  </div>
                  <span className="focus-score">{session.focusLevel}/10</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {insights?.productiveWindows && insights.productiveWindows.length > 0 && (
        <div className="glass-card" style={{ padding: '25px', borderRadius: '24px', marginTop: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>⏰ Your Peak Productivity Hours</h3>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            {insights.productiveWindows.map((window, idx) => (
              <div key={idx} style={{
                background: 'var(--gradient-primary)',
                color: 'white',
                padding: '15px 25px',
                borderRadius: '16px',
                textAlign: 'center',
                flex: 1
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {window.hour}:00 - {window.hour+1}:00
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  Productivity Score: {window.avgProductivity}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <ImageToNotes />
      <ExamRescue sessions={sessions} />

    </div>
  );
};

export default Dashboard;