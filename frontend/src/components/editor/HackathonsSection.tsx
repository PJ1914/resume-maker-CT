/**
 * Hackathons & Competitions Section Component
 */

import React, { useState } from 'react';
import { Hackathon, createEmptyHackathon } from '../../types/resume';

interface HackathonsSectionProps {
  hackathons: Hackathon[];
  onChange: (hackathons: Hackathon[]) => void;
  title?: string;
}

export const HackathonsSection: React.FC<HackathonsSectionProps> = ({
  hackathons,
  onChange,
  title = 'Hackathons & Competitions',
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(
    hackathons[0]?.id || null
  );

  const addHackathon = () => {
    const newItem = createEmptyHackathon();
    onChange([...hackathons, newItem]);
    setExpandedId(newItem.id);
  };

  const removeHackathon = (id: string) => {
    onChange(hackathons.filter((h) => h.id !== id));
  };

  const updateHackathon = (id: string, updates: Partial<Hackathon>) => {
    onChange(
      hackathons.map((h) => (h.id === id ? { ...h, ...updates } : h))
    );
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">
          {title}
        </h2>
        <button onClick={addHackathon} className="btn-primary text-sm">
          + Add Entry
        </button>
      </div>

      <div className="space-y-4">
        {hackathons.length === 0 ? (
          <p className="text-secondary-500 dark:text-secondary-400 text-center py-8">
            No hackathons or competitions added yet. Click "Add Entry" to get started.
          </p>
        ) : (
          hackathons.map((hackathon) => (
            <div
              key={hackathon.id}
              className="border border-secondary-200 dark:border-secondary-700 rounded-lg overflow-hidden"
            >
              {/* Header */}
              <div
                className="p-4 bg-secondary-50 dark:bg-secondary-800/50 cursor-pointer flex items-center justify-between hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                onClick={() =>
                  setExpandedId(expandedId === hackathon.id ? null : hackathon.id)
                }
              >
                <div className="flex-1">
                  <h3 className="font-medium text-secondary-900 dark:text-white">
                    {hackathon.name || 'Untitled Event'}
                  </h3>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    {hackathon.achievement && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 mr-2">
                        {hackathon.achievement}
                      </span>
                    )}
                    {hackathon.date}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeHackathon(hackathon.id);
                    }}
                    className="text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300 p-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <svg
                    className={`w-5 h-5 text-secondary-400 dark:text-secondary-500 transition-transform ${expandedId === hackathon.id ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded Form */}
              {expandedId === hackathon.id && (
                <div className="p-4 space-y-4 dark:bg-secondary-900">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Event/Competition Name *</label>
                      <input
                        type="text"
                        className="input"
                        value={hackathon.name}
                        onChange={(e) => updateHackathon(hackathon.id, { name: e.target.value })}
                        placeholder="e.g., IEEE National Level Hackathon"
                      />
                    </div>

                    <div>
                      <label className="label">Achievement/Result</label>
                      <select
                        className="input"
                        value={hackathon.achievement}
                        onChange={(e) => updateHackathon(hackathon.id, { achievement: e.target.value })}
                      >
                        <option value="">Select result...</option>
                        <option value="Winner">Winner</option>
                        <option value="1st Place">1st Place</option>
                        <option value="2nd Place">2nd Place</option>
                        <option value="3rd Place">3rd Place</option>
                        <option value="Finalist">Finalist</option>
                        <option value="Semi-Finalist">Semi-Finalist</option>
                        <option value="Top 10">Top 10</option>
                        <option value="Top 20">Top 20</option>
                        <option value="Participant">Participant</option>
                        <option value="Honorable Mention">Honorable Mention</option>
                        <option value="Best Innovation">Best Innovation</option>
                        <option value="Best Design">Best Design</option>
                      </select>
                    </div>

                    <div>
                      <label className="label">Date</label>
                      <input
                        type="text"
                        className="input"
                        value={hackathon.date}
                        onChange={(e) => updateHackathon(hackathon.id, { date: e.target.value })}
                        placeholder="e.g., March 2024"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Description (Optional)</label>
                    <textarea
                      className="input min-h-[80px]"
                      value={hackathon.description}
                      onChange={(e) => updateHackathon(hackathon.id, { description: e.target.value })}
                      placeholder="Brief description of your project or participation..."
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
