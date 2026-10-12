import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON with a size limit
app.use(express.json({ limit: '10kb' }));

// Serve static files from the 'public' folder
app.use(express.static('public'));

// Health check API route
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});