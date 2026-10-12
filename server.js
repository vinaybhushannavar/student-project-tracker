import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON with a size limit
app.use(express.json({ limit: '10kb' }));

// Serve static files from the 'public' folder
app.use(express.static('public'));

// In-memory storage for projects
let projects = [
  { id: 1, name: 'Sample Project', status: 'Planned' }
];

// Health check API route
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// GET /api/projects - Retrieve all projects
app.get('/api/projects', (req, res) => {
  res.json(projects);
});

// POST /api/projects - Create a new project
// POST /api/projects - Create a new project
app.post('/api/projects', (req, res) => {
  console.log("POST /api/projects route was hit!"); // <-- Add this line
  const { name, status } = req.body;
  
  if (!name || !status) {
    return res.status(400).json({ error: 'Name and status are required' });
  }

  const newProject = {
    id: projects.length > 0 ? projects[projects.length - 1].id + 1 : 1,
    name: name.trim(),
    status: status
  };

  projects.push(newProject);
  res.status(201).json(newProject);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});