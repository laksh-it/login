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
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signUp({ email, password });

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

    const token = jwt.sign({ userId: data.user.id, email: data.user.email }, SECRET_KEY, {
      expiresIn: '1h',
    });

    res.status(200).json({
      message: 'Login successful',
      user: data.user,
      token: token,
    });
  } catch (err) {
    console.error('Unexpected Login Error:', err);
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
