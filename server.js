const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Database files
const TODOS_FILE = 'todos.json';
const HISTORY_FILE = 'history.json';

// Initialize data files
if (!fs.existsSync(TODOS_FILE)) fs.writeFileSync(TODOS_FILE, '[]');
if (!fs.existsSync(HISTORY_FILE)) fs.writeFileSync(HISTORY_FILE, '[]');

let todos = JSON.parse(fs.readFileSync(TODOS_FILE));
let taskHistory = JSON.parse(fs.readFileSync(HISTORY_FILE));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API Endpoints
app.get('/todos', (req, res) => res.json(todos));
app.get('/todos/history', (req, res) => res.json(taskHistory));

app.post('/todos', (req, res) => {
  const newTodo = {
    id: Date.now(),
    text: req.body.text,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null
  };
  
  todos.push(newTodo);
  fs.writeFileSync(TODOS_FILE, JSON.stringify(todos));
  
  // Add to history if not exists
  if (!taskHistory.includes(req.body.text)) {
    taskHistory.push(req.body.text);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(taskHistory));
  }
  
  res.status(201).json(newTodo);
});

app.patch('/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === parseInt(req.params.id));
  if (todo) {
    todo.completed = req.body.completed;
    // Update completion time
    if (req.body.completed) {
      todo.completedAt = new Date().toISOString();
    } else {
      todo.completedAt = null;
    }
    fs.writeFileSync(TODOS_FILE, JSON.stringify(todos));
    res.json(todo);
  } else {
    res.status(404).send('Not found');
  }
});

app.delete('/todos/:id', (req, res) => {
  todos = todos.filter(t => t.id !== parseInt(req.params.id));
  fs.writeFileSync(TODOS_FILE, JSON.stringify(todos));
  res.sendStatus(204);
});

app.delete('/todos/history', (req, res) => {
  taskHistory = [];
  fs.writeFileSync(HISTORY_FILE, '[]');
  res.sendStatus(200);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));