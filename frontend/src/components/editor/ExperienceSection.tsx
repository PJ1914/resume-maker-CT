/**
 * Experience Section Component
 */

import React, { useState } from 'react';
import { Experience, createEmptyExperience } from '../../types/resume';

interface ExperienceSectionProps {
  experience: Experience[];
  onChange: (experience: Experience[]) => void;
  onAIImprove?: (text: string) => Promise<string>;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  experience,
  onChange,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(
    experience[0]?.id || null
  );

  const addExperience = () => {
    const newExp = createEmptyExperience();
    onChange([...experience, newExp]);
    setExpandedId(newExp.id);
  };

  const removeExperience = (id: string) => {
    onChange(experience.filter((exp) => exp.id !== id));
  };

  const updateExperience = (id: string, updates: Partial<Experience>) => {
    onChange(
      experience.map((exp) =>
        exp.id === id ? { ...exp, ...updates } : exp
      )
    );
  };

  const addHighlight = (id: string) => {
    const exp = experience.find((e) => e.id === id);
    if (exp) {
      updateExperience(id, {
        highlights: [...exp.highlights, ''],
      });
    }
  };

  const updateHighlight = (id: string, index: number, value: string) => {
    const exp = experience.find((e) => e.id === id);
    if (exp) {
      const newHighlights = [...exp.highlights];
      newHighlights[index] = value;
      updateExperience(id, { highlights: newHighlights });
    }
  };

  const removeHighlight = (id: string, index: number) => {
    const exp = experience.find((e) => e.id === id);
    if (exp) {
      updateExperience(id, {
        highlights: exp.highlights.filter((_, i) => i !== index),
      });
    }
  };

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">
          Work Experience
        </h2>
        <button onClick={addExperience} className="btn-primary text-sm w-full sm:w-auto">
          + Add Experience
        </button>
      </div>

      <div className="space-y-4">
        {experience.length === 0 ? (
          <p className="text-secondary-500 dark:text-secondary-400 text-center py-8">
            No experience added yet. Click "Add Experience" to get started.
          </p>
        ) : (
          experience.map((exp) => (
            <div
              key={exp.id}
              className="border border-secondary-200 dark:border-secondary-700 rounded-lg overflow-hidden"
            >
              {/* Header */}
              <div
                className="p-4 bg-secondary-50 dark:bg-secondary-800/50 cursor-pointer flex items-center justify-between hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                onClick={() =>
                  setExpandedId(expandedId === exp.id ? null : exp.id)
                }
              >
                <div className="flex-1">
                  <h3 className="font-medium text-secondary-900 dark:text-white">
                    {exp.position || 'Untitled Position'} {exp.company && `at ${exp.company}`}
                  </h3>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    {exp.startDate || 'Start'} - {exp.current ? 'Present' : exp.endDate || 'End'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeExperience(exp.id);
                    }}
                    className="text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300 p-1"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                  <svg
                    className={`w-5 h-5 text-secondary-400 dark:text-secondary-500 transition-transform ${expandedId === exp.id ? 'rotate-180' : ''
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

              {/* Expanded Form */}
              {expandedId === exp.id && (
                <div className="p-4 space-y-4 bg-white dark:bg-secondary-900">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Position *</label>
                      <input
                        type="text"
                        className="input"
                        value={exp.position}
                        onChange={(e) =>
                          updateExperience(exp.id, {
                            position: e.target.value,
                            title: e.target.value,  // Keep both in sync
                          })
                        }
                        placeholder="Software Engineer"
                      />
                    </div>

                    <div>
                      <label className="label">Company *</label>
                      <input
                        type="text"
                        className="input"
                        value={exp.company}
                        onChange={(e) =>
                          updateExperience(exp.id, { company: e.target.value })
                        }
                        placeholder="Tech Corp"
                      />
                    </div>

                    <div>
                      <label className="label">Location</label>
                      <input
                        type="text"
                        className="input"
                        value={exp.location}
                        onChange={(e) =>
                          updateExperience(exp.id, {
                            location: e.target.value,
                          })
                        }
                        placeholder="San Francisco, CA"
                      />
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="label">Start Date</label>
                        <input
                          type="text"
                          className="input"
                          value={exp.startDate}
                          onChange={(e) =>
                            updateExperience(exp.id, {
                              startDate: e.target.value,
                            })
                          }
                          placeholder="May 2024"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="label">End Date</label>
                        <input
                          type="text"
                          className="input"
                          value={exp.current ? 'Present' : exp.endDate}
                          onChange={(e) =>
                            updateExperience(exp.id, {
                              endDate: e.target.value,
                            })
                          }
                          disabled={exp.current}
                          placeholder="Aug 2024 or Present"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exp.current}
                          onChange={(e) =>
                            updateExperience(exp.id, {
                              current: e.target.checked,
                              endDate: e.target.checked ? '' : exp.endDate,
                            })
                          }
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-800"
                        />
                        <span className="text-sm text-secondary-700 dark:text-secondary-300">
                          I currently work here
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="label">Description</label>
                    <textarea
                      className="input min-h-[80px]"
                      value={exp.description}
                      onChange={(e) =>
                        updateExperience(exp.id, {
                          description: e.target.value,
                        })
                      }
                      placeholder="Brief description of your role..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="label mb-0">Key Achievements</label>
                      <button
                        onClick={() => addHighlight(exp.id)}
                        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        + Add Achievement
                      </button>
                    </div>

                    <div className="space-y-2">
                      {exp.highlights.map((highlight, hIndex) => (
                        <div key={hIndex} className="flex gap-2">
                          <span className="text-secondary-500 dark:text-secondary-400 mt-2">•</span>
                          <input
                            type="text"
                            className="input flex-1"
                            value={highlight}
                            onChange={(e) =>
                              updateHighlight(exp.id, hIndex, e.target.value)
                            }
                            placeholder="Increased team productivity by 40%..."
                          />
                          <button
                            onClick={() => removeHighlight(exp.id, hIndex)}
                            className="text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300 p-2"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
