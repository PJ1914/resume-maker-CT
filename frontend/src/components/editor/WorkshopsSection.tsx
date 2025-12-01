/**
 * Workshops Section Component
 */

import React, { useState } from 'react';
import { Workshop, createEmptyWorkshop } from '../../types/resume';

interface WorkshopsSectionProps {
  workshops: Workshop[];
  onChange: (workshops: Workshop[]) => void;
  title?: string;
}

export const WorkshopsSection: React.FC<WorkshopsSectionProps> = ({
  workshops,
  onChange,
  title = 'Workshops',
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(
    workshops[0]?.id || null
  );

  const addWorkshop = () => {
    const newItem = createEmptyWorkshop();
    onChange([...workshops, newItem]);
    setExpandedId(newItem.id);
  };

  const removeWorkshop = (id: string) => {
    onChange(workshops.filter((w) => w.id !== id));
  };

  const updateWorkshop = (id: string, updates: Partial<Workshop>) => {
    onChange(
      workshops.map((w) => (w.id === id ? { ...w, ...updates } : w))
    );
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">
          {title}
        </h2>
        <button onClick={addWorkshop} className="btn-primary text-sm">
          + Add Workshop
        </button>
      </div>

      <div className="space-y-4">
        {workshops.length === 0 ? (
          <p className="text-secondary-500 dark:text-secondary-400 text-center py-8">
            No workshops added yet. Click "Add Workshop" to get started.
          </p>
        ) : (
          workshops.map((workshop) => (
            <div
              key={workshop.id}
              className="border border-secondary-200 dark:border-secondary-700 rounded-lg overflow-hidden"
            >
              {/* Header */}
              <div
                className="p-4 bg-secondary-50 dark:bg-secondary-800/50 cursor-pointer flex items-center justify-between hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                onClick={() =>
                  setExpandedId(expandedId === workshop.id ? null : workshop.id)
                }
              >
                <div className="flex-1">
                  <h3 className="font-medium text-secondary-900 dark:text-white">
                    {workshop.name || 'Untitled Workshop'}
                  </h3>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    {workshop.role && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 mr-2">
                        {workshop.role}
                      </span>
                    )}
                    {workshop.date}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeWorkshop(workshop.id);
                    }}
                    className="text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300 p-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <svg
                    className={`w-5 h-5 text-secondary-400 dark:text-secondary-500 transition-transform ${expandedId === workshop.id ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded Form */}
              {expandedId === workshop.id && (
                <div className="p-4 space-y-4 bg-white dark:bg-secondary-900">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Workshop Name/Topic *</label>
                      <input
                        type="text"
                        className="input"
                        value={workshop.name}
                        onChange={(e) => updateWorkshop(workshop.id, { name: e.target.value })}
                        placeholder="e.g., Introduction to AI & Machine Learning"
                      />
                    </div>

                    <div>
                      <label className="label">Role</label>
                      <select
                        className="input"
                        value={workshop.role}
                        onChange={(e) => updateWorkshop(workshop.id, { role: e.target.value })}
                      >
                        <option value="">Select role...</option>
                        <option value="Conducted">Conducted</option>
                        <option value="Organized">Organized</option>
                        <option value="Speaker">Speaker</option>
                        <option value="Instructor">Instructor</option>
                        <option value="Co-Instructor">Co-Instructor</option>
                        <option value="Attended">Attended</option>
                        <option value="Participant">Participant</option>
                        <option value="Volunteer">Volunteer</option>
                      </select>
                    </div>

                    <div>
                      <label className="label">Date</label>
                      <input
                        type="text"
                        className="input"
                        value={workshop.date}
                        onChange={(e) => updateWorkshop(workshop.id, { date: e.target.value })}
                        placeholder="e.g., January 2024"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Description</label>
                    <textarea
                      className="input min-h-[80px]"
                      value={workshop.description}
                      onChange={(e) => updateWorkshop(workshop.id, { description: e.target.value })}
                      placeholder="Details about the workshop..."
                      rows={3}
                    />
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
