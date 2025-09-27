// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { Low, JSONFile } = require('lowdb');

const { signToken, verifyTokenMiddleware } = require('./auth');
const { requireRole, expandRoles } = require('./rbac');

const app = express();
app.use(express.json());
app.use(cors());               // optional but helpful
app.use(express.static('public')); // serve the front page from /public

const adapter = new JSONFile('db.json');
const db = new Low(adapter);

app.get('/api/public', (req, res) => {
  res.json({ message: 'Public data visible to anyone' });
});

app.post('/api/login', async (req, res) => {
  await db.read();
  db.data ||= { users: [], roles: [] };
  const { email, password } = req.body || {};
  const user = (db.data.users || []).find(u => u.email === email);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = signToken(user);
  const userSafe = { id: user.id, name: user.name, email: user.email, roles: user.roles };
  res.json({ token, user: userSafe });
});

app.get('/api/profile', verifyTokenMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.get('/api/editor-content', verifyTokenMiddleware, requireRole('Editor'), (req, res) => {
  res.json({ message: 'Editor content — you are Editor or higher', roles: req.user.roles, expanded: expandRoles(req.user.roles) });
});

app.get('/api/manager-only', verifyTokenMiddleware, requireRole('Manager'), (req, res) => {
  res.json({ message: 'Manager content — you are Manager or higher' });
});

app.get('/api/admin-only', verifyTokenMiddleware, requireRole('Admin'), (req, res) => {
  res.json({ message: 'Admin content — only Admin allowed' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
