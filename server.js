require('dotenv').config(); // MUST BE LINE 1
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { GoogleGenerativeAI } = require("@google/generative-ai"); // New AI Library

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

<<<<<<< HEAD
// ==========================================
// 1. MONGODB & AI INITIALIZATION
// ==========================================
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cu-hackathon', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('🔥 MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));
=======
const DATA_PATH = path.join(__dirname, 'problems_db(1).json');
const testCases = require(path.join(__dirname, 'testCase.js'));
console.log("Loaded tests for:", Object.keys(testCases));
>>>>>>> 193def8308a21742e3e16cc8d7527616d7b79521

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const User = require('./models/User');

// ==========================================
// 2. EMAIL SERVER SETUP
// ==========================================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS 
    }
});

// ==========================================
// 3. AI ASSISTANT ROUTE (The LLM Part)
// ==========================================
app.post('/api/ai-help', async (req, res) => {
    try {
        const { problemTitle, problemDescription, userCode, language } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        You are a helpful coding mentor. 
        Context: The user is solving a problem titled "${problemTitle}".
        Problem Description: ${problemDescription}
        User's Current ${language} Code:
        \`\`\`${language}
        ${userCode}
        \`\`\`

        Task: Provide a short, encouraging hint. Identify if there is a bug, but DO NOT provide the full corrected code. Help them think through the logic.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ suggestion: response.text() });
    } catch (error) {
        console.error("AI Assistant Error:", error);
        res.status(500).json({ error: "AI Assistant is currently offline." });
    }
});

// ==========================================
// 4. AUTH & EMAIL ROUTES
// ==========================================
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) return res.status(400).json({ success: false, message: "User exists." });

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const newUser = new User({ username, email, password, verificationToken, isVerified: false });
        await newUser.save();

        const verificationLink = `http://localhost:${PORT}/api/verify/${verificationToken}`;
        await transporter.sendMail({
            from: `"Code Assistant" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify Your Account 🚀',
            html: `<p>Click here: <a href="${verificationLink}">Verify Account</a></p>`
        });
        res.status(200).json({ success: true, message: "Check email!" });
    } catch (err) { res.status(500).json({ success: false }); }
});

app.get('/api/verify/:token', async (req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });
        if (!user) return res.status(400).send("Invalid token.");
        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
        res.redirect('http://localhost:5173/login'); 
    } catch (err) { res.status(500).send("Error"); }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (!user || !user.isVerified) return res.status(400).json({ success: false, message: "Invalid or Unverified." });
        res.status(200).json({ success: true, userId: user._id });
    } catch (err) { res.status(500).json({ success: false }); }
});

// ==========================================
// 5. JDOODLE CODE EXECUTION
// ==========================================
app.post('/api/run-code', async (req, res) => {
    const { language, code } = req.body;
    const languageMap = {
        'javascript': { language: 'nodejs', versionIndex: '4' },
        'python3': { language: 'python3', versionIndex: '4' },
        'python': { language: 'python3', versionIndex: '4' },
        'cpp': { language: 'cpp17', versionIndex: '1' },
        'java': { language: 'java', versionIndex: '4' }
    };
    const jDoodleLang = languageMap[language];
    if (!jDoodleLang) return res.status(400).json({ error: "Language unsupported" });

    try {
        const response = await fetch('https://api.jdoodle.com/v1/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                script: code,
                language: jDoodleLang.language,
                versionIndex: jDoodleLang.versionIndex,
                clientId: process.env.JDOODLE_CLIENT_ID, 
                clientSecret: process.env.JDOODLE_CLIENT_SECRET 
            })
        });
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) { res.status(500).json({ error: "Execution failed" }); }
});

// ==========================================
// 6. PROBLEM DATABASE LOGIC
// ==========================================
const DATA_PATH = path.join(__dirname, 'problems_db(1).json');
let problemsCache = null;

function loadProblems() {
  if (problemsCache) return problemsCache;
  const raw = fs.readFileSync(DATA_PATH, 'utf8');
  problemsCache = JSON.parse(raw);
  return problemsCache;
}

app.get('/api/problems', (req, res) => { res.json(loadProblems()); });
app.get('/api/problems/:slug', (req, res) => {
  const problems = loadProblems();
  const problem = problems.find((p) => p.slug === req.params.slug);
  res.json(problem);
});

app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));