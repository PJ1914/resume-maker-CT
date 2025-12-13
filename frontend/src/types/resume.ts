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
  otherLinks?: string[];
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
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
  url?: string;
}

export interface Achievement {
  id: string;
  title: string;
  text?: string;
  description: string;
  result?: string;
  date: string;
}

export interface Hackathon {
  id: string;
  name: string;
  achievement: string;
  date: string;
  description?: string;
}

export interface Workshop {
  id: string;
  name: string;
  role: string;
  description: string;
  date?: string;
}

export interface Publication {
  id: string;
  title: string;
  publisher: string;
  date: string;
  link?: string;
  authors?: string;
}

export interface Volunteer {
  id: string;
  organization: string;
  role: string;
  date: string;
  description: string;
}

export interface Language {
  id: string;
  language: string;
  proficiency: string;
}

// Dynamic section type for flexible resume structure
export type SectionType =
  | 'contact'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'achievements'
  | 'hackathons'
  | 'workshops'
  | 'publications'
  | 'volunteer'
  | 'languages'
  | 'custom';

// Human-readable labels for each section type
export const SECTION_LABELS: Record<SectionType, string> = {
  contact: 'Contact Information',
  summary: 'Professional Summary',
  experience: 'Work Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  achievements: 'Achievements',
  hackathons: 'Hackathons & Competitions',
  workshops: 'Workshops',
  publications: 'Publications',
  volunteer: 'Volunteer Work',
  languages: 'Languages',
  custom: 'Custom Section',
};

// Available sections that can be added dynamically
export const AVAILABLE_SECTIONS: SectionType[] = [
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'achievements',
  'hackathons',
  'workshops',
  'publications',
  'volunteer',
  'languages',
  'custom',
];

export interface DynamicSection {
  id: string;
  type: SectionType;
  title: string;
  items: Record<string, unknown>[];
  order: number;
}

export interface ResumeData {
  id?: string;
  userId?: string;
  template?: string;  // Template ID (resume_1 through resume_7)
  contact: ContactInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications?: Certification[];
  achievements?: Achievement[];
  hackathons?: Hackathon[];
  workshops?: Workshop[];
  publications?: Publication[];
  volunteer?: Volunteer[];
  languages?: Language[];
  // Dynamic sections from Gemini parsing
  sections?: DynamicSection[];
  customSections?: { [key: string]: any[] };
  createdAt?: Date;
  updatedAt?: Date;
  originalFileUrl?: string; // URL to the originally uploaded file
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
  certifications: [],
  achievements: [],
  hackathons: [],
  workshops: [],
  publications: [],
  volunteer: [],
  languages: [],
  sections: [],
  customSections: {},
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
  id: crypto.randomUUID(),
  name: '',
  issuer: '',
  date: '',
});

export const createEmptyAchievement = (): Achievement => ({
  id: crypto.randomUUID(),
  title: '',
  description: '',
  date: '',
});

export const createEmptyHackathon = (): Hackathon => ({
  id: crypto.randomUUID(),
  name: '',
  achievement: '',
  date: '',
  description: '',
});

export const createEmptyWorkshop = (): Workshop => ({
  id: crypto.randomUUID(),
  name: '',
  role: '',
  description: '',
  date: '',
});

export const createEmptyPublication = (): Publication => ({
  id: crypto.randomUUID(),
  title: '',
  publisher: '',
  date: '',
  link: '',
});

export const createEmptyVolunteer = (): Volunteer => ({
  id: crypto.randomUUID(),
  organization: '',
  role: '',
  date: '',
  description: '',
});

export const createEmptyLanguage = (): Language => ({
  id: crypto.randomUUID(),
  language: '',
  proficiency: '',
});
