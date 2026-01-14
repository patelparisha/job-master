const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:3000/api' 
  : '/api';

export async function parseJobDescription(jobDescription: string) {
  const response = await fetch(`${API_BASE}/parse-job-description`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobDescription })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || 'Failed to parse job description');
  }

  return response.json();
}

export async function generateApplication(masterResume: any, jobDescription: any) {
  const response = await fetch(`${API_BASE}/generate-application`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ masterResume, jobDescription })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || 'Failed to generate application');
  }

  return response.json();
}