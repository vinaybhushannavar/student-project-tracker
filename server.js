import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10kb' }));
app.use(express.static('public'));

// Ensure the 'data' directory exists
if (!fs.existsSync('data')) {
  fs.mkdirSync('data');
}

// Initialize SQLite database
const db = new DatabaseSync('data/projects.db');

// Create the projects table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    status TEXT NOT NULL
  )
`);

// Seed a sample project if the table is empty
const rowCount = db.prepare('SELECT COUNT(*) as count FROM projects').get();
if (rowCount.count === 0) {
  db.prepare('INSERT INTO projects (name, status) VALUES (?, ?)').run('Sample Project', 'Planned');
}

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// GET /api/projects - Retrieve all projects from SQLite
app.get('/api/projects', (req, res) => {
  const projects = db.prepare('SELECT id, name, status FROM projects').all();
  res.json(projects);
});

// POST /api/projects - Create a new project in SQLite
app.post('/api/projects', (req, res) => {
  const { name, status } = req.body;
  
  if (!name || !status) {
    return res.status(400).json({ error: 'Name and status are required' });
  }

  const insert = db.prepare('INSERT INTO projects (name, status) VALUES (?, ?)');
  const result = insert.run(name.trim(), status);

  const newProject = {
    id: Number(result.lastInsertRowid),
    name: name.trim(),
    status: status
  };

  res.status(201).json(newProject);
});

// PUT /api/projects/:id - Update an existing project in SQLite
app.put('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const { name, status } = req.body;

  if (!name || !status) {
    return res.status(400).json({ error: 'Name and status are required' });
  }

  const update = db.prepare('UPDATE projects SET name = ?, status = ? WHERE id = ?');
  const result = update.run(name.trim(), status, id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Project not found' });
  }

  res.json({ id: Number(id), name: name.trim(), status });
});

// DELETE /api/projects/:id - Delete a project from SQLite
app.delete('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const remove = db.prepare('DELETE FROM projects WHERE id = ?');
  const result = remove.run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Project not found' });
  }

  res.json({ success: true, id: Number(id) });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});