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
    const { jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Parse the following job description and extract structured data as JSON.

Job Description:
${jobDescription}

Extract and return ONLY a JSON object with these exact fields:
{
  "company": "Company name",
  "position": "Job title",
  "location": "Job location (or 'Remote')",
  "salary_range": "Salary range if mentioned, otherwise null",
  "required_skills": ["skill1", "skill2"],
  "preferred_skills": ["skill1", "skill2"],
  "keywords": ["keyword1", "keyword2"]
}

Return only the JSON object, no markdown formatting or explanation.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsedData = JSON.parse(cleanedText);

    return res.status(200).json(parsedData);
  } catch (error) {
    console.error('Error parsing job description:', error);
    return res.status(500).json({ 
      error: 'Failed to parse job description',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}