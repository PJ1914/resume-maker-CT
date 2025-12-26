/**
 * Education Section Component
 */

import React, { useState } from 'react';
import { Education, createEmptyEducation } from '../../types/resume';

interface EducationSectionProps {
  education: Education[];
  onChange: (education: Education[]) => void;
}

export const EducationSection: React.FC<EducationSectionProps> = ({
  education,
  onChange,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addEducation = () => {
    onChange([...education, createEmptyEducation()]);
  };

  const updateEducation = (index: number, updates: Partial<Education>) => {
    const newEducation = [...education];
    newEducation[index] = { ...newEducation[index], ...updates };
    onChange(newEducation);
  };

  const removeEducation = (index: number) => {
    onChange(education.filter((_, i) => i !== index));
  };

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">Education</h2>
        <button onClick={addEducation} className="btn-primary text-sm w-full sm:w-auto">
          + Add Education
        </button>
      </div>

      <div className="space-y-3">
        {education.map((edu, index) => (
          <div
            key={edu.id}
            className="border border-secondary-200 dark:border-secondary-700 rounded-lg overflow-hidden"
          >
            <div
              className="bg-secondary-50 dark:bg-secondary-800/50 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
              onClick={() =>
                setExpandedId(expandedId === edu.id ? null : edu.id)
              }
            >
              <div>
                <h3 className="font-medium text-secondary-900 dark:text-white">
                  {edu.degree || 'Untitled Degree'} {edu.field && `in ${edu.field}`}
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  {edu.institution || 'Institution'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeEducation(index);
                  }}
                  className="text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300 p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <svg
                  className={`w-5 h-5 text-secondary-400 dark:text-secondary-500 transition-transform ${expandedId === edu.id ? 'rotate-180' : ''
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {expandedId === edu.id && (
              <div className="p-4 space-y-4 bg-white dark:bg-secondary-900">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Institution *</label>
                    <input
                      type="text"
                      className="input"
                      value={edu.institution}
                      onChange={(e) =>
                        updateEducation(index, { institution: e.target.value })
                      }
                      placeholder="University of Example"
                    />
                  </div>

                  <div>
                    <label className="label">Location *</label>
                    <input
                      type="text"
                      className="input"
                      value={edu.location}
                      onChange={(e) =>
                        updateEducation(index, { location: e.target.value })
                      }
                      placeholder="City, State"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Degree *</label>
                    <input
                      type="text"
                      className="input"
                      value={edu.degree}
                      onChange={(e) =>
                        updateEducation(index, { degree: e.target.value })
                      }
                      placeholder="Bachelor of Science"
                    />
                  </div>

                  <div>
                    <label className="label">Field of Study *</label>
                    <input
                      type="text"
                      className="input"
                      value={edu.field}
                      onChange={(e) =>
                        updateEducation(index, { field: e.target.value })
                      }
                      placeholder="Computer Science"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Start Date</label>
                    <input
                      type="text"
                      className="input"
                      value={edu.startDate}
                      onChange={(e) =>
                        updateEducation(index, { startDate: e.target.value })
                      }
                      placeholder="Aug 2020"
                    />
                  </div>

                  <div>
                    <label className="label">End Date</label>
                    <input
                      type="text"
                      className="input"
                      value={edu.endDate}
                      onChange={(e) =>
                        updateEducation(index, { endDate: e.target.value })
                      }
                      placeholder="May 2024 or Expected 2025"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">GPA</label>
                    <input
                      type="text"
                      className="input"
                      value={edu.gpa || ''}
                      onChange={(e) =>
                        updateEducation(index, { gpa: e.target.value })
                      }
                      placeholder="3.8/4.0"
                    />
                  </div>

                  <div>
                    <label className="label">Honors/Awards</label>
                    <input
                      type="text"
                      className="input"
                      value={edu.honors || ''}
                      onChange={(e) =>
                        updateEducation(index, { honors: e.target.value })
                      }
                      placeholder=" "
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
