const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { supabase } = require('../../supabaseClient'); // Updated path
const PORT = process.env.PORT || 5001;

require('dotenv').config();

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

// Middleware to parse JSON request bodies
router.use(bodyParser.json());

// Signup Route
router.post('/signup', async (req, res) => {
  const { email, password, username } = req.body;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }, // Save username in metadata
      },
    });

    if (error) {
      console.error('Supabase Signup Error:', error.message);
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({
      message: 'User signed up successfully',
      user: data.user,
    });
  } catch (err) {
    console.error('Unexpected Signup Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('Supabase Login Error:', error.message);
      return res.status(400).json({ error: error.message });
    }

    // Fetch the username from user metadata
    const username = data.user.user_metadata?.username || data.user.email.split('@')[0];

    const token = jwt.sign({ userId: data.user.id, email: data.user.email, username }, SECRET_KEY, {
      expiresIn: '1h',
    });

    res.status(200).json({
      message: 'Login successful',
      username,
      user: data.user,
      token,
    });
  } catch (err) {
    console.error('Unexpected Login Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Feedback Routes

// POST /feedback - Submit feedback
router.post('/feedback', async (req, res) => {
  const { user_id, username, feedback } = req.body; // Extract user and feedback details

  try {
    const { data, error } = await supabase
      .from('feedbacks') // Replace 'feedbacks' with your table name
      .insert([{ user_id, username, feedback }]);

    if (error) {
      console.error('Error inserting feedback:', error.message);
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: data,
    });
  } catch (err) {
    console.error('Unexpected Feedback Submission Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /feedback - Fetch all feedback
router.get('/feedback', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('feedbacks') // Replace 'feedbacks' with your table name
      .select('*')
      .order('created_at', { ascending: false }); // Sort by latest feedback

    if (error) {
      console.error('Error fetching feedback:', error.message);
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({
      feedbacks: data,
    });
  } catch (err) {
    console.error('Unexpected Feedback Fetch Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected Route Example
router.get('/protected', (req, res) => {
  res.status(200).json({
    message: 'You have accessed a protected route!',
  });
});

module.exports = router;
