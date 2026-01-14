import { GoogleGenerativeAI } from '@google/generative-ai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { masterResume, jobDescription } = req.body;

    if (!masterResume || !jobDescription) {
      return res.status(400).json({ 
        error: 'Both masterResume and jobDescription are required' 
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an expert resume writer. Based on the master resume and job description below, create a tailored resume and cover letter.

MASTER RESUME:
${JSON.stringify(masterResume, null, 2)}

JOB DESCRIPTION:
Company: ${jobDescription.company}
Position: ${jobDescription.position}
Required Skills: ${jobDescription.required_skills?.join(', ')}
Keywords: ${jobDescription.keywords?.join(', ')}

Task:
1. Select the most relevant experiences, projects, and skills from the master resume
2. Tailor descriptions to match job requirements using keywords naturally
3. Generate a professional cover letter highlighting key matches
4. Return ONLY a JSON object with this structure:

{
  "tailored_resume": {
    "personal_info": {...},
    "experience": [...],
    "education": [...],
    "projects": [...],
    "skills": {...}
  },
  "cover_letter": "Full cover letter text here..."
}

Return only the JSON object, no markdown or explanation.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const generatedData = JSON.parse(cleanedText);

    return res.status(200).json(generatedData);
  } catch (error) {
    console.error('Error generating application:', error);
    return res.status(500).json({ 
      error: 'Failed to generate application',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}