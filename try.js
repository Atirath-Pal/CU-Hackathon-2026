const axios = require('axios');
const fs = require('fs');

const RAW_URL = 'https://raw.githubusercontent.com/Atirath-Pal/leetcode-problems/master/merged_problems.json';

async function getProblemData() {
    try {
        console.log("Downloading problem database...");
        const response = await axios.get(RAW_URL);
        
        // THE FIX: The key is actually called 'questions' based on your console output
        const allProblems = response.data.questions; 

        if (!Array.isArray(allProblems)) {
            console.log("Actual keys found in JSON:", Object.keys(response.data));
            throw new Error("Could not find an array under 'questions'.");
        }

        console.log(`✅ Successfully fetched ${allProblems.length} problems.`);

        // 1. Validation & Formatting
        const cleanedData = allProblems.map(p => ({
            title: p.title,
            difficulty: p.difficulty,
            slug: p.problem_slug,
            // 2. Ensure topics are lowercase for your filter feature
            topics: Array.isArray(p.topics) ? p.topics.map(t => t.toLowerCase()) : [],
            description: p.description,
            code_snippets: p.code_snippets,
            examples: p.examples || []
        }));

        // 3. Save it locally
        fs.writeFileSync('problems_db.json', JSON.stringify(cleanedData, null, 2));
        console.log("📂 File saved as: problems_db.json");
        
    } catch (err) {
        console.error("❌ Error:", err.message);
    }
}

getProblemData();