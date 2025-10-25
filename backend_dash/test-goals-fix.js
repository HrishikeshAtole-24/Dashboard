const express = require('express');
const { body, validationResult } = require('express-validator');

// Test validation setup (similar to our fixed goals.js)
const validateGoalCreation = [
  body('website_id').notEmpty().trim().withMessage('Website ID is required'),
  body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Name must be between 1 and 255 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('goal_type').isIn(['url_destination', 'event', 'page_duration', 'form_submit', 'click']).withMessage('Invalid goal type'),
  body('conditions').isObject().withMessage('Conditions must be an object'),
  body('value').optional().isFloat({ min: 0 }).withMessage('Value must be a positive number')
];

const app = express();
app.use(express.json());

// Test route
app.post('/test-validation', validateGoalCreation, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }
    
    res.json({ message: 'Validation passed successfully!', body: req.body });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test validation server running on port ${PORT}`);
  console.log('Test with:');
  console.log(`curl -X POST http://localhost:${PORT}/test-validation -H "Content-Type: application/json" -d '{"website_id": "test123", "name": "Test Goal", "goal_type": "url_destination", "conditions": {}}'`);
});