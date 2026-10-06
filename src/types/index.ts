export type ProjectCategory =
  | "software-engineering"
  | "logistics"
  | "ai-ml"
  | "computer-vision"
  | "architecture"
  | "experiment";

export interface Project {
  id: string;
  title: string;
  summary: string;
  category: ProjectCategory;
  role: string;
  technologies: string[];
  metrics?: string[];
  featured: boolean;
  githubUrl?: string;
  demoUrl?: string;
}

export interface ProjectSection {
  id: string;
  number: number;
  title: string;
  content: string;
  type: "text" | "diagram" | "metrics" | "code";
}

export interface ProjectDetail extends Project {
  sections: ProjectSection[];
}

export interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  duration: string;
  location?: string;
  responsibilities: string[];
  achievements?: FeaturedAchievement[];
}

export interface FeaturedAchievement {
  id: string;
  title: string;
  context: string;
  technicalWork: string[];
  impact: string;
  metrics?: string[];
  technologies: string[];
  featured: boolean;
}

export interface SkillGroup {
  title: string;
  skills: string[];
}

export interface PhilosophyPoint {
  title: string;
  description: string;
  keywords: string[];
}

export interface Profile {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  resumeUrl?: string;
  currentInterests: string[];
  philosophy: PhilosophyPoint[];
}
