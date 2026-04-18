import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiX, FiSend, FiUser, FiCpu, FiHelpCircle, FiThumbsUp, FiBookOpen, FiClock, FiTarget, FiZap } from 'react-icons/fi';

const Chatbot = ({ sessions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hi! I'm your AI Study Assistant 🤖\n\nI can help you with:\n• Study tips and techniques\n• Motivation and encouragement\n• Analyzing your study patterns\n• Answering questions about learning\n\nHow can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chatbot opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Calculate study stats for personalized responses
  const getStudyStats = () => {
    const totalHours = sessions.reduce((sum, s) => sum + (s.duration / 60), 0);
    const totalSessions = sessions.length;
    const avgFocus = sessions.length > 0 ? sessions.reduce((sum, s) => sum + s.focusLevel, 0) / sessions.length : 0;
    const uniqueDays = [...new Set(sessions.map(s => s.date))].length;
    
    return { totalHours, totalSessions, avgFocus, uniqueDays };
  };

  // Generate bot response based on user input
  const generateResponse = (userMessage) => {
    const msg = userMessage.toLowerCase();
    const stats = getStudyStats();
    
    // Greeting responses
    if (msg.match(/hi|hello|hey|greetings/)) {
      return "Hello! 👋 I'm your STUDYDNA AI assistant. How can I help with your studies today?";
    }
    
    // Motivation responses
    if (msg.match(/motivate|motivation|encourage|inspiring/)) {
      const quotes = [
        "💪 Success is the sum of small efforts, repeated day in and day out.",
        "🌟 The expert in anything was once a beginner.",
        "📚 Don't let what you cannot do interfere with what you can do.",
        "🎯 Your future self will thank you for the effort you put in today.",
        "⚡ Consistency is more important than intensity. Keep showing up!"
      ];
      return quotes[Math.floor(Math.random() * quotes.length)];
    }
    
    // Study tips
    if (msg.match(/tip|advice|suggestion|how to study|study technique/)) {
      const tips = [
        "📖 Use the Pomodoro Technique: 25 minutes study, 5 minutes break, repeat!",
        "🧠 Practice active recall - test yourself instead of just re-reading.",
        "📝 Use spaced repetition: Review after 1 day, 3 days, then 1 week.",
        "🎯 Study your most challenging subject when your energy is highest.",
        "💡 Teach what you learn to someone else - it reinforces understanding.",
        "🚫 Eliminate distractions: Put your phone in another room during study time."
      ];
      return tips[Math.floor(Math.random() * tips.length)];
    }
    
    // Stats related
    if (msg.match(/my progress|my stats|how am i doing|performance/)) {
      if (stats.totalSessions === 0) {
        return "You haven't logged any study sessions yet! Start by logging your first session in the 'Log Session' tab. I'll be able to give you personalized insights once you have some data. 📊";
      }
      return `Based on your study data:\n\n📚 Total Study Time: ${stats.totalHours.toFixed(1)} hours\n🎯 Average Focus: ${stats.avgFocus.toFixed(1)}/10\n📅 Study Days: ${stats.uniqueDays} days\n\nYou're doing great! Keep building that consistency! 🚀`;
    }
    
    // Focus related
    if (msg.match(/focus|concentrate|distracted/)) {
      return "🎯 To improve focus:\n\n• Try the 5-minute rule: Commit to just 5 minutes of studying\n• Remove phone notifications\n• Create a dedicated study space\n• Use website blockers for distracting sites\n• Take regular short breaks\n\nWould you like more specific tips?";
    }
    
    // Exam related
    if (msg.match(/exam|test|prepare|preparation/)) {
      return "📝 Exam Preparation Tips:\n\n• Start early - cramming isn't effective\n• Create a study schedule\n• Practice with past papers\n• Get enough sleep before the exam\n• Stay hydrated and eat well\n\nBreak down your syllabus into manageable chunks. You've got this! 💪";
    }
    
    // Break related
    if (msg.match(/break|rest|tired|burnout/)) {
      return "😌 Taking breaks is essential for learning!\n\n• Take a 5-10 min break every 45-60 minutes\n• Move around, stretch, or take a short walk\n• Stay hydrated\n• Try deep breathing exercises\n• Get 7-8 hours of sleep\n\nRemember: Rest is productive! 🧘";
    }
    
    // Subject specific
    if (msg.match(/math|mathematics/)) {
      return "📐 Mathematics Study Tips:\n\n• Practice problems daily\n• Understand concepts before memorizing\n• Create a formula sheet\n• Work through examples step-by-step\n• Don't skip the basics!\n\nNeed help with a specific topic?";
    }
    
    if (msg.match(/science|physics|chemistry|biology/)) {
      return "🔬 Science Study Tips:\n\n• Create diagrams and visual aids\n• Understand the 'why' behind concepts\n• Use mnemonics for memorization\n• Conduct hands-on experiments if possible\n• Connect concepts to real-world examples";
    }
    
    // Language learning
    if (msg.match(/language|english|vocabulary/)) {
      return "📖 Language Learning Tips:\n\n• Practice daily, even 15 minutes helps\n• Use flashcards for vocabulary\n• Watch shows/movies in target language\n• Speak out loud to practice pronunciation\n• Keep a journal in the language you're learning";
    }
    
    // Productivity
    if (msg.match(/productive|productivity|efficient/)) {
      return "⚡ Productivity Boosters:\n\n• Use the 2-minute rule: Do tasks under 2 minutes immediately\n• Prioritize tasks (urgent vs important)\n• Time block your schedule\n• Take regular breaks\n• Review your progress daily\n\nWhat's your biggest productivity challenge?";
    }
    
    // Help menu
    if (msg.match(/help|what can you do|commands/)) {
      return "🤖 I can help you with:\n\n💡 Study Tips & Techniques\n🎯 Motivation & Encouragement\n📊 Your Study Progress Stats\n📝 Exam Preparation Advice\n😌 Break & Burnout Prevention\n📚 Subject-Specific Tips\n\nJust ask me anything! Try:\n• 'Give me a study tip'\n• 'Motivate me'\n• 'How am I doing?'\n• 'How to focus better?'";
    }
    
    // Thank you
    if (msg.match(/thank|thanks|appreciate/)) {
      return "You're welcome! 😊 I'm here to help you succeed in your studies. Keep up the great work! 🎓";
    }
    
    // Default response
    return "That's a great question! 🤔\n\nI can help with study tips, motivation, exam preparation, and analyzing your study patterns.\n\nTry asking me:\n• 'Give me a study tip'\n• 'Motivate me'\n• 'How am I doing?'\n• 'How to focus better?'\n\nWhat would you like to know?";
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: input
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Generate and add bot response after delay
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        text: generateResponse(input)
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        className="chatbot-button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <FiMessageSquare size={28} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chatbot-window"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              bottom: '100px',
              right: '100px',
              width: '380px',
              height: '550px',
              background: 'var(--bg-secondary)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 1001,
              border: '1px solid var(--border-color)'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '15px 20px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FiCpu size={24} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>AI Study Assistant</h3>
                  <p style={{ margin: 0, fontSize: '11px', opacity: 0.9 }}>Online • Ready to help</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '5px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '15px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: 'var(--bg-primary)'
            }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                    animation: 'fadeIn 0.3s ease'
                  }}
                >
                  <div style={{
                    maxWidth: '80%',
                    padding: '12px 15px',
                    borderRadius: msg.type === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: msg.type === 'user' 
                      ? 'linear-gradient(135deg, #667eea, #764ba2)'
                      : 'var(--bg-secondary)',
                    color: msg.type === 'user' ? 'white' : 'var(--text-primary)',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    border: msg.type === 'bot' ? '1px solid var(--border-color)' : 'none'
                  }}>
                    <div style={{ whiteSpace: 'pre-wrap', fontSize: '13px', lineHeight: '1.5' }}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{
                    padding: '12px 15px',
                    borderRadius: '18px 18px 18px 4px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    gap: '4px'
                  }}>
                    <span style={{ animation: 'typing 1.4s infinite' }}>●</span>
                    <span style={{ animation: 'typing 1.4s infinite 0.2s' }}>●</span>
                    <span style={{ animation: 'typing 1.4s infinite 0.4s' }}>●</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{
              padding: '15px',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              display: 'flex',
              gap: '10px'
            }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about studying..."
                style={{
                  flex: 1,
                  padding: '12px 15px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '25px',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: input.trim() ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'var(--border-color)',
                  border: 'none',
                  color: 'white',
                  cursor: input.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FiSend size={18} />
              </button>
            </div>

            {/* Quick Suggestions */}
            <div style={{
              padding: '10px 15px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              background: 'var(--bg-secondary)'
            }}>
              <button
                onClick={() => {
                  setInput("Give me a study tip");
                  setTimeout(() => handleSend(), 100);
                }}
                style={{
                  padding: '6px 12px',
                  background: 'rgba(102,126,234,0.1)',
                  border: '1px solid rgba(102,126,234,0.2)',
                  borderRadius: '20px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  color: '#667eea'
                }}
              >
                💡 Study Tip
              </button>
              <button
                onClick={() => {
                  setInput("Motivate me");
                  setTimeout(() => handleSend(), 100);
                }}
                style={{
                  padding: '6px 12px',
                  background: 'rgba(102,126,234,0.1)',
                  border: '1px solid rgba(102,126,234,0.2)',
                  borderRadius: '20px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  color: '#667eea'
                }}
              >
                🎯 Motivate Me
              </button>
              <button
                onClick={() => {
                  setInput("How am I doing?");
                  setTimeout(() => handleSend(), 100);
                }}
                style={{
                  padding: '6px 12px',
                  background: 'rgba(102,126,234,0.1)',
                  border: '1px solid rgba(102,126,234,0.2)',
                  borderRadius: '20px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  color: '#667eea'
                }}
              >
                📊 My Progress
              </button>
              <button
                onClick={() => {
                  setInput("Help");
                  setTimeout(() => handleSend(), 100);
                }}
                style={{
                  padding: '6px 12px',
                  background: 'rgba(102,126,234,0.1)',
                  border: '1px solid rgba(102,126,234,0.2)',
                  borderRadius: '20px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  color: '#667eea'
                }}
              >
                ❓ Help
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes typing {
          0%, 60%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          30% {
            opacity: 1;
            transform: translateY(-5px);
          }
        }
      `}</style>
    </>
  );
};

export default Chatbot;