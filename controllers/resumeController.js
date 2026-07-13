const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeResume(resumeText, jobText = "") {

    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash"
    });

    const prompt = `
Analyze this resume and return ONLY valid JSON.

Format:
{
  "skills": [],
  "experienceYears": 0,
  "score": 0,
  "suggestions": []
}

Resume:
${resumeText}

Job Description:
${jobText}
`;

    const result = await model.generateContent(prompt);

    const response = result.response.text();

    return JSON.parse(response);
}

module.exports = analyzeResume;