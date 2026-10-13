[1mdiff --git a/server.js b/server.js[m
[1mindex 7024005..9dcf2d2 100644[m
[1m--- a/server.js[m
[1m+++ b/server.js[m
[36m@@ -9,11 +9,41 @@[m [mapp.use(express.json({ limit: '10kb' }));[m
 // Serve static files from the 'public' folder[m
 app.use(express.static('public'));[m
 [m
[32m+[m[32m// In-memory storage for projects[m
[32m+[m[32mlet projects = [[m
[32m+[m[32m  { id: 1, name: 'Sample Project', status: 'Planned' }[m
[32m+[m[32m];[m
[32m+[m
 // Health check API route[m
 app.get('/api/health', (req, res) => {[m
   res.json({ ok: true });[m
 });[m
 [m
[32m+[m[32m// GET /api/projects - Retrieve all projects[m
[32m+[m[32mapp.get('/api/projects', (req, res) => {[m
[32m+[m[32m  res.json(projects);[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32m// POST /api/projects - Create a new project[m
[32m+[m[32m// POST /api/projects - Create a new project[m
[32m+[m[32mapp.post('/api/projects', (req, res) => {[m
[32m+[m[32m  console.log("POST /api/projects route was hit!"); // <-- Add this line[m
[32m+[m[32m  const { name, status } = req.body;[m
[32m+[m[41m  [m
[32m+[m[32m  if (!name || !status) {[m
[32m+[m[32m    return res.status(400).json({ error: 'Name and status are required' });[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  const newProject = {[m
[32m+[m[32m    id: projects.length > 0 ? projects[projects.length - 1].id + 1 : 1,[m
[32m+[m[32m    name: name.trim(),[m
[32m+[m[32m    status: status[m
[32m+[m[32m  };[m
[32m+[m
[32m+[m[32m  projects.push(newProject);[m
[32m+[m[32m  res.status(201).json(newProject);[m
[32m+[m[32m});[m
[32m+[m
 // Start the server[m
 app.listen(PORT, () => {[m
   console.log(`Server is running on port ${PORT}`);[m
