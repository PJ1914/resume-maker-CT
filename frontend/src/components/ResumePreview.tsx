/**
 * Resume Preview Component
 * Real-time HTML preview of resume with print styles
 */

import React from 'react';
import { ResumeData } from '../types/resume';

interface ResumePreviewProps {
  data: ResumeData;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month] = dateString.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  return (
    <div className="resume-preview bg-white shadow-lg" id="resume-preview">
      <style>{`
        .resume-preview {
          width: 8.5in;
          min-height: 11in;
          padding: 0.5in;
          font-family: 'Times New Roman', serif;
          font-size: 11pt;
          line-height: 1.4;
        }
        
        @media print {
          .resume-preview {
            box-shadow: none;
            margin: 0;
            padding: 0.5in;
          }
        }
        
        .resume-header {
          text-align: center;
          margin-bottom: 0.3in;
        }
        
        .resume-name {
          font-size: 24pt;
          font-weight: bold;
          margin-bottom: 0.1in;
        }
        
        .resume-contact {
          font-size: 10pt;
          color: #333;
        }
        
        .resume-section {
          margin-bottom: 0.2in;
        }
        
        .resume-section-title {
          font-size: 12pt;
          font-weight: bold;
          text-transform: uppercase;
          border-bottom: 1.5pt solid #000;
          margin-bottom: 0.1in;
          padding-bottom: 2pt;
        }
        
        .resume-entry {
          margin-bottom: 0.15in;
        }
        
        .resume-entry-header {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          margin-bottom: 2pt;
        }
        
        .resume-entry-subheader {
          display: flex;
          justify-content: space-between;
          font-style: italic;
          margin-bottom: 4pt;
        }
        
        .resume-highlights {
          margin-left: 0.2in;
          margin-top: 4pt;
        }
        
        .resume-highlights li {
          margin-bottom: 2pt;
        }
        
        .resume-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.1in;
        }
        
        .resume-skill-category {
          flex: 0 0 48%;
          margin-bottom: 4pt;
        }
        
        .resume-skill-category strong {
          font-weight: bold;
        }
      `}</style>

      {/* Header */}
      <div className="resume-header">
        <div className="resume-name">{data.contact.fullName || 'Your Name'}</div>
        <div className="resume-contact">
          {[
            data.contact.email,
            data.contact.phone,
            data.contact.location,
            data.contact.linkedin,
            data.contact.github,
            data.contact.portfolio,
          ]
            .filter(Boolean)
            .join(' • ')}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="resume-section">
          <div className="resume-section-title">Professional Summary</div>
          <p>{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div className="resume-section">
          <div className="resume-section-title">Experience</div>
          {data.experience.map((exp) => (
            <div key={exp.id} className="resume-entry">
              <div className="resume-entry-header">
                <span>{exp.title || 'Position Title'}</span>
                <span>
                  {formatDate(exp.startDate)} -{' '}
                  {exp.current ? 'Present' : formatDate(exp.endDate)}
                </span>
              </div>
              <div className="resume-entry-subheader">
                <span>{exp.company || 'Company Name'}</span>
                <span>{exp.location}</span>
              </div>
              {exp.highlights.length > 0 && (
                <ul className="resume-highlights">
                  {exp.highlights.map((highlight, idx) => (
                    <li key={idx}>{highlight}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div className="resume-section">
          <div className="resume-section-title">Education</div>
          {data.education.map((edu) => (
            <div key={edu.id} className="resume-entry">
              <div className="resume-entry-header">
                <span>
                  {edu.degree} {edu.field && `in ${edu.field}`}
                </span>
                <span>
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                </span>
              </div>
              <div className="resume-entry-subheader">
                <span>{edu.institution}</span>
                <span>{edu.location}</span>
              </div>
              {(edu.gpa || edu.honors) && (
                <div style={{ fontSize: '10pt' }}>
                  {edu.gpa && <span>GPA: {edu.gpa}</span>}
                  {edu.gpa && edu.honors && <span> • </span>}
                  {edu.honors && <span>{edu.honors}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <div className="resume-section">
          <div className="resume-section-title">Projects</div>
          {data.projects.map((project) => (
            <div key={project.id} className="resume-entry">
              <div className="resume-entry-header">
                <span>{project.name || 'Project Name'}</span>
                {project.link && (
                  <span style={{ fontWeight: 'normal', fontSize: '10pt' }}>
                    {project.link}
                  </span>
                )}
              </div>
              {project.technologies.length > 0 && (
                <div style={{ fontStyle: 'italic', marginBottom: '4pt' }}>
                  {project.technologies.join(', ')}
                </div>
              )}
              {project.description && <p>{project.description}</p>}
              {project.highlights.length > 0 && (
                <ul className="resume-highlights">
                  {project.highlights.map((highlight, idx) => (
                    <li key={idx}>{highlight}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div className="resume-section">
          <div className="resume-section-title">Skills</div>
          <div className="resume-skills">
            {data.skills.map((skill, idx) => (
              <div key={idx} className="resume-skill-category">
                <strong>{skill.category}:</strong> {skill.items.join(', ')}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
