export type JobLevel = "Júnior" | "Pleno" | "Sênior" | "Júnior/Pleno";
export type JobModel = "Presencial" | "Híbrido" | "Remoto" | "Presencial/Híbrido" | "Híbrido/Remoto";
export type InterviewStatus = "scheduled" | "completed" | "rejected" | "passed";

export interface JobTask {
  applied: boolean;
  contactedRecruiter: boolean;
  followUp: boolean;
  notes: string;
}

export interface Job {
  id: string;
  empresa: string;
  regiao: string;
  vaga: string;
  nivel: JobLevel;
  salario: string;
  modelo: JobModel;
  ferramentas: string;
  fonte: string;
  link: string;
  prob: number;
  obs: string;
  tasks?: JobTask;
  lastUpdated?: string;
}

export interface Interview {
  id: string;
  jobId: string;
  company: string;
  date: string;
  time: string;
  status: InterviewStatus;
  notes: string;
  feedback?: {
    strengths: string;
    weaknesses: string;
    recruiterFeedback: string;
    finalResult: string;
  };
}

export interface UserProfile {
  name: string;
  role: string;
  skills: string[];
  experience: string;
}
