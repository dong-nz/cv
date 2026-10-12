export type Language = 'en' | 'vi';

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
  githubUrl?: string;
  demoUrl?: string;
}

export interface ProjectSection {
  id: string;
  number: number;
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
  achievements?: FeaturedAchievement[];
}

export interface FeaturedAchievement {
  id: string;
  title: string;
  titleEn?: string;
  context: string;
  contextEn?: string;
  technicalWork: string[];
  impact: string;
  impactEn?: string;
  metrics?: string[];
  technologies: string[];
  featured: boolean;
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
  resumeUrl?: string;
  currentInterests: string[];
  roles: string[];
  philosophy: PhilosophyPoint[];
}
