/**
 * Resume data types for the editor
 */

export interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  title: string;  // Alias for position
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  highlights: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  honors?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  highlights: string[];
  startDate?: string;
  endDate?: string;
}

export interface Skill {
  category: string;
  items: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
}

export interface Achievement {
  title: string;
  description: string;
  date: string;
}

export interface Language {
  id: string;
  language: string;
  proficiency: string;
}

export interface ResumeData {
  id?: string;
  userId?: string;
  contact: ContactInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications?: Certification[];
  achievements?: Achievement[];
  languages?: Language[];
  createdAt?: Date;
  updatedAt?: Date;
}

export const createEmptyResume = (): ResumeData => ({
  contact: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  projects: [],
});

export const createEmptyExperience = (): Experience => ({
  id: crypto.randomUUID(),
  company: '',
  position: '',
  title: '',
  location: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
  highlights: [],
});

export const createEmptyEducation = (): Education => ({
  id: crypto.randomUUID(),
  institution: '',
  degree: '',
  field: '',
  location: '',
  startDate: '',
  endDate: '',
});

export const createEmptyProject = (): Project => ({
  id: crypto.randomUUID(),
  name: '',
  description: '',
  technologies: [],
  highlights: [],
});

export const createEmptySkill = (): Skill => ({
  category: '',
  items: [],
});

export const createEmptyCertification = (): Certification => ({
  name: '',
  issuer: '',
  date: '',
});

export const createEmptyAchievement = (): Achievement => ({
  title: '',
  description: '',
  date: '',
});

export const createEmptyLanguage = (): Language => ({
  id: crypto.randomUUID(),
  language: '',
  proficiency: '',
});
