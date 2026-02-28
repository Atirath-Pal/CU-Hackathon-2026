require('dotenv').config(); // MUST BE LINE 1
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { GoogleGenerativeAI } = require("@google/generative-ai");


const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ==========================================
// 1. MONGODB & AI INITIALIZATION
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cu-hackathon')
    .then(() => console.log('🔥 MongoDB Connected'))
    .catch(err => console.error('MongoDB Error:', err));

// Test Cases (Merged successfully!)
const testCases = require(path.join(__dirname, 'testCase.js'));
console.log("Loaded tests for:", Object.keys(testCases));

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
// app.post('/api/register', async (req, res) => {
//     try {
//         const { username, email, password } = req.body;
//         const existingUser = await User.findOne({ $or: [{ email }, { username }] });
//         if (existingUser) return res.status(400).json({ success: false, message: "User exists." });

//         const verificationToken = crypto.randomBytes(32).toString('hex');
//         const newUser = new User({ username, email, password, verificationToken, isVerified: false });
//         await newUser.save();

//         const verificationLink = `http://localhost:${PORT}/api/verify/${verificationToken}`;
//         await transporter.sendMail({
//             from: `"Code Assistant" <${process.env.EMAIL_USER}>`,
//             to: email,
//             subject: 'Verify Your Account 🚀',
//             html: `<p>Click here: <a href="${verificationLink}">Verify Account</a></p>`
//         });
//         res.status(200).json({ success: true, message: "Check email!" });
//     } catch (err) { res.status(500).json({ success: false }); }
// });

// app.get('/api/verify/:token', async (req, res) => {
//     try {
//         const user = await User.findOne({ verificationToken: req.params.token });
//         if (!user) return res.status(400).send("Invalid token.");
//         user.isVerified = true;
//         user.verificationToken = undefined;
//         await user.save();
//         res.redirect('http://localhost:5173/login');
//     } catch (err) { res.status(500).send("Error"); }
// });

// app.post('/api/login', async (req, res) => {
//     const { username, password } = req.body;
//     try {
//         const user = await User.findOne({ username, password });
//         if (!user || !user.isVerified) return res.status(400).json({ success: false, message: "Invalid or Unverified." });
//         res.status(200).json({ success: true, userId: user._id });
//     } catch (err) { res.status(500).json({ success: false }); }
// });


// ==========================================
// 4. AUTH & EMAIL ROUTES (FIXED)
// ==========================================
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 1. Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) return res.status(400).json({ success: false, message: "User exists." });

        // 2. Create user with token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const newUser = new User({ username, email, password, verificationToken, isVerified: false });
        await newUser.save();

        // 3. Attempt to send email
        const verificationLink = `http://localhost:${PORT}/api/verify/${verificationToken}`;

        try {
            await transporter.sendMail({
                from: `"Code Assistant" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Verify Your Account 🚀',
                html: `
                    <div style="font-family: sans-serif; padding: 20px;">
                        <h2>Welcome to Code Assistant!</h2>
                        <p>Please verify your account to start coding:</p>
                        <a href="${verificationLink}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Account</a>
                    </div>
                `
            });
            res.status(200).json({ success: true, message: "Registration successful! Check your email." });
        } catch (mailError) {
            console.error("Mail Delivery Error:", mailError);
            // If mail fails, we still created the user, so let them know
            res.status(200).json({
                success: true,
                message: "User created, but verification email failed to send. Please contact admin."
            });
        }
    } catch (err) {
        console.error("Registration Logic Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

app.get('/api/verify/:token', async (req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });
        if (!user) return res.status(400).send("<h1>Invalid or Expired Token</h1>");

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        // Redirect to your frontend login page
        res.redirect('http://localhost:5173/login?verified=true');
    } catch (err) {
        console.error("Verification Error:", err);
        res.status(500).send("Error verifying account.");
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Find the user by username ONLY
        const user = await User.findOne({ username });

        // 2. If no user is found, stop here
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found." });
        }

        // 3. Check the password
        // IF YOU ARE USING BCRYPT: use await bcrypt.compare(password, user.password)
        // IF YOU ARE NOT USING BCRYPT YET (Plaintext):
        if (user.password !== password) {
            return res.status(400).json({ success: false, message: "Invalid password." });
        }

        // 4. Check verification status
        if (!user.isVerified) {
            return res.status(400).json({ success: false, message: "Please verify your email first." });
        }

        // 5. Success!
        res.status(200).json({ success: true, userId: user._id });

    } catch (err) {
        console.error("Detailed Login Error:", err);
        res.status(500).json({ success: false, message: "Server error during login." });
    }
});

// app.post('/api/login', async (req, res) => {
//     const { username, password } = req.body;
//     try {
//         const user = await User.findOne({ username, password });

//         if (!user) {
//             return res.status(400).json({ success: false, message: "Invalid username or password." });
//         }

//         if (!user.isVerified) {
//             return res.status(400).json({ success: false, message: "Please verify your email first." });
//         }

//         res.status(200).json({ success: true, userId: user._id });
//     } catch (err) {
//         console.error("Login Error:", err);
//         res.status(500).json({ success: false });
//     }
// });
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