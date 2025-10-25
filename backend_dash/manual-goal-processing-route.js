// Add this route to your goals.js routes file

// Manual trigger for goal completion processing (for testing/debugging)
router.post('/process-completions', authMiddleware, async (req, res) => {
  try {
    const { batchProcessGoalCompletions } = require('../batch-process-goals');
    
    console.log('🎯 Manual goal completion processing triggered by user:', req.user.id);
    
    // Run the batch processing
    await batchProcessGoalCompletions();
    
    res.json({
      success: true,
      message: 'Goal completion processing completed successfully'
    });
    
  } catch (error) {
    console.error('Manual goal processing error:', error);
    res.status(500).json({ 
      message: 'Failed to process goal completions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Export this to add to your existing goals.js routes