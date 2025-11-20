/**
 * Resume Editor Page
 * Main page for editing resume data with autosave
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ResumeData, createEmptyResume } from '../types/resume';
import {
  getResume,
  saveResume,
  getAISuggestion,
  getAIRewrite,
} from '../services/resume-editor.service';
import { ContactSection } from '../components/editor/ContactSection';
import { SummarySection } from '../components/editor/SummarySection';
import { ExperienceSection } from '../components/editor/ExperienceSection';
import { EducationSection } from '../components/editor/EducationSection';
import { SkillsSection } from '../components/editor/SkillsSection';
import { ProjectsSection } from '../components/editor/ProjectsSection';
import { ResumePreview } from '../components/ResumePreview';
import PdfExportModal from '../components/PdfExportModal';

// Helper functions to parse sections from text
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
  const [showExportModal, setShowExportModal] = useState(false);

  // Load resume data
  useEffect(() => {
    if (!user || !resumeId) return;

    const loadResume = async () => {
      try {
        setLoading(true);
        
        // First, try to load existing resume data from Firestore
        let data = await getResume(user.uid, resumeId);
        
        // If no data exists, try to get parsed data from backend
        if (!data) {
          try {
            const { resumeService } = await import('../services/resume.service');
            const resumeDetail = await resumeService.getResume(resumeId);
            
            console.log('Resume Detail:', resumeDetail);
            console.log('Full Resume Detail JSON:', JSON.stringify(resumeDetail, null, 2));
            console.log('Sections:', (resumeDetail as any).sections);
            console.log('Parsed Data:', (resumeDetail as any).parsed_data);
            console.log('Contact Info:', resumeDetail.contact_info);
            
            // If we have parsed data, create initial resume data
            if (resumeDetail.parsed_text) {
              const newResume = createEmptyResume();
              
              // Populate contact info
              if (resumeDetail.contact_info) {
                newResume.contact = {
                  fullName: resumeDetail.contact_info.name || resumeDetail.contact_info.full_name || '',
                  email: resumeDetail.contact_info.email || '',
                  phone: resumeDetail.contact_info.phone || '',
                  location: resumeDetail.contact_info.location || resumeDetail.contact_info.address || '',
                  linkedin: resumeDetail.contact_info.linkedin || '',
                  github: resumeDetail.contact_info.github || '',
                  portfolio: resumeDetail.contact_info.website || resumeDetail.contact_info.portfolio || '',
                };
              }
              
              // Parse the full text since backend didn't split sections properly
              const fullText = resumeDetail.parsed_text || '';
              const sections = (resumeDetail as any).sections || {};
              
              // Use the header section if available, otherwise use parsed_text
              const textToParse = sections.header || fullText;
              
              console.log('Text to parse length:', textToParse.length);
              console.log('First 200 chars:', textToParse.substring(0, 200));
              
              // Extract summary section (more flexible regex)
              const summaryMatch = textToParse.match(/PROFESSIONAL\s*SUMMARY\s*([\s\S]*?)(?=EXPERIENCE)/i);
              if (summaryMatch) {
                newResume.summary = summaryMatch[1].trim();
                console.log('Found summary:', newResume.summary.substring(0, 100));
              } else {
                console.log('Summary not found');
              }
              
              // Extract and parse experience section
              const experienceMatch = textToParse.match(/EXPERIENCE\s*([\s\S]*?)(?=PROJECTS)/i);
              if (experienceMatch) {
                console.log('Found experience section:', experienceMatch[1].substring(0, 200));
                const experiences = parseExperienceSection(experienceMatch[1]);
                if (experiences.length > 0) {
                  newResume.experience = experiences;
                }
              } else {
                console.log('Experience section not found');
              }
              
              // Extract and parse projects section
              const projectsMatch = textToParse.match(/PROJECTS\s*([\s\S]*?)(?=TECHNICAL\s*SKILLS)/i);
              if (projectsMatch) {
                console.log('Found projects section:', projectsMatch[1].substring(0, 200));
                const projects = parseProjectsSection(projectsMatch[1]);
                if (projects.length > 0) {
                  newResume.projects = projects;
                }
              } else {
                console.log('Projects section not found');
              }
              
              // Extract and parse skills section
              const skillsMatch = textToParse.match(/TECHNICAL\s*SKILLS\s*([\s\S]*?)(?=---|HACKATHONS)/i);
              if (skillsMatch) {
                console.log('Found skills section:', skillsMatch[1].substring(0, 200));
                const skillCategories = parseSkillsSection(skillsMatch[1]);
                if (skillCategories.length > 0) {
                  newResume.skills = skillCategories;
                }
              } else {
                console.log('Skills section not found');
              }
              
              // Extract and parse education section
              const educationMatch = textToParse.match(/EDUCATION\s*([\s\S]*?)$/i);
              if (educationMatch) {
                console.log('Found education section:', educationMatch[1].substring(0, 200));
                const education = parseEducationSection(educationMatch[1]);
                if (education.length > 0) {
                  newResume.education = education;
                }
              } else {
                console.log('Education section not found');
              }
              
              // Extract certifications/hackathons
              const hackathonsMatch = textToParse.match(/HACKATHONS\s*&\s*COMPETITIONS\s*([\s\S]*?)(?=EDUCATION|$)/i);
              if (hackathonsMatch) {
                console.log('Found hackathons section');
                const certs = parseCertificationsSection(hackathonsMatch[1]);
                if (certs.length > 0) {
                  (newResume as any).certifications = certs;
                }
              }
              
              console.log('Parsed Resume Data:', newResume);
              console.log('Summary:', newResume.summary);
              console.log('Experience count:', newResume.experience.length);
              console.log('Projects count:', newResume.projects.length);
              console.log('Skills count:', newResume.skills.length);
              console.log('Education count:', newResume.education.length);
              
              data = newResume;
              
              // Save the initialized data to Firestore
              await saveResume(user.uid, resumeId, newResume);
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
        await saveResume(user.uid, resumeId, resumeData);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => navigate('/resumes')} className="btn-primary">
            Back to Resumes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/resumes')}
                className="text-secondary-600 hover:text-secondary-900"
              >
                <svg
                  className="w-6 h-6"
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
              <div>
                <h1 className="text-2xl font-bold text-secondary-900">
                  Resume Editor
                </h1>
                <p className="text-sm text-secondary-600">
                  {resumeData.contact.fullName || 'Untitled Resume'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowExportModal(true)}
                className="btn-primary text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Export PDF
              </button>

              <button
                onClick={() => setShowPreview(!showPreview)}
                className="btn-outline text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {showPreview ? 'Hide' : 'Show'} Preview
              </button>
              
              {showPreview && (
                <button
                  onClick={handlePrint}
                  className="btn-outline text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
              )}

              {/* Save Status */}
              <div className="flex items-center gap-2">
              {saveStatus === 'saving' && (
                <span className="text-sm text-secondary-600 flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
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
                <span className="text-sm text-green-600 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
                <span className="text-sm text-red-600">Save failed</span>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${showPreview ? 'flex gap-6' : ''} px-4 sm:px-6 lg:px-8 py-8`}>
        {/* Editor Panel */}
        <div className={`${showPreview ? 'w-1/2' : 'max-w-4xl mx-auto'} space-y-6`}>
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
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="w-1/2 sticky top-24 h-fit">
            <div className="overflow-auto max-h-[calc(100vh-8rem)]">
              <ResumePreview data={resumeData} />
            </div>
          </div>
        )}
      </div>

      {/* PDF Export Modal */}
      {resumeId && (
        <PdfExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          resumeId={resumeId}
          resumeName={resumeData.contact.fullName || 'Resume'}
        />
      )}
    </div>
  );
};
