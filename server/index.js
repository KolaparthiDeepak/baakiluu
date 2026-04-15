const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const DATA_PATH = path.join(__dirname, 'data.json');
function readData() {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      const d = { version: 2, customers: [], suppliers: [], settings: { theme: 'light' } };
      fs.writeFileSync(DATA_PATH, JSON.stringify(d, null, 2));
      return d;
    }
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read data.json', err);
    return { version: 2, customers: [], suppliers: [], settings: { theme: 'light' } };
  }
}
function writeData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

// Health
app.get('/api/health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));

// Get full dump (read-only)
app.get('/api/dump', (req, res) => {
  const data = readData();
  res.json({ ok: true, data });
});

// Save full dump (replace)
app.post('/api/dump', (req, res) => {
  const payload = req.body;
  if (!payload || typeof payload !== 'object') return res.status(400).json({ ok: false, error: { message: 'Invalid payload' } });
  writeData(payload);
  res.json({ ok: true });
});

// Serve client statically
app.use('/', express.static(path.join(__dirname, '..')));

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
