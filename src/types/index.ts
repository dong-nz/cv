export type Language = 'en' | 'vi';

export type Palette = 'red' | 'blue';

export type SocialId = 'github' | 'linkedin' | 'email' | 'telegram' | 'zalo';

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
  titleEn?: string;
  summary: string;
  summaryEn?: string;
  category: ProjectCategory;
  role: string;
  technologies: string[];
  metrics?: string[];
  featured: boolean;
}

export interface ProjectSection {
  id: string;
  title: string;
  titleEn?: string;
  content: string;
  contentEn?: string;
  type: "text" | "diagram" | "metrics" | "code";
}

export interface ProjectDetail extends Project {
  sections: ProjectSection[];
}

export interface ExperienceEntry {
  id: string;
  title: string;
  titleEn?: string;
  company: string;
  duration: string;
  location?: string;
  responsibilities: string[];
  responsibilitiesEn?: string[];
  variant?: 'current' | 'gap';
  logo?: string;
}

export interface SkillGroup {
  title: string;
  titleEn?: string;
  skills: string[];
}

export interface PhilosophyPoint {
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  keywords: string[];
}

export interface Profile {
  name: string;
  nameEn: string;
  firstName: string;
  lastName: string;
  title: string;
  titleEn?: string;
  tagline: string;
  taglineEn?: string;
  bio: string;
  bioEn?: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  githubHandle: string;
  linkedinHandle: string;
  telegramUrl: string;
  telegramHandle: string;
  zaloUrl: string;
  currentInterests: string[];
  roles: string[];
  philosophy: PhilosophyPoint[];
}
