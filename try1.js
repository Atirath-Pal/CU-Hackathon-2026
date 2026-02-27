const fs = require('fs');

async function cleanAndValidateProblems() {
    try {
        console.log("Reading problems_db.json...");
        
        // 1. Load the data
        const rawData = fs.readFileSync('problems_db.json', 'utf8');
        const problems = JSON.parse(rawData);
        
        let validCount = 0;
        let invalidCount = 0;

        // 2. Define the validation logic
        const cleanedProblems = problems.filter((p, index) => {
            const hasRequiredFields = 
                p.title && 
                p.difficulty && 
                p.slug && 
                Array.isArray(p.topics) && p.topics.length > 0 &&
                p.description && p.description.trim() !== "" &&
                p.code_snippets && Object.keys(p.code_snippets).length > 0 &&
                Array.isArray(p.examples);

            if (hasRequiredFields) {
                validCount++;
                return true;
            } else {
                invalidCount++;
                // Optional: Log which problem is broken for your own debugging
                // console.log(`Skipping: ${p.title || 'Unknown Title'} (Index: ${index})`);
                return false;
            }
        });

        // 3. Save the valid problems to the new file
        fs.writeFileSync('problems_db_cleaned.json', JSON.stringify(cleanedProblems, null, 2));

        // 4. Output the results
        console.log("-----------------------------------------");
        console.log(`✅ Validation Complete!`);
        console.log(`Total Complete Problems: ${validCount}`);
        console.log(`Total Invalid/Incomplete Problems Removed: ${invalidCount}`);
        console.log(`Saved to: problems_db_cleaned.json`);
        console.log("-----------------------------------------");

    } catch (error) {
        console.error("❌ Error during validation:", error.message);
    }
}

cleanAndValidateProblems();