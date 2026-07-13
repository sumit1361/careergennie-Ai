const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);


async function analyzeResume(resumeText, jobText="") {

    const model = genAI.getGenerativeModel({
        model:"gemini-2.5-flash"
    });


    const prompt = `
You are an ATS resume analyzer.

Analyze this resume.

Return ONLY valid JSON.

Format:

{
 "skills":[],
 "experienceYears":0,
 "education":"",
 "score":0,
 "matchPercentage":0,
 "strengths":[],
 "weaknesses":[],
 "suggestions":[]
}


Resume:

${resumeText}


Job Description:

${jobText}
`;


    const result = await model.generateContent(prompt);


    const response =
        result.response.text();


    return JSON.parse(response);
}


module.exports = analyzeResume;