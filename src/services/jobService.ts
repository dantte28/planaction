import { Job } from "../types";

// In a real app, this would call a backend or use a library like 'apify-client' or 'bright-data'
// For this demo, we simulate a fetch that merges with existing data
export const fetchDailyJobs = async (existingJobs: Job[]): Promise<Job[]> => {
  // Simulation of an API call
  const newJobs: Job[] = [
    {
      id: "new-1",
      empresa: "Google",
      regiao: "Belo Horizonte, MG",
      vaga: "Data Engineer",
      nivel: "Pleno",
      salario: "R$ 15.000",
      modelo: "Híbrido",
      ferramentas: "GCP, SQL, Python",
      fonte: "Google Careers",
      link: "https://google.com/careers",
      prob: 45,
      obs: "Vaga de alto nível, exige GCP.",
      lastUpdated: new Date().toISOString()
    }
  ];

  const merged = [...existingJobs];
  newJobs.forEach(newJob => {
    if (!merged.find(j => j.empresa === newJob.empresa && j.vaga === newJob.vaga)) {
      merged.push(newJob);
    }
  });

  return merged;
};

/**
 * Google Calendar Integration Note:
 * To implement Google Calendar events:
 * 1. Setup Google Cloud Project with Calendar API enabled.
 * 2. Implement OAuth2 flow to get 'access_token'.
 * 3. Use the following function:
 */
export const createCalendarEvent = async (accessToken: string, interview: any) => {
  const event = {
    'summary': `Interview with ${interview.company}`,
    'description': interview.notes,
    'start': {
      'dateTime': `${interview.date}T${interview.time}:00Z`,
      'timeZone': 'America/Sao_Paulo',
    },
    'end': {
      'dateTime': `${interview.date}T${parseInt(interview.time) + 1}:00Z`,
      'timeZone': 'America/Sao_Paulo',
    },
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });
  return response.json();
};
