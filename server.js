const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const DATA_PATH = path.join(__dirname, 'problems_db(1).json');

let problemsCache = null;

function loadProblems() {
  if (problemsCache) return problemsCache;

  const raw = fs.readFileSync(DATA_PATH, 'utf8');
  const data = JSON.parse(raw);

  if (!Array.isArray(data)) {
    throw new Error('problems_db(1).json must export an array');
  }

  problemsCache = data;
  return problemsCache;
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/problems', (req, res) => {
  try {
    const problems = loadProblems();
    res.json(problems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load problems data' });
  }
});

app.get('/api/problems/:slug', (req, res) => {
  try {
    const problems = loadProblems();
    const problem = problems.find((p) => p.slug === req.params.slug);

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    res.json(problem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load problem' });
  }
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});

// Test route
app.get('/', (req, res) => {
  res.send('Server is running! Ready for integration. ');
});