/**
 * Template Renderer Component
 * Renders resume in different template styles (Modern, Classic, Minimalist)
 * Displays HTML representation of LaTeX template designs
 */

import React from 'react';
import { ResumeDetail } from '@/services/resume.service';

interface TemplateRendererProps {
  resume: ResumeDetail;
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = React.memo(({ resume }) => {
  const template = resume.template || 'modern'
  
  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return '';
    if (dateStr.match(/^[A-Za-z]{3}/)) return dateStr;
    if (dateStr.match(/^\d{4}-\d{2}/)) {
      const [year, month] = dateStr.split('-');
      const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[parseInt(month)]} ${year}`;
    }
    return dateStr;
  };

  const contactInfo = resume.contact_info || {};
  const experience = resume.experience || [];
  const education = resume.education || [];
  const projects = resume.projects || [];
  const skills = resume.skills || {};

  // Modern Template - Clean, professional, blue accent
  const ModernTemplate = () => (
    <div className="bg-white p-8 max-w-4xl mx-auto" id="resume-modern">
      <style>{`
        #resume-modern {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333333;
        }
        
        .modern-header {
          text-align: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 3px solid #0066cc;
        }
        
        .modern-name {
          font-size: 2rem;
          font-weight: bold;
          color: #1a1a1a;
          margin-bottom: 0.5rem;
        }
        
        .modern-contact {
          font-size: 0.9rem;
          color: #0066cc;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.75rem;
          align-items: center;
        }
        
        .modern-contact span {
          display: inline-block;
        }
        
        .modern-separator {
          display: inline-block;
          margin: 0 0.5rem;
          color: #999;
        }
        
        .modern-section {
          margin-bottom: 1.5rem;
        }
        
        .modern-section-title {
          font-size: 0.95rem;
          font-weight: bold;
          text-transform: uppercase;
          color: #0066cc;
          border-bottom: 2px solid #0066cc;
          padding-bottom: 0.4rem;
          margin-bottom: 0.75rem;
          letter-spacing: 0.05em;
        }
        
        .modern-entry {
          margin-bottom: 1rem;
        }
        
        .modern-entry-title {
          font-weight: bold;
          font-size: 0.95rem;
          color: #1a1a1a;
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 0.15rem;
        }
        
        .modern-entry-date {
          font-size: 0.85rem;
          color: #666;
          font-style: italic;
        }
        
        .modern-entry-subtitle {
          font-size: 0.85rem;
          color: #666;
          font-style: italic;
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.35rem;
        }
        
        .modern-entry-description {
          font-size: 0.85rem;
          color: #444;
          line-height: 1.6;
          margin-top: 0.35rem;
        }
        
        .modern-bullets {
          list-style: none;
          padding-left: 0.5rem;
          margin: 0.35rem 0 0 0;
        }
        
        .modern-bullets li {
          font-size: 0.85rem;
          color: #444;
          line-height: 1.5;
          margin-bottom: 0.2rem;
          padding-left: 0.3rem;
          position: relative;
        }
        
        .modern-bullets li:before {
          content: '•';
          color: #0066cc;
          font-weight: bold;
          position: absolute;
          left: 0;
        }
        
        .modern-skills-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          font-size: 0.85rem;
        }
        
        .modern-skill-item {
          margin-bottom: 0.35rem;
        }
        
        .modern-skill-label {
          font-weight: bold;
          color: #0066cc;
          display: inline-block;
          margin-right: 0.35rem;
        }
      `}</style>
      
      {/* Header */}
      <div className="modern-header">
        <div className="modern-name">{contactInfo.name || 'Your Name'}</div>
        <div className="modern-contact">
          {contactInfo.email && <span>{contactInfo.email}</span>}
          {contactInfo.email && contactInfo.phone && <span className="modern-separator">•</span>}
          {contactInfo.phone && <span>{contactInfo.phone}</span>}
          {(contactInfo.email || contactInfo.phone) && contactInfo.location && <span className="modern-separator">•</span>}
          {contactInfo.location && <span>{contactInfo.location}</span>}
          {contactInfo.linkedin && <span className="modern-separator">•</span>}
          {contactInfo.linkedin && <span>{contactInfo.linkedin}</span>}
        </div>
      </div>
      
      {/* Professional Summary */}
      {resume.parsed_text && (
        <div className="modern-section">
          <div className="modern-section-title">Professional Summary</div>
          <p className="modern-entry-description">{resume.parsed_text.split('\n')[0]}</p>
        </div>
      )}
      
      {/* Experience */}
      {experience.length > 0 && (
        <div className="modern-section">
          <div className="modern-section-title">Professional Experience</div>
          {experience.map((exp, idx) => (
            <div key={idx} className="modern-entry">
              <div className="modern-entry-title">
                <span>{exp.position || exp.title || 'Position'}</span>
                <span className="modern-entry-date">
                  {formatDate(exp.startDate)} - {exp.endDate?.toLowerCase() === 'present' ? 'Present' : formatDate(exp.endDate)}
                </span>
              </div>
              <div className="modern-entry-subtitle">
                <span>{exp.company || 'Company'}</span>
                {exp.location && <span>{exp.location}</span>}
              </div>
              {exp.description && <p className="modern-entry-description">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}
      
      {/* Education */}
      {education.length > 0 && (
        <div className="modern-section">
          <div className="modern-section-title">Education</div>
          {education.map((edu, idx) => (
            <div key={idx} className="modern-entry">
              <div className="modern-entry-title">
                <span>{edu.degree} {edu.field ? `in ${edu.field}` : ''}</span>
                <span className="modern-entry-date">
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                </span>
              </div>
              <div className="modern-entry-subtitle">
                <span>{edu.school || 'Institution'}</span>
                {edu.location && <span>{edu.location}</span>}
              </div>
              {edu.gpa && <p className="modern-entry-description">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </div>
      )}
      
      {/* Projects */}
      {projects.length > 0 && (
        <div className="modern-section">
          <div className="modern-section-title">Projects</div>
          {projects.map((proj, idx) => (
            <div key={idx} className="modern-entry">
              <div className="modern-entry-title">
                <span>{proj.name || 'Project'}</span>
                {proj.startDate && (
                  <span className="modern-entry-date">
                    {formatDate(proj.startDate)} {proj.endDate ? `- ${formatDate(proj.endDate)}` : ''}
                  </span>
                )}
              </div>
              {proj.technologies && proj.technologies.length > 0 && (
                <p className="modern-entry-description">
                  <strong>Tech:</strong> {Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
                </p>
              )}
              {proj.description && <p className="modern-entry-description">{proj.description}</p>}
            </div>
          ))}
        </div>
      )}
      
      {/* Skills */}
      {Object.keys(skills).length > 0 && (
        <div className="modern-section">
          <div className="modern-section-title">Technical Skills</div>
          <div className="modern-skills-grid">
            {Object.entries(skills).map(([category, items]: [string, any], idx) => (
              <div key={idx} className="modern-skill-item">
                <span className="modern-skill-label">{category}:</span>
                <span>{Array.isArray(items) ? items.join(', ') : items}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Classic Template - Traditional, serif font, black and white
  const ClassicTemplate = () => (
    <div className="bg-white p-8 max-w-4xl mx-auto" id="resume-classic">
      <style>{`
        #resume-classic {
          font-family: 'Times New Roman', Times, serif;
          color: #000;
        }
        
        .classic-header {
          text-align: center;
          margin-bottom: 0.5rem;
        }
        
        .classic-name {
          font-size: 1.8rem;
          font-weight: bold;
          margin-bottom: 0.2rem;
        }
        
        .classic-contact {
          font-size: 0.85rem;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .classic-separator {
          display: inline;
          margin: 0 0.35rem;
        }
        
        .classic-section {
          margin-bottom: 0.8rem;
        }
        
        .classic-section-title {
          font-size: 0.95rem;
          font-weight: bold;
          text-transform: uppercase;
          border-bottom: 1px solid #000;
          padding-bottom: 0.2rem;
          margin-bottom: 0.4rem;
        }
        
        .classic-entry {
          margin-bottom: 0.6rem;
        }
        
        .classic-entry-title {
          font-weight: bold;
          font-size: 0.9rem;
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.1rem;
        }
        
        .classic-entry-date {
          font-size: 0.85rem;
        }
        
        .classic-entry-subtitle {
          font-style: italic;
          font-size: 0.85rem;
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.2rem;
        }
        
        .classic-bullets {
          list-style: disc;
          padding-left: 1.2rem;
          margin: 0.25rem 0;
        }
        
        .classic-bullets li {
          font-size: 0.85rem;
          line-height: 1.4;
          margin-bottom: 0.1rem;
        }
        
        .classic-skills-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          font-size: 0.85rem;
        }
      `}</style>
      
      <div className="classic-header">
        <div className="classic-name">{contactInfo.name || 'Your Name'}</div>
        <div className="classic-contact">
          {contactInfo.email && <span>{contactInfo.email}</span>}
          {contactInfo.email && contactInfo.phone && <span className="classic-separator">|</span>}
          {contactInfo.phone && <span>{contactInfo.phone}</span>}
          {(contactInfo.email || contactInfo.phone) && contactInfo.location && <span className="classic-separator">|</span>}
          {contactInfo.location && <span>{contactInfo.location}</span>}
        </div>
      </div>
      
      {resume.parsed_text && (
        <div className="classic-section">
          <div className="classic-section-title">Professional Summary</div>
          <p style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>{resume.parsed_text.split('\n')[0]}</p>
        </div>
      )}
      
      {experience.length > 0 && (
        <div className="classic-section">
          <div className="classic-section-title">Experience</div>
          {experience.map((exp, idx) => (
            <div key={idx} className="classic-entry">
              <div className="classic-entry-title">
                <span>{exp.position || exp.title || 'Position'}</span>
                <span className="classic-entry-date">{formatDate(exp.startDate)} - {exp.endDate?.toLowerCase() === 'present' ? 'Present' : formatDate(exp.endDate)}</span>
              </div>
              <div className="classic-entry-subtitle">
                <span>{exp.company || 'Company'}</span>
                <span>{exp.location}</span>
              </div>
              {exp.description && <p style={{ fontSize: '0.85rem', margin: '0.15rem 0' }}>{exp.description}</p>}
            </div>
          ))}
        </div>
      )}
      
      {education.length > 0 && (
        <div className="classic-section">
          <div className="classic-section-title">Education</div>
          {education.map((edu, idx) => (
            <div key={idx} className="classic-entry">
              <div className="classic-entry-title">
                <span>{edu.degree} {edu.field ? `in ${edu.field}` : ''}</span>
                <span className="classic-entry-date">{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</span>
              </div>
              <div className="classic-entry-subtitle">
                <span>{edu.school || 'Institution'}</span>
                <span>{edu.location}</span>
              </div>
              {edu.gpa && <p style={{ fontSize: '0.85rem' }}>GPA: {edu.gpa}</p>}
            </div>
          ))}
        </div>
      )}
      
      {projects.length > 0 && (
        <div className="classic-section">
          <div className="classic-section-title">Projects</div>
          {projects.map((proj, idx) => (
            <div key={idx} className="classic-entry">
              <div className="classic-entry-title">
                <span>{proj.name || 'Project'}</span>
                {proj.startDate && <span className="classic-entry-date">{formatDate(proj.startDate)}</span>}
              </div>
              {proj.description && <p style={{ fontSize: '0.85rem' }}>{proj.description}</p>}
            </div>
          ))}
        </div>
      )}
      
      {Object.keys(skills).length > 0 && (
        <div className="classic-section">
          <div className="classic-section-title">Technical Skills</div>
          <div className="classic-skills-grid">
            {Object.entries(skills).map(([category, items]: [string, any], idx) => (
              <div key={idx} style={{ fontSize: '0.85rem' }}>
                <strong>{category}:</strong> {Array.isArray(items) ? items.join(', ') : items}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Minimalist Template - Minimal design, clean spacing, left-aligned
  const MinimalistTemplate = () => (
    <div className="bg-white p-8 max-w-4xl mx-auto" id="resume-minimalist">
      <style>{`
        #resume-minimalist {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          color: #222;
        }
        
        .minimalist-header {
          margin-bottom: 2rem;
        }
        
        .minimalist-name {
          font-size: 1.6rem;
          font-weight: 700;
          margin-bottom: 0.4rem;
          letter-spacing: -0.02em;
        }
        
        .minimalist-contact {
          font-size: 0.8rem;
          color: #666;
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .minimalist-section {
          margin-bottom: 1.6rem;
        }
        
        .minimalist-section-title {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #222;
          margin-bottom: 0.8rem;
          padding-bottom: 0.4rem;
          border-bottom: 1px solid #ddd;
        }
        
        .minimalist-entry {
          margin-bottom: 0.8rem;
        }
        
        .minimalist-entry-title {
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 0.1rem;
          color: #000;
        }
        
        .minimalist-entry-meta {
          font-size: 0.8rem;
          color: #888;
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 0.3rem;
        }
        
        .minimalist-entry-description {
          font-size: 0.85rem;
          line-height: 1.5;
          color: #333;
          margin-top: 0.2rem;
        }
        
        .minimalist-skills-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.8rem;
          font-size: 0.8rem;
          line-height: 1.6;
        }
        
        .minimalist-skill-item strong {
          font-weight: 600;
          display: inline-block;
          margin-right: 0.35rem;
        }
      `}</style>
      
      <div className="minimalist-header">
        <div className="minimalist-name">{contactInfo.name || 'Your Name'}</div>
        <div className="minimalist-contact">
          {contactInfo.email && <span>{contactInfo.email}</span>}
          {contactInfo.phone && <span>{contactInfo.phone}</span>}
          {contactInfo.location && <span>{contactInfo.location}</span>}
          {contactInfo.linkedin && <span>{contactInfo.linkedin}</span>}
        </div>
      </div>
      
      {resume.parsed_text && (
        <div className="minimalist-section">
          <div className="minimalist-section-title">Summary</div>
          <p className="minimalist-entry-description">{resume.parsed_text.split('\n')[0]}</p>
        </div>
      )}
      
      {experience.length > 0 && (
        <div className="minimalist-section">
          <div className="minimalist-section-title">Experience</div>
          {experience.map((exp, idx) => (
            <div key={idx} className="minimalist-entry">
              <div className="minimalist-entry-title">{exp.position || exp.title || 'Position'}</div>
              <div className="minimalist-entry-meta">
                <span>{exp.company || 'Company'} {exp.location && `— ${exp.location}`}</span>
                <span>{formatDate(exp.startDate)} - {exp.endDate?.toLowerCase() === 'present' ? 'Present' : formatDate(exp.endDate)}</span>
              </div>
              {exp.description && <p className="minimalist-entry-description">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}
      
      {education.length > 0 && (
        <div className="minimalist-section">
          <div className="minimalist-section-title">Education</div>
          {education.map((edu, idx) => (
            <div key={idx} className="minimalist-entry">
              <div className="minimalist-entry-title">{edu.degree} {edu.field ? `in ${edu.field}` : ''}</div>
              <div className="minimalist-entry-meta">
                <span>{edu.school || 'Institution'} {edu.location && `— ${edu.location}`}</span>
                <span>{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</span>
              </div>
              {edu.gpa && <p className="minimalist-entry-description">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </div>
      )}
      
      {projects.length > 0 && (
        <div className="minimalist-section">
          <div className="minimalist-section-title">Projects</div>
          {projects.map((proj, idx) => (
            <div key={idx} className="minimalist-entry">
              <div className="minimalist-entry-title">{proj.name || 'Project'}</div>
              {proj.technologies && proj.technologies.length > 0 && (
                <div className="minimalist-entry-meta">
                  <span>{Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}</span>
                </div>
              )}
              {proj.description && <p className="minimalist-entry-description">{proj.description}</p>}
            </div>
          ))}
        </div>
      )}
      
      {Object.keys(skills).length > 0 && (
        <div className="minimalist-section">
          <div className="minimalist-section-title">Skills</div>
          <div className="minimalist-skills-grid">
            {Object.entries(skills).map(([category, items]: [string, any], idx) => (
              <div key={idx} className="minimalist-skill-item">
                <strong>{category}:</strong>
                <span>{Array.isArray(items) ? items.join(', ') : items}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render appropriate template
  if (template === 'classic') {
    return <ClassicTemplate />;
  } else if (template === 'minimalist') {
    return <MinimalistTemplate />;
  } else {
    return <ModernTemplate />;
  }
}, (prevProps, nextProps) => {
  // Only re-render if resume_id or status changed
  return prevProps.resume.resume_id === nextProps.resume.resume_id && 
         prevProps.resume.status === nextProps.resume.status;
});
