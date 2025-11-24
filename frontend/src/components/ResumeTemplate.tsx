/**
 * Professional Resume Template Component
 * Displays resume data in a clean, ATS-friendly format
 */

import React from 'react';
import { ResumeDetail } from '@/services/resume.service';

interface ResumeTemplateProps {
  resume: ResumeDetail;
}

export const ResumeTemplate: React.FC<ResumeTemplateProps> = ({ resume }) => {
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    // Handle formats like "Jan 2020", "2020-01", etc.
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

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto resume-template" id="resume-template">
      <style>{`
        .resume-template {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 11px;
          line-height: 1.5;
          color: #333;
        }

        .resume-header {
          text-align: center;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #333;
        }

        .resume-name {
          font-size: 2rem;
          font-weight: bold;
          color: #1a1a1a;
          margin-bottom: 0.5rem;
        }

        .resume-contact {
          font-size: 10px;
          color: #555;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1rem;
        }

        .resume-contact-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .resume-section {
          margin-bottom: 1.25rem;
        }

        .section-title {
          font-size: 0.85rem;
          font-weight: bold;
          text-transform: uppercase;
          color: #1a1a1a;
          border-bottom: 1px solid #333;
          padding-bottom: 0.25rem;
          margin-bottom: 0.5rem;
          letter-spacing: 0.05em;
        }

        .entry {
          margin-bottom: 0.75rem;
        }

        .entry-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 0.1rem;
        }

        .entry-title {
          font-weight: bold;
          font-size: 11px;
          color: #1a1a1a;
        }

        .entry-date {
          font-size: 10px;
          color: #666;
        }

        .entry-subheader {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          font-style: italic;
          font-size: 10px;
          color: #555;
          margin-bottom: 0.25rem;
        }

        .entry-company {
          font-size: 10px;
        }

        .entry-location {
          font-size: 10px;
        }

        .entry-description {
          font-size: 10px;
          color: #444;
          line-height: 1.6;
          margin-top: 0.25rem;
        }

        .bullet-list {
          list-style: none;
          padding-left: 0.5rem;
          margin: 0.25rem 0;
        }

        .bullet-list li {
          font-size: 10px;
          color: #444;
          line-height: 1.5;
          margin-bottom: 0.15rem;
          padding-left: 0.25rem;
        }

        .bullet-list li:before {
          content: '• ';
          color: #333;
          font-weight: bold;
          display: inline-block;
          width: 0.5rem;
          margin-left: -0.5rem;
        }

        .skills-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          font-size: 10px;
        }

        .skills-item {
          margin-bottom: 0.25rem;
        }

        .skills-label {
          font-weight: bold;
          color: #1a1a1a;
        }

        .skills-content {
          color: #444;
        }

        @media print {
          .resume-template {
            padding: 0.5in;
            width: 8.5in;
            min-height: 11in;
          }
        }
      `}</style>

      {/* Header */}
      <div className="resume-header">
        <div className="resume-name">
          {contactInfo.name || 'Your Name'}
        </div>
        <div className="resume-contact">
          {contactInfo.email && <div className="resume-contact-item">📧 {contactInfo.email}</div>}
          {contactInfo.phone && <div className="resume-contact-item">📱 {contactInfo.phone}</div>}
          {contactInfo.location && <div className="resume-contact-item">e {contactInfo.location}</div>}
          {contactInfo.linkedin && <div className="resume-contact-item">🔗 {contactInfo.linkedin}</div>}
          {contactInfo.github && <div className="resume-contact-item">💻 {contactInfo.github}</div>}
        </div>
      </div>

      {/* Summary */}
      {resume.parsed_text && (
        <div className="resume-section">
          <div className="section-title">Professional Summary</div>
          <p className="entry-description">
            {resume.parsed_text.split('\n')[0] || 'Professional with diverse experience in technology and innovation.'}
          </p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="resume-section">
          <div className="section-title">Professional Experience</div>
          {experience.map((exp, idx) => (
            <div key={idx} className="entry">
              <div className="entry-header">
                <span className="entry-title">{exp.position || exp.title || 'Position'}</span>
                <span className="entry-date">
                  {formatDate(exp.startDate)} - {exp.endDate?.toLowerCase() === 'present' ? 'Present' : formatDate(exp.endDate)}
                </span>
              </div>
              <div className="entry-subheader">
                <span className="entry-company">{exp.company || 'Company'}</span>
                {exp.location && <span className="entry-location">{exp.location}</span>}
              </div>
              {exp.description && (
                <p className="entry-description">{exp.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="resume-section">
          <div className="section-title">Education</div>
          {education.map((edu, idx) => (
            <div key={idx} className="entry">
              <div className="entry-header">
                <span className="entry-title">
                  {edu.degree} {edu.field ? `in ${edu.field}` : ''}
                </span>
                <span className="entry-date">
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                </span>
              </div>
              <div className="entry-subheader">
                <span className="entry-company">{edu.school || 'Institution'}</span>
                {edu.location && <span className="entry-location">{edu.location}</span>}
              </div>
              {edu.gpa && (
                <p className="entry-description">GPA: {edu.gpa}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="resume-section">
          <div className="section-title">Projects</div>
          {projects.map((proj, idx) => (
            <div key={idx} className="entry">
              <div className="entry-header">
                <span className="entry-title">{proj.name || 'Project'}</span>
                {proj.startDate && (
                  <span className="entry-date">
                    {formatDate(proj.startDate)} {proj.endDate ? `- ${formatDate(proj.endDate)}` : ''}
                  </span>
                )}
              </div>
              {proj.technologies && proj.technologies.length > 0 && (
                <p className="entry-subheader">
                  <span className="entry-company">
                    {Array.isArray(proj.technologies) 
                      ? proj.technologies.join(', ')
                      : typeof proj.technologies === 'string'
                      ? proj.technologies
                      : ''}
                  </span>
                </p>
              )}
              {proj.description && (
                <p className="entry-description">{proj.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {Object.keys(skills).length > 0 && (
        <div className="resume-section">
          <div className="section-title">Technical Skills</div>
          <div className="skills-grid">
            {Object.entries(skills).map(([category, items]: [string, any], idx) => (
              <div key={idx} className="skills-item">
                <span className="skills-label">{category}:</span>{' '}
                <span className="skills-content">
                  {Array.isArray(items) ? items.join(', ') : items}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
