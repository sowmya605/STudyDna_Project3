const { body, validationResult } = require('express-validator');

const validateSession = [
  body('duration').isInt({ min: 1, max: 480 }).withMessage('Duration must be between 1 and 480 minutes'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('focusLevel').isInt({ min: 1, max: 10 }).withMessage('Focus level must be between 1 and 10'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    next();
  }
];

const validateGoal = [
  body('title').notEmpty().withMessage('Goal title is required'),
  body('targetHours').isFloat({ min: 0.5, max: 100 }).withMessage('Target hours must be between 0.5 and 100'),
  body('deadline').isISO8601().withMessage('Invalid deadline date'),
  body('priority').optional().isIn(['Low', 'Medium', 'High']),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    next();
  }
];

module.exports = { validateSession, validateGoal };