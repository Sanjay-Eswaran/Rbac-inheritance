// seed.js
const { Low, JSONFile } = require('lowdb');
const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');

async function seed() {
  const adapter = new JSONFile('db.json');
  const db = new Low(adapter);
  await db.read();
  db.data ||= { users: [], roles: [] };

  db.data.roles = ['Viewer','Editor','Manager','Admin'];

  const hashed = await bcrypt.hash('password123', 8);

  db.data.users = [
    { id: nanoid(), name: 'Sanjay admin',  email: 'sanjay@gmail.com', password: hashed, roles: ['Admin'] },
    { id: nanoid(), name: 'Rickey Manager', email: 'rickey@gmail.com',  password: hashed, roles: ['Manager'] },
    { id: nanoid(), name: 'Vetri Editor',   email: 'vetri@gmail.com',   password: hashed, roles: ['Editor'] },
    { id: nanoid(), name: 'manju Viewer',  email: 'manju@gmail.com',  password: hashed, roles: ['Viewer'] }
  ];

  await db.write();
  console.log('Seed complete. Users: sanjay/rickey/vetri/manju (password: password123)');
}

seed();
