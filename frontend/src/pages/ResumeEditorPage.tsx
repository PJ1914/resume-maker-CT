/**
 * Resume Editor Page
 * Main page for editing resume data with autosave
 * Now supports dynamic sections from Gemini parser
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ResumeData,
  createEmptyResume,
  DynamicSection,
  SectionType,
  SECTION_LABELS,
  AVAILABLE_SECTIONS
} from '../types/resume';
import {
  getResume,
  saveResume,
  getAISuggestion,
  getAIRewrite,
} from '../services/resume-editor.service';
import { normalizeDate } from '../utils/dateUtils';
import { ContactSection } from '../components/editor/ContactSection';
import { SummarySection } from '../components/editor/SummarySection';
import { ExperienceSection } from '../components/editor/ExperienceSection';
import { EducationSection } from '../components/editor/EducationSection';
import { SkillsSection } from '../components/editor/SkillsSection';
import { ProjectsSection } from '../components/editor/ProjectsSection';
import { CertificationsSection } from '../components/editor/CertificationsSection';
import { AchievementsSection } from '../components/editor/AchievementsSection';
import { HackathonsSection } from '../components/editor/HackathonsSection';
import { WorkshopsSection } from '../components/editor/WorkshopsSection';
import { PublicationsSection } from '../components/editor/PublicationsSection';
import { VolunteerSection } from '../components/editor/VolunteerSection';
import { LanguagesSection } from '../components/editor/LanguagesSection';
import { CustomSection } from '../components/editor/CustomSection';
import { AddSection } from '../components/editor/AddSection';
import { ResumePreview } from '../components/ResumePreview';
import PdfExportModal from '../components/PdfExportModal';
import { v4 as uuidv4 } from 'uuid';

// Helper functions to parse sections from text
function normalizeDateFieldsInResume(resume: ResumeData): ResumeData {
  const normalized = { ...resume };

  // Normalize experience dates
  normalized.experience = resume.experience.map(exp => ({
    ...exp,
    startDate: normalizeDate(exp.startDate),
    endDate: exp.current ? '' : normalizeDate(exp.endDate),
  }));

  // Normalize education dates
  normalized.education = resume.education.map(edu => ({
    ...edu,
    startDate: normalizeDate(edu.startDate),
    endDate: normalizeDate(edu.endDate),
  }));

  // Normalize project dates
  normalized.projects = resume.projects.map(proj => ({
    ...proj,
    startDate: normalizeDate(proj.startDate),
    endDate: normalizeDate(proj.endDate),
  }));

  return normalized;
}

function parseExperienceSection(text: string) {
  const experiences: any[] = [];
  const lines = text.split('\n').filter(line => line.trim());

  let currentExp: any = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty or section headers
    if (!trimmed || trimmed.match(/^(EXPERIENCE|PROFESSIONAL EXPERIENCE)/i)) continue;

    // Detect company/title (usually starts with bullet •)
    if (trimmed.startsWith('•')) {
      // Save previous experience
      if (currentExp && currentExp.company) {
        experiences.push(currentExp);
      }

      const content = trimmed.substring(1).trim();
      currentExp = {
        id: crypto.randomUUID(),
        company: content,
        position: '',
        title: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
        highlights: [],
      };
    }
    // Job title/position line (usually italicized in PDF, appears after company)
    else if (currentExp && !currentExp.position && trimmed.match(/^[A-Z][a-z]/)) {
      // Check if it has a date range at the end
      const dateMatch = trimmed.match(/([A-Za-z]{3}\s+\d{4})\s*[-–]\s*([A-Za-z]{3}\s+\d{4}|Present)/i);
      if (dateMatch) {
        currentExp.position = trimmed.replace(dateMatch[0], '').trim();
        currentExp.title = currentExp.position;
        currentExp.startDate = dateMatch[1];
        currentExp.endDate = dateMatch[2];
        currentExp.current = dateMatch[2].toLowerCase() === 'present';
      } else {
        currentExp.position = trimmed;
        currentExp.title = trimmed;
      }
    }
    // Date line (if not captured above)
    else if (currentExp && trimmed.match(/^([A-Za-z]{3}\s+\d{4})\s*[-–]\s*([A-Za-z]{3}\s+\d{4}|Present)/i)) {
      const dateMatch = trimmed.match(/([A-Za-z]{3}\s+\d{4})\s*[-–]\s*([A-Za-z]{3}\s+\d{4}|Present)/i);
      if (dateMatch) {
        currentExp.startDate = dateMatch[1];
        currentExp.endDate = dateMatch[2];
        currentExp.current = dateMatch[2].toLowerCase() === 'present';
      }
    }
    // Location line
    else if (currentExp && !currentExp.location && trimmed.match(/,/) && trimmed.length < 50) {
      currentExp.location = trimmed;
    }
    // Description bullets (start with – or -)
    else if (trimmed.match(/^[-–]/) && currentExp) {
      const bullet = trimmed.substring(1).trim();
      currentExp.highlights.push(bullet);
    }
  }

  // Add last experience
  if (currentExp && currentExp.company) {
    experiences.push(currentExp);
  }

  return experiences.map(exp => ({
    ...exp,
    description: exp.highlights.join('\n'),
  }));
}

function parseEducationSection(text: string) {
  const education: any[] = [];
  const lines = text.split('\n').filter(line => line.trim());

  let currentEdu: any = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip section headers
    if (!trimmed || trimmed.match(/^(EDUCATION)/i)) continue;

    // Detect institution (starts with bullet)
    if (trimmed.startsWith('•')) {
      if (currentEdu && currentEdu.school) {
        education.push(currentEdu);
      }

      const content = trimmed.substring(1).trim();
      currentEdu = {
        id: crypto.randomUUID(),
        institution: content,
        school: content,
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        location: '',
        gpa: '',
      };
    }
    // Degree line (starts with degree type)
    else if (currentEdu && trimmed.match(/^(B\.?Tech|B\.?S|B\.?E|M\.?S|M\.?Tech|Ph\.?D|Bachelor|Master|Intermediate)/i)) {
      // Extract degree and field
      const degreeMatch = trimmed.match(/^([^,]+)(?:,\s*(.+))?/);
      if (degreeMatch) {
        currentEdu.degree = degreeMatch[1].trim();
        if (degreeMatch[2]) {
          // Check if it contains GPA
          const gpaMatch = degreeMatch[2].match(/GPA:\s*(\d+\.?\d*)/i);
          if (gpaMatch) {
            currentEdu.gpa = gpaMatch[1];
            currentEdu.field = degreeMatch[2].replace(gpaMatch[0], '').trim();
          } else {
            currentEdu.field = degreeMatch[2].trim();
          }
        }
      }
    }
    // Date line
    else if (currentEdu && trimmed.match(/^([A-Za-z]{3}\s+\d{4})\s*[-–]\s*([A-Za-z]{3}\s+\d{4}|Present)/i)) {
      const dateMatch = trimmed.match(/([A-Za-z]{3}\s+\d{4})\s*[-–]\s*([A-Za-z]{3}\s+\d{4}|Present)/i);
      if (dateMatch) {
        currentEdu.startDate = dateMatch[1];
        currentEdu.endDate = dateMatch[2];
      }
    }
    // Date at end of institution line
    else if (currentEdu && !currentEdu.endDate) {
      const dateMatch = trimmed.match(/([A-Za-z]{3}\s+\d{4})\s*[-–]\s*([A-Za-z]{3}\s+\d{4}|Completed\s+[A-Za-z]{3}\s+\d{4})/i);
      if (dateMatch) {
        currentEdu.startDate = dateMatch[1];
        currentEdu.endDate = dateMatch[2];
      }
    }
    // Location
    else if (currentEdu && !currentEdu.location && trimmed.match(/,/) && !trimmed.match(/^(B\.?Tech|B\.?S)/i)) {
      currentEdu.location = trimmed;
    }
  }

  if (currentEdu && currentEdu.school) {
    education.push(currentEdu);
  }

  return education;
}

function parseProjectsSection(text: string) {
  const projects: any[] = [];
  const lines = text.split('\n').filter(line => line.trim());

  let currentProject: any = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip section headers
    if (!trimmed || trimmed.match(/^(PROJECTS)/i)) continue;

    // Project name (starts with bullet)
    if (trimmed.startsWith('•')) {
      if (currentProject && currentProject.name) {
        projects.push(currentProject);
      }

      const content = trimmed.substring(1).trim();

      // Extract date if present at the end
      const dateMatch = content.match(/([A-Za-z]{3}\s+\d{4})\s*[-–]\s*([A-Za-z]{3}\s+\d{4}|Present)$/i);
      let name = content;
      let startDate = '';
      let endDate = '';

      if (dateMatch) {
        name = content.replace(dateMatch[0], '').trim();
        startDate = dateMatch[1];
        endDate = dateMatch[2];
      } else {
        // Check for single date at end
        const singleDateMatch = content.match(/(\d{4})$/);
        if (singleDateMatch) {
          name = content.replace(singleDateMatch[0], '').trim();
          endDate = singleDateMatch[1];
        }
      }

      currentProject = {
        id: crypto.randomUUID(),
        name: name,
        description: '',
        technologies: [],
        link: '',
        highlights: [],
        startDate: startDate,
        endDate: endDate,
        url: '',
      };
    }
    // Technologies line (usually italicized, contains commas)
    else if (currentProject && !currentProject.technologies.length && trimmed.match(/,/)) {
      // Extract technologies from comma-separated list
      const techs = trimmed.split(',').map(t => t.trim()).filter(t => t);
      currentProject.technologies = techs;
    }
    // Description bullets
    else if (trimmed.match(/^[-–]/) && currentProject) {
      const bullet = trimmed.substring(1).trim();
      currentProject.highlights.push(bullet);
    }
  }

  if (currentProject && currentProject.name) {
    projects.push(currentProject);
  }

  return projects.map(proj => ({
    ...proj,
    description: proj.highlights.join('\n'),
  }));
}

function parseSkillsSection(text: string): { category: string; items: string[] }[] {
  const skillCategories: { category: string; items: string[] }[] = [];
  const lines = text.split('\n').filter(line => line.trim());

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip section headers
    if (!trimmed || trimmed.match(/^(TECHNICAL SKILLS|SKILLS)/i)) continue;

    // Category with bullet: • Category: skill1, skill2, skill3
    if (trimmed.startsWith('•') && trimmed.includes(':')) {
      const content = trimmed.substring(1).trim();
      const parts = content.split(':');
      if (parts.length >= 2) {
        const category = parts[0].trim();
        const skillsText = parts.slice(1).join(':').trim();
        const skills = skillsText.split(',').map(s => s.trim()).filter(s => s && s.length < 100);

        if (skills.length > 0) {
          skillCategories.push({ category, items: skills });
        }
      }
    }
    // Just category and skills separated by colon
    else if (trimmed.includes(':')) {
      const parts = trimmed.split(':');
      if (parts.length >= 2) {
        const category = parts[0].trim();
        const skillsText = parts.slice(1).join(':').trim();
        const skills = skillsText.split(',').map(s => s.trim()).filter(s => s && s.length < 100);

        if (skills.length > 0) {
          skillCategories.push({ category, items: skills });
        }
      }
    }
  }

  // If no categories found, try to parse as simple comma-separated list
  if (skillCategories.length === 0) {
    const allText = lines.join(' ');
    const skills = allText.split(',').map(s => s.trim()).filter(s => s && s.length > 0 && s.length < 50);
    if (skills.length > 0) {
      skillCategories.push({ category: 'Skills', items: skills });
    }
  }

  return skillCategories;
}

function parseCertificationsSection(text: string) {
  const certifications: any[] = [];
  const lines = text.split('\n').filter(line => line.trim());

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
      const cert = trimmed.substring(1).trim();
      if (cert) {
        certifications.push({ name: cert, issuer: '', date: '' });
      }
    }
  }

  return certifications;
}

export const ResumeEditorPage: React.FC = () => {
  const { resumeId } = useParams<{ resumeId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [resumeData, setResumeData] = useState<ResumeData>(createEmptyResume());
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<
    'saved' | 'saving' | 'error' | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [fitToWidth, setFitToWidth] = useState(true);
  const [showOriginal, setShowOriginal] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [reparsing, setReparsing] = useState(false);

  // Function to re-parse the resume and refresh data
  const handleReparse = async () => {
    if (!user || !resumeId) return;

    try {
      setReparsing(true);
      setSaveStatus('saving');

      const { resumeService } = await import('../services/resume.service');

      // Trigger re-parsing
      await resumeService.reparseResume(resumeId);

      // Poll for data to be ready (up to 15 seconds)
      let resumeDetail = null;
      for (let i = 0; i < 15; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        resumeDetail = await resumeService.getResume(resumeId);

        // Check if we have actual data (not just contact info)
        const hasExperience = resumeDetail?.experience && Array.isArray(resumeDetail.experience) && resumeDetail.experience.length > 0;
        const hasProjects = resumeDetail?.projects && Array.isArray(resumeDetail.projects) && resumeDetail.projects.length > 0;
        const hasSections = resumeDetail?.sections && Array.isArray(resumeDetail.sections) && resumeDetail.sections.length > 0;

        console.log(`Poll ${i + 1}: hasExperience=${hasExperience}, hasProjects=${hasProjects}, hasSections=${hasSections}`);

        if (hasExperience || hasProjects || hasSections) {
          console.log('✅ Data is ready!');
          break;
        }
      }

      if (resumeDetail && resumeDetail.parsed_text) {
        // Process the fresh data
        console.log('📥 Processing API response:', resumeDetail);
        const newResume = await processApiResponse(resumeDetail);
        console.log('📤 Processed resume:', newResume);

        // Save to local collection
        await saveResume(user.uid, resumeId, newResume);

        // Update state
        setResumeData(newResume);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 2000);
      }
    } catch (err) {
      console.error('Reparse failed:', err);
      setSaveStatus('error');
    } finally {
      setReparsing(false);
    }
  };

  // Auto-fit to width logic
  useEffect(() => {
    if (!fitToWidth || !showPreview || !containerRef.current) return;

    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        // 8.5in * 96dpi = 816px + padding (2rem = 32px)
        const contentWidth = 816 + 48;
        const scale = Math.min(1, (containerWidth - 32) / 816);
        setZoomLevel(scale);
      }
    };

    const observer = new ResizeObserver(updateScale);
    observer.observe(containerRef.current);
    updateScale();

    return () => observer.disconnect();
  }, [fitToWidth, showPreview]);

  // Handle wheel zoom (Ctrl + Scroll)
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      setFitToWidth(false);
      setZoomLevel(prev => Math.min(3, Math.max(0.2, prev + delta)));
    }
  };

  // Handle keyboard zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+' || e.key === '-')) {
        e.preventDefault();
        setFitToWidth(false);
        if (e.key === '=' || e.key === '+') {
          setZoomLevel(prev => Math.min(3, prev + 0.1));
        } else {
          setZoomLevel(prev => Math.max(0.2, prev - 0.1));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Helper function to process API response into ResumeData
  const processApiResponse = async (resumeDetail: any): Promise<ResumeData> => {
    const newResume = createEmptyResume();

    // Save original file URL if available
    if (resumeDetail.storage_url) {
      newResume.originalFileUrl = resumeDetail.storage_url;
    }

    // Populate contact info
    if (resumeDetail.contact_info) {
      const contactInfo = resumeDetail.contact_info;
      newResume.contact = {
        fullName: contactInfo.name || contactInfo.full_name || contactInfo.fullName || '',
        email: contactInfo.email || '',
        phone: contactInfo.phone || '',
        location: contactInfo.location || contactInfo.address || '',
        linkedin: contactInfo.linkedin || '',
        github: contactInfo.github || '',
        portfolio: contactInfo.website || contactInfo.portfolio || '',
      };
    }

    // Get name from first line if missing
    if (!newResume.contact.fullName && resumeDetail.parsed_text) {
      const firstLine = resumeDetail.parsed_text.split('\n')[0];
      if (firstLine && firstLine.length > 2 && !firstLine.includes('@') && !firstLine.includes('-')) {
        newResume.contact.fullName = firstLine.trim();
      }
    }

    // Professional summary
    if (resumeDetail.professional_summary) {
      newResume.summary = resumeDetail.professional_summary;
    }

    // Check for dynamic sections array first
    const apiSections = resumeDetail.sections;
    const hasDynamicSections = apiSections && Array.isArray(apiSections) && apiSections.length > 0;

    console.log('🔍 Processing API response:', { hasDynamicSections, sectionsCount: apiSections?.length });

    if (hasDynamicSections) {
      // Process dynamic sections
      for (const section of apiSections) {
        const sectionType = (section.type || 'custom').toLowerCase();
        const sectionItems = section.items || [];

        console.log(`  Processing: ${section.title} (${sectionType}) - ${sectionItems.length} items`);

        switch (sectionType) {
          case 'summary':
            if (sectionItems.length > 0) {
              const summaryItem = sectionItems[0];
              newResume.summary = typeof summaryItem === 'string' ? summaryItem : (summaryItem.text || summaryItem.description || '');
            }
            break;

          case 'experience':
            newResume.experience = sectionItems.map((exp: any) => ({
              id: crypto.randomUUID(),
              company: exp.company || exp.organization || '',
              position: exp.position || exp.title || exp.role || '',
              title: exp.position || exp.title || exp.role || '',
              location: exp.location || '',
              startDate: exp.startDate || exp.start_date || '',
              endDate: exp.endDate || exp.end_date || '',
              current: (exp.endDate || exp.end_date || '').toLowerCase() === 'present',
              description: Array.isArray(exp.description) ? exp.description.join('\n') : (exp.description || ''),
              highlights: Array.isArray(exp.description) ? exp.description :
                (exp.description ? exp.description.split('\n').filter((s: string) => s.trim()) : []),
            }));
            break;

          case 'education':
            newResume.education = sectionItems.map((edu: any) => ({
              id: crypto.randomUUID(),
              institution: edu.school || edu.institution || edu.university || '',
              degree: edu.degree || '',
              field: edu.field || edu.major || edu.specialization || '',
              location: edu.location || '',
              startDate: edu.startDate || edu.start_date || '',
              endDate: edu.endDate || edu.end_date || '',
              gpa: edu.gpa || edu.cgpa || '',
              honors: edu.honors || '',
            }));
            break;

          case 'projects':
            newResume.projects = sectionItems.map((p: any) => ({
              id: crypto.randomUUID(),
              name: p.name || p.title || p.project_name || '',
              description: Array.isArray(p.description) ? p.description.join('\n') : (p.description || ''),
              technologies: p.technologies ?
                (typeof p.technologies === 'string' ? p.technologies.split(',').map((t: string) => t.trim()) :
                  Array.isArray(p.technologies) ? p.technologies : []) : [],
              link: p.link || p.url || p.github || '',
              highlights: Array.isArray(p.description) ? p.description :
                (p.description ? p.description.split('\n').filter((s: string) => s.trim()) : []),
              startDate: p.startDate || p.start_date || '',
              endDate: p.endDate || p.end_date || '',
            }));
            break;

          case 'skills':
            newResume.skills = sectionItems.map((skill: any) => ({
              category: skill.category || 'Skills',
              items: Array.isArray(skill.items) ? skill.items :
                (typeof skill.items === 'string' ? skill.items.split(',').map((s: string) => s.trim()) : []),
            }));
            break;

          case 'certifications':
            newResume.certifications = sectionItems.map((c: any) => ({
              id: crypto.randomUUID(),
              name: c.name || c.title || '',
              issuer: c.issuer || c.organization || c.provider || '',
              date: c.date || '',
              credentialId: c.credentialId || c.credential_id || c.id || '',
              url: c.url || c.link || '',
            }));
            break;

          case 'achievements':
            newResume.achievements = sectionItems.map((a: any) => ({
              id: crypto.randomUUID(),
              title: a.title || a.name || a.text || '',
              text: a.text || a.description || '',
              description: a.description || a.text || '',
              result: a.result || '',
              date: a.date || '',
            }));
            break;
        }
      }
    } else {
      // Use flat fields from API
      if (resumeDetail.experience && Array.isArray(resumeDetail.experience)) {
        newResume.experience = resumeDetail.experience.map((exp: any) => ({
          id: crypto.randomUUID(),
          company: exp.company || '',
          position: exp.position || '',
          title: exp.position || '',
          location: exp.location || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          current: exp.endDate?.toLowerCase() === 'present' || false,
          description: exp.description || '',
          highlights: Array.isArray(exp.description) ? exp.description : (exp.description ? [exp.description] : []),
        }));
      }

      if (resumeDetail.education && Array.isArray(resumeDetail.education)) {
        newResume.education = resumeDetail.education.map((edu: any) => ({
          id: crypto.randomUUID(),
          institution: edu.school || '',
          degree: edu.degree || '',
          field: edu.field || '',
          location: edu.location || '',
          startDate: edu.startDate || '',
          endDate: edu.endDate || '',
          gpa: edu.gpa || '',
          honors: '',
        }));
      }

      if (resumeDetail.projects && Array.isArray(resumeDetail.projects)) {
        newResume.projects = resumeDetail.projects.map((p: any) => ({
          id: crypto.randomUUID(),
          name: p.name || '',
          description: p.description || '',
          technologies: p.technologies ?
            (typeof p.technologies === 'string' ? p.technologies.split(',').map((t: string) => t.trim()) :
              Array.isArray(p.technologies) ? p.technologies : []) : [],
          link: p.url || p.link || '',
          highlights: [],
        }));
      }

      // Skills - handle both dict and array formats
      const apiSkills = resumeDetail.skills;
      if (apiSkills) {
        if (typeof apiSkills === 'object' && !Array.isArray(apiSkills)) {
          // Dict format: {technical: [...], soft: [...]}
          newResume.skills = Object.entries(apiSkills).map(([category, items]) => ({
            category,
            items: Array.isArray(items) ? items as string[] : [],
          }));
        } else if (Array.isArray(apiSkills)) {
          // Array format: [{category: ..., items: [...]}]
          newResume.skills = apiSkills.map((s: any) => ({
            category: s.category || 'Skills',
            items: Array.isArray(s.items) ? s.items : [],
          }));
        }
      }
    }

    console.log('✅ Processed resume:', {
      contact: newResume.contact.fullName,
      experience: newResume.experience.length,
      education: newResume.education.length,
      projects: newResume.projects.length,
      skills: newResume.skills.length,
    });

    return newResume;
  };

  // Load resume data
  useEffect(() => {
    if (!user || !resumeId) return;

    const loadResume = async () => {
      try {
        setLoading(true);

        // First, try to load existing resume data from Firestore
        let data = await getResume(user.uid, resumeId);

        // Check if local data has actual content (not just contact info)
        const hasLocalContent = data && (
          (data.experience && data.experience.length > 0) ||
          (data.projects && data.projects.length > 0) ||
          (data.education && data.education.length > 0)
        );

        console.log('📦 Local data check:', {
          hasData: !!data,
          hasLocalContent,
          experience: data?.experience?.length || 0,
          projects: data?.projects?.length || 0,
          education: data?.education?.length || 0
        });

        // If no data or data is empty, fetch from API with polling
        if (!data || !hasLocalContent) {
          try {
            const { resumeService } = await import('../services/resume.service');

            // Poll for parsed data (up to 15 seconds)
            let resumeDetail = null;
            for (let i = 0; i < 15; i++) {
              resumeDetail = await resumeService.getResume(resumeId);

              const apiHasData = resumeDetail && (
                (resumeDetail.experience && Array.isArray(resumeDetail.experience) && resumeDetail.experience.length > 0) ||
                (resumeDetail.projects && Array.isArray(resumeDetail.projects) && resumeDetail.projects.length > 0) ||
                (resumeDetail.sections && Array.isArray(resumeDetail.sections) && resumeDetail.sections.length > 0)
              );

              if (apiHasData) {
                console.log(`✅ Data ready after ${i + 1} seconds`);
                break;
              }

              console.log(`⏳ Waiting for parsing... (${i + 1}s)`);
              await new Promise(resolve => setTimeout(resolve, 1000));
            }

            console.log('📥 Final resume from API:', {
              experience: resumeDetail?.experience?.length || 0,
              projects: resumeDetail?.projects?.length || 0,
              sections: resumeDetail?.sections?.length || 0
            });

            // If we have parsed data with content, process it
            if (resumeDetail && resumeDetail.parsed_text) {
              const apiHasContent = (
                ((resumeDetail as any).experience && (resumeDetail as any).experience.length > 0) ||
                ((resumeDetail as any).projects && (resumeDetail as any).projects.length > 0) ||
                ((resumeDetail as any).sections && Array.isArray((resumeDetail as any).sections) && (resumeDetail as any).sections.length > 0)
              );

              console.log('API has content:', apiHasContent);

              if (apiHasContent || !data) {
                const newResume = await processApiResponse(resumeDetail);
                console.log('📤 Processed resume:', {
                  experience: newResume.experience.length,
                  projects: newResume.projects.length,
                  education: newResume.education.length,
                  skills: newResume.skills.length
                });
                data = newResume;

                // Save the initialized data to Firestore
                await saveResume(user.uid, resumeId, newResume);
              }
            }
          } catch (error) {
            console.error('Error loading parsed resume data:', error);
          }
        }

        if (data) {
          setResumeData(data);
        }
      } catch (err) {
        console.error('Failed to load resume:', err);
        setError('Failed to load resume data');
      } finally {
        setLoading(false);
      }
    };

    loadResume();
  }, [user, resumeId]);

  // Autosave with debounce
  useEffect(() => {
    if (!user || !resumeId || loading) return;

    const timer = setTimeout(async () => {
      try {
        setSaveStatus('saving');
        // Normalize dates before saving
        const normalizedResume = normalizeDateFieldsInResume(resumeData);
        await saveResume(user.uid, resumeId, normalizedResume);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 2000);
      } catch (err) {
        console.error('Autosave failed:', err);
        setSaveStatus('error');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [resumeData, user, resumeId, loading]);

  const handleAIImproveSummary = async (text: string) => {
    if (!user) return text;
    try {
      return await getAISuggestion(text, 'summary');
    } catch (err) {
      console.error('AI improvement failed:', err);
      return text;
    }
  };

  const handleAIRewriteSummary = async (text: string) => {
    if (!user) return text;
    try {
      return await getAIRewrite(text, 'summary');
    } catch (err) {
      console.error('AI rewrite failed:', err);
      return text;
    }
  };

  const handleAIImproveExperience = async (text: string) => {
    if (!user) return text;
    try {
      return await getAISuggestion(text, 'experience');
    } catch (err) {
      console.error('AI improvement failed:', err);
      return text;
    }
  };

  const handleAIImproveProject = async (text: string) => {
    if (!user) return text;
    try {
      return await getAISuggestion(text, 'project');
    } catch (err) {
      console.error('AI improvement failed:', err);
      return text;
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const previewContent = document.getElementById('resume-preview')?.innerHTML || '';
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Resume</title>
            <style>
              @page { margin: 0.5in; }
              body { margin: 0; padding: 0; }
            </style>
          </head>
          <body>${previewContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Get existing section types for the AddSection component
  const getExistingSectionTypes = (): SectionType[] => {
    const existing: SectionType[] = ['contact', 'summary', 'experience', 'education', 'skills', 'projects'];

    if (resumeData.certifications && resumeData.certifications.length > 0) {
      existing.push('certifications');
    }
    if (resumeData.achievements && resumeData.achievements.length > 0) {
      existing.push('achievements');
    }
    if (resumeData.hackathons && resumeData.hackathons.length > 0) {
      existing.push('hackathons');
    }
    if (resumeData.workshops && resumeData.workshops.length > 0) {
      existing.push('workshops');
    }
    if (resumeData.publications && resumeData.publications.length > 0) {
      existing.push('publications');
    }
    if (resumeData.volunteer && resumeData.volunteer.length > 0) {
      existing.push('volunteer');
    }
    if (resumeData.languages && resumeData.languages.length > 0) {
      existing.push('languages');
    }

    return existing;
  };

  // Handle adding a new section
  const handleAddSection = (type: SectionType) => {
    if (type === 'custom') {
      // Add a new custom section
      const newSection: DynamicSection = {
        id: uuidv4(),
        type: 'custom',
        title: 'Custom Section',
        items: [],
        order: (resumeData.sections?.length || 0) + 100,
      };
      setResumeData({
        ...resumeData,
        sections: [...(resumeData.sections || []), newSection],
      });
    } else {
      // Initialize the standard section type
      switch (type) {
        case 'certifications':
          setResumeData({ ...resumeData, certifications: [] });
          break;
        case 'achievements':
          setResumeData({ ...resumeData, achievements: [] });
          break;
        case 'hackathons':
          setResumeData({ ...resumeData, hackathons: [] });
          break;
        case 'workshops':
          setResumeData({ ...resumeData, workshops: [] });
          break;
        case 'publications':
          setResumeData({ ...resumeData, publications: [] });
          break;
        case 'volunteer':
          setResumeData({ ...resumeData, volunteer: [] });
          break;
        case 'languages':
          setResumeData({ ...resumeData, languages: [] });
          break;
        default:
          break;
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950">
        <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
          {/* Header Skeleton */}
          <div className="mb-6 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-secondary-300 dark:bg-secondary-800 rounded-lg"></div>
              <div className="h-7 w-48 bg-secondary-300 dark:bg-secondary-800 rounded"></div>
            </div>
            <div className="h-10 w-full max-w-md bg-secondary-300 dark:bg-secondary-800 rounded-lg"></div>
          </div>

          {/* Editor Skeleton */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Panel */}
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white dark:bg-secondary-900 rounded-xl p-6 space-y-4">
                  <div className="h-6 w-32 bg-secondary-300 dark:bg-secondary-800 rounded"></div>
                  <div className="space-y-3">
                    <div className="h-10 bg-secondary-200 dark:bg-secondary-800 rounded-lg"></div>
                    <div className="h-10 bg-secondary-200 dark:bg-secondary-800 rounded-lg"></div>
                    <div className="h-24 bg-secondary-200 dark:bg-secondary-800 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Panel - Preview */}
            <div className="bg-white dark:bg-secondary-900 rounded-xl p-6 animate-pulse">
              <div className="h-6 w-24 bg-secondary-300 dark:bg-secondary-800 rounded mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-secondary-200 dark:bg-secondary-800 rounded w-full"></div>
                <div className="h-4 bg-secondary-200 dark:bg-secondary-800 rounded w-5/6"></div>
                <div className="h-4 bg-secondary-200 dark:bg-secondary-800 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => navigate(`/resumes/${resumeId}`)} className="btn-primary">
            Back to Resume
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950">
      {/* Header */}
      <div className="bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={() => navigate(`/resumes/${resumeId}`)}
                className="text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-secondary-900 dark:text-secondary-50 truncate">
                  Resume Editor
                </h1>
                <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 truncate">
                  {resumeData.contact.fullName || 'Untitled Resume'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Refresh/Reparse Button */}
              <button
                onClick={handleReparse}
                disabled={reparsing}
                className="btn-outline text-xs sm:text-sm flex-1 sm:flex-none justify-center px-3 py-2 flex items-center gap-1.5 sm:gap-2"
                title="Re-parse resume from original file"
              >
                <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${reparsing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="whitespace-nowrap">{reparsing ? 'Refreshing...' : 'Refresh'}</span>
              </button>

              <button
                onClick={() => setShowExportModal(true)}
                className="btn-primary text-xs sm:text-sm flex-1 sm:flex-none justify-center px-3 py-2 flex items-center gap-1.5 sm:gap-2"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="whitespace-nowrap">Export</span>
              </button>

              <button
                onClick={() => setShowPreview(!showPreview)}
                className="btn-outline text-xs sm:text-sm flex-1 sm:flex-none justify-center px-3 py-2 flex items-center gap-1.5 sm:gap-2"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="whitespace-nowrap">{showPreview ? 'Hide' : 'Preview'}</span>
              </button>

              {showPreview && (
                <button
                  onClick={handlePrint}
                  className="btn-outline text-xs sm:text-sm flex-1 sm:flex-none justify-center px-3 py-2 hidden sm:flex items-center gap-1.5 sm:gap-2"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
              )}

              {/* Save Status */}
              <div className="hidden sm:flex items-center gap-2 ml-2">
                {saveStatus === 'saving' && (
                  <span className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 flex items-center gap-2">
                    <svg
                      className="animate-spin h-3 w-3 sm:h-4 sm:w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Saving...
                  </span>
                )}
                {saveStatus === 'saved' && (
                  <span className="text-xs sm:text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                    <svg className="w-3 h-3 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Saved
                  </span>
                )}
                {saveStatus === 'error' && (
                  <span className="text-xs sm:text-sm text-red-600 dark:text-red-400">Save failed</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`px-4 sm:px-6 lg:px-8 py-6 sm:py-8`}>
        <div className={`flex flex-col lg:flex-row gap-6 ${showPreview ? '' : 'justify-center'}`}>
          {/* Editor Panel */}
          <div className={`w-full ${showPreview ? 'lg:w-1/2' : 'max-w-3xl'} space-y-6 transition-all duration-300`}>
            <ContactSection
              contact={resumeData.contact}
              onChange={(contact) =>
                setResumeData({ ...resumeData, contact })
              }
            />

            <SummarySection
              summary={resumeData.summary}
              onChange={(summary) =>
                setResumeData({ ...resumeData, summary })
              }
              onAIImprove={handleAIImproveSummary}
              onAIRewrite={handleAIRewriteSummary}
            />

            <ExperienceSection
              experience={resumeData.experience}
              onChange={(experience) =>
                setResumeData({ ...resumeData, experience })
              }
              onAIImprove={handleAIImproveExperience}
            />

            <EducationSection
              education={resumeData.education}
              onChange={(education) =>
                setResumeData({ ...resumeData, education })
              }
            />

            <SkillsSection
              skills={resumeData.skills}
              onChange={(skills) =>
                setResumeData({ ...resumeData, skills })
              }
            />

            <ProjectsSection
              projects={resumeData.projects}
              onChange={(projects) =>
                setResumeData({ ...resumeData, projects })
              }
              onAIImprove={handleAIImproveProject}
            />

            {/* Certifications Section */}
            {(resumeData.certifications && resumeData.certifications.length > 0) && (
              <CertificationsSection
                certifications={resumeData.certifications}
                onChange={(certifications) =>
                  setResumeData({ ...resumeData, certifications })
                }
              />
            )}

            {/* Achievements Section */}
            {(resumeData.achievements && resumeData.achievements.length > 0) && (
              <AchievementsSection
                achievements={resumeData.achievements}
                onChange={(achievements) =>
                  setResumeData({ ...resumeData, achievements })
                }
              />
            )}

            {/* Hackathons Section */}
            {(resumeData.hackathons && resumeData.hackathons.length > 0) && (
              <HackathonsSection
                hackathons={resumeData.hackathons}
                onChange={(hackathons) =>
                  setResumeData({ ...resumeData, hackathons })
                }
              />
            )}

            {/* Workshops Section */}
            {(resumeData.workshops && resumeData.workshops.length > 0) && (
              <WorkshopsSection
                workshops={resumeData.workshops}
                onChange={(workshops) =>
                  setResumeData({ ...resumeData, workshops })
                }
              />
            )}

            {/* Publications Section */}
            {(resumeData.publications && resumeData.publications.length > 0) && (
              <PublicationsSection
                publications={resumeData.publications}
                onChange={(publications) =>
                  setResumeData({ ...resumeData, publications })
                }
              />
            )}

            {/* Volunteer Section */}
            {(resumeData.volunteer && resumeData.volunteer.length > 0) && (
              <VolunteerSection
                volunteer={resumeData.volunteer}
                onChange={(volunteer) =>
                  setResumeData({ ...resumeData, volunteer })
                }
              />
            )}

            {/* Languages Section */}
            {(resumeData.languages && resumeData.languages.length > 0) && (
              <LanguagesSection
                languages={resumeData.languages}
                onChange={(languages) =>
                  setResumeData({ ...resumeData, languages })
                }
              />
            )}

            {/* Dynamic Custom Sections */}
            {resumeData.sections && resumeData.sections
              .filter(section => section.type === 'custom')
              .map((section, index) => (
                <CustomSection
                  key={section.id || index}
                  section={section}
                  onChange={(updatedSection) => {
                    const newSections = [...(resumeData.sections || [])];
                    const sectionIndex = newSections.findIndex(s => s.id === section.id);
                    if (sectionIndex !== -1) {
                      newSections[sectionIndex] = updatedSection;
                      setResumeData({ ...resumeData, sections: newSections });
                    }
                  }}
                  onRemove={() => {
                    const newSections = (resumeData.sections || []).filter(s => s.id !== section.id);
                    setResumeData({ ...resumeData, sections: newSections });
                  }}
                />
              ))}

            {/* Add Section Button */}
            <AddSection
              existingSections={getExistingSectionTypes()}
              onAddSection={handleAddSection}
            />
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="w-full lg:w-1/2 lg:sticky lg:top-24 h-fit">
              <div className="bg-white dark:bg-secondary-900 rounded-lg shadow-sm border border-secondary-200 dark:border-800 overflow-hidden">
                <div className="p-4 border-b border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-950 flex justify-between items-center">
                  <h3 className="font-semibold text-secondary-900 dark:text-secondary-50 hidden lg:block">Live Preview</h3>
                  <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
                    <div className="flex bg-white dark:bg-secondary-900 rounded-lg border border-secondary-200 dark:border-secondary-800 p-1">
                      <button
                        onClick={() => { setFitToWidth(false); setZoomLevel(prev => Math.max(0.2, prev - 0.1)); }}
                        className="p-1 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded text-secondary-600 dark:text-secondary-400"
                        title="Zoom Out (Ctrl -)"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                      </button>
                      <button
                        onClick={() => setFitToWidth(!fitToWidth)}
                        className={`px-2 text-xs font-mono flex items-center min-w-[3rem] justify-center hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded cursor-pointer ${fitToWidth ? 'text-blue-600 font-bold' : ''}`}
                        title="Toggle Fit to Width"
                      >
                        {fitToWidth ? 'Auto' : `${Math.round(zoomLevel * 100)}%`}
                      </button>
                      <button
                        onClick={() => { setFitToWidth(false); setZoomLevel(prev => Math.min(3, prev + 0.1)); }}
                        className="p-1 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded text-secondary-600 dark:text-secondary-400"
                        title="Zoom In (Ctrl +)"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      </button>
                    </div>

                    {resumeData.originalFileUrl && (
                      <button
                        onClick={() => setShowOriginal(!showOriginal)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${showOriginal
                          ? 'bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300'
                          : 'bg-white border-secondary-200 text-secondary-600 hover:bg-secondary-50 dark:bg-secondary-900 dark:border-secondary-700 dark:text-secondary-300'}`}
                      >
                        {showOriginal ? 'Show Editor' : 'Original PDF'}
                      </button>
                    )}

                    <button onClick={() => setShowPreview(false)} className="text-secondary-500 lg:hidden">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>

                <div
                  ref={containerRef}
                  onWheel={handleWheel}
                  className="overflow-auto max-h-[60vh] lg:max-h-[calc(100vh-8rem)] bg-secondary-100 dark:bg-secondary-900/50 p-4 relative"
                >
                  {showOriginal && resumeData.originalFileUrl ? (
                    <div className="w-full h-[600px] bg-white rounded shadow-lg overflow-hidden">
                      <iframe
                        src={resumeData.originalFileUrl}
                        className="w-full h-full border-0"
                        title="Original Resume"
                      />
                    </div>
                  ) : (
                    <div
                      ref={contentRef}
                      style={{
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: 'top center',
                        transition: fitToWidth ? 'transform 0.3s ease' : 'none',
                        textAlign: 'center'
                      }}
                      className="flex justify-center"
                    >
                      <ResumePreview data={resumeData} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PDF Export Modal */}
      {resumeId && (
        <PdfExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          resumeId={resumeId}
          resumeName={resumeData.contact.fullName || 'Resume'}
          template={resumeData.template || 'resume_1'}
        />
      )}
    </div>
  );
};
