/**
 * Projects Section Component
 */

import React, { useState } from 'react';
import { Project, createEmptyProject } from '../../types/resume';

interface ProjectsSectionProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
  onAIImprove?: (text: string, context: string) => Promise<string>;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
  onChange,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addProject = () => {
    onChange([...projects, createEmptyProject()]);
  };

  const updateProject = (index: number, updates: Partial<Project>) => {
    const newProjects = [...projects];
    newProjects[index] = { ...newProjects[index], ...updates };
    onChange(newProjects);
  };

  const removeProject = (index: number) => {
    onChange(projects.filter((_, i) => i !== index));
  };

  const addHighlight = (index: number) => {
    const project = projects[index];
    updateProject(index, {
      highlights: [...project.highlights, ''],
    });
  };

  const updateHighlight = (
    projectIndex: number,
    highlightIndex: number,
    value: string
  ) => {
    const project = projects[projectIndex];
    const newHighlights = [...project.highlights];
    newHighlights[highlightIndex] = value;
    updateProject(projectIndex, { highlights: newHighlights });
  };

  const removeHighlight = (projectIndex: number, highlightIndex: number) => {
    const project = projects[projectIndex];
    updateProject(projectIndex, {
      highlights: project.highlights.filter((_, i) => i !== highlightIndex),
    });
  };

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">Projects</h2>
        <button onClick={addProject} className="btn-primary text-sm w-full sm:w-auto">
          + Add Project
        </button>
      </div>

      <div className="space-y-3">
        {projects.map((project, index) => (
          <div
            key={project.id}
            className="border border-secondary-200 dark:border-secondary-700 rounded-lg overflow-hidden"
          >
            <div
              className="bg-secondary-50 dark:bg-secondary-800/50 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
              onClick={() =>
                setExpandedId(expandedId === project.id ? null : project.id)
              }
            >
              <div>
                <h3 className="font-medium text-secondary-900 dark:text-white">
                  {project.name || 'Untitled Project'}
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  {project.technologies.join(', ') || 'No technologies'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeProject(index);
                  }}
                  className="text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300 p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <svg
                  className={`w-5 h-5 text-secondary-400 dark:text-secondary-500 transition-transform ${expandedId === project.id ? 'rotate-180' : ''
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

            {expandedId === project.id && (
              <div className="p-4 space-y-4 bg-white dark:bg-secondary-900">
                <div>
                  <label className="label">Project Name *</label>
                  <input
                    type="text"
                    className="input"
                    value={project.name}
                    onChange={(e) => updateProject(index, { name: e.target.value })}
                    placeholder="Resume Builder Application"
                  />
                </div>

                <div>
                  <label className="label">Description *</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={project.description}
                    onChange={(e) =>
                      updateProject(index, { description: e.target.value })
                    }
                    placeholder="Brief overview of the project..."
                  />
                </div>

                <div>
                  <label className="label">Technologies (comma-separated) *</label>
                  <input
                    type="text"
                    className="input"
                    value={project.technologies.join(', ')}
                    onChange={(e) =>
                      updateProject(index, {
                        technologies: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="React, TypeScript, FastAPI, Firebase"
                  />
                </div>

                <div>
                  <label className="label">Project Link</label>
                  <input
                    type="url"
                    className="input"
                    value={project.link || ''}
                    onChange={(e) => updateProject(index, { link: e.target.value })}
                    placeholder="https://github.com/username/project"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="label">Key Highlights</label>
                    <button
                      onClick={() => addHighlight(index)}
                      className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      + Add Highlight
                    </button>
                  </div>
                  <div className="space-y-2">
                    {projects[index].highlights.map((highlight, hIndex) => (
                      <div key={hIndex} className="flex gap-2">
                        <span className="text-secondary-400 dark:text-secondary-500 mt-3">•</span>
                        <input
                          type="text"
                          className="input flex-1"
                          value={highlight}
                          onChange={(e) =>
                            updateHighlight(index, hIndex, e.target.value)
                          }
                          placeholder="Built responsive UI with React and Tailwind CSS"
                        />
                        <button
                          onClick={() => removeHighlight(index, hIndex)}
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
        ))}
      </div>
    </div>
  );
};
