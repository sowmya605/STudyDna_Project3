const mongoose = require('mongoose');

const studyGoalSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  targetHours: {
    type: Number,
    required: true,
    min: 1
  },
  currentHours: {
    type: Number,
    default: 0
  },
  deadline: {
    type: Date,
    required: true
  },
  subject: String,
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Failed'],
    default: 'Active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StudyGoal', studyGoalSchema);