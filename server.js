const express = require('express');
const cors = require('cors');

const app = express();

// CORS configuration
app.use(
  cors({
    origin: [
      'http://localhost:3000', // Local frontend
      'https://login-frontsite.netlify.app', // Replace with your deployed frontend URL
    ],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parse JSON request bodies
app.use(express.json());

// Import authentication routes
const authRoutes = require('./api/auth/auth'); // Updated relative path
app.use('/api/auth', authRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
