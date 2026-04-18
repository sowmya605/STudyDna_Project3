const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 1,
    max: 480
  },
  subject: {
    type: String,
    required: true,
    enum: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 
            'English', 'History', 'Geography', 'Economics', 'Programming', 
            'Data Science', 'Artificial Intelligence', 'Other']
  },
  topic: {
    type: String,
    trim: true
  },
  focusLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    validate: {
      validator: Number.isInteger,
      message: 'Focus level must be an integer'
    }
  },
  distractions: {
    type: String,
    enum: ['None', 'Phone', 'Social Media', 'Noise', 'Tiredness', 'Hunger', 'Other'],
    default: 'None'
  },
  energyLevel: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  understanding: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  notes: {
    type: String,
    maxlength: 500
  },
  location: {
    type: String,
    enum: ['Home', 'Library', 'Cafe', 'College', 'Other'],
    default: 'Home'
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
studySessionSchema.index({ userId: 1, date: -1 });
studySessionSchema.index({ userId: 1, subject: 1 });

module.exports = mongoose.model('StudySession', studySessionSchema);