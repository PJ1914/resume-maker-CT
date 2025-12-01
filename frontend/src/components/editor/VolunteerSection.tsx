/**
 * Volunteer Work Section Component
 */

import React, { useState } from 'react';
import { Volunteer, createEmptyVolunteer } from '../../types/resume';

interface VolunteerSectionProps {
  volunteer: Volunteer[];
  onChange: (volunteer: Volunteer[]) => void;
  title?: string;
}

export const VolunteerSection: React.FC<VolunteerSectionProps> = ({
  volunteer,
  onChange,
  title = 'Volunteer Work',
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(
    volunteer[0]?.id || null
  );

  const addVolunteer = () => {
    const newItem = createEmptyVolunteer();
    onChange([...volunteer, newItem]);
    setExpandedId(newItem.id);
  };

  const removeVolunteer = (id: string) => {
    onChange(volunteer.filter((v) => v.id !== id));
  };

  const updateVolunteer = (id: string, updates: Partial<Volunteer>) => {
    onChange(
      volunteer.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">
          {title}
        </h2>
        <button onClick={addVolunteer} className="btn-primary text-sm">
          + Add Volunteer Experience
        </button>
      </div>

      <div className="space-y-4">
        {volunteer.length === 0 ? (
          <p className="text-secondary-500 dark:text-secondary-400 text-center py-8">
            No volunteer work added yet. Click "Add Volunteer Experience" to get started.
          </p>
        ) : (
          volunteer.map((vol) => (
            <div
              key={vol.id}
              className="border border-secondary-200 dark:border-secondary-700 rounded-lg overflow-hidden"
            >
              {/* Header */}
              <div
                className="p-4 bg-secondary-50 dark:bg-secondary-800/50 cursor-pointer flex items-center justify-between hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                onClick={() =>
                  setExpandedId(expandedId === vol.id ? null : vol.id)
                }
              >
                <div className="flex-1">
                  <h3 className="font-medium text-secondary-900 dark:text-white">
                    {vol.role || 'Untitled Role'} {vol.organization && `at ${vol.organization}`}
                  </h3>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    {vol.date}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeVolunteer(vol.id);
                    }}
                    className="text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300 p-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <svg
                    className={`w-5 h-5 text-secondary-400 dark:text-secondary-500 transition-transform ${expandedId === vol.id ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded Form */}
              {expandedId === vol.id && (
                <div className="p-4 space-y-4 bg-white dark:bg-secondary-900">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Organization *</label>
                      <input
                        type="text"
                        className="input"
                        value={vol.organization}
                        onChange={(e) => updateVolunteer(vol.id, { organization: e.target.value })}
                        placeholder="e.g., Red Cross, Local Food Bank"
                      />
                    </div>

                    <div>
                      <label className="label">Role/Position</label>
                      <input
                        type="text"
                        className="input"
                        value={vol.role}
                        onChange={(e) => updateVolunteer(vol.id, { role: e.target.value })}
                        placeholder="e.g., Team Lead, Volunteer"
                      />
                    </div>

                    <div>
                      <label className="label">Date/Duration</label>
                      <input
                        type="text"
                        className="input"
                        value={vol.date}
                        onChange={(e) => updateVolunteer(vol.id, { date: e.target.value })}
                        placeholder="e.g., Jan 2023 - Present"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Description</label>
                    <textarea
                      className="input min-h-[80px]"
                      value={vol.description}
                      onChange={(e) => updateVolunteer(vol.id, { description: e.target.value })}
                      placeholder="Describe your volunteer activities and impact..."
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
