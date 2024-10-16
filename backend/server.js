const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Sample user data (In production, use a database)
let users = [
  { id: 1, username: 'user', password: 'userpass', role: 'user' },
  { id: 2, username: 'admin', password: 'adminpass', role: 'admin' },
];

// Function to generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, 'secret_key', { expiresIn: '1h' });
};

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    const token = generateToken(user);
    return res.json({ token, role: user.role });
  }
  return res.status(401).json({ message: 'Invalid username or password' });
});

// Signup endpoint
app.post('/signup', (req, res) => {
  const { username, password, role } = req.body;
  const userExists = users.some(u => u.username === username);

  if (userExists) {
    return res.status(409).json({ message: 'Username already exists' });
  }

  const newUser = { id: users.length + 1, username, password, role };
  users.push(newUser);
  const token = generateToken(newUser);
  return res.json({ token, role: newUser.role });
});

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'secret_key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Protected admin endpoint
app.get('/admin', authenticateToken, (req, res) => {
  if (req.user.role === 'admin') {
    return res.json({ message: 'Welcome Admin!' });
  }
  return res.sendStatus(403);
});

// Protected user endpoint
app.get('/user', authenticateToken, (req, res) => {
  return res.json({ message: 'Welcome User!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
