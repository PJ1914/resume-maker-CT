/**
 * Publications Section Component
 */

import React, { useState } from 'react';
import { Publication, createEmptyPublication } from '../../types/resume';

interface PublicationsSectionProps {
  publications: Publication[];
  onChange: (publications: Publication[]) => void;
  title?: string;
}

export const PublicationsSection: React.FC<PublicationsSectionProps> = ({
  publications,
  onChange,
  title = 'Publications',
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(
    publications[0]?.id || null
  );

  const addPublication = () => {
    const newItem = createEmptyPublication();
    onChange([...publications, newItem]);
    setExpandedId(newItem.id);
  };

  const removePublication = (id: string) => {
    onChange(publications.filter((p) => p.id !== id));
  };

  const updatePublication = (id: string, updates: Partial<Publication>) => {
    onChange(
      publications.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">
          {title}
        </h2>
        <button onClick={addPublication} className="btn-primary text-sm">
          + Add Publication
        </button>
      </div>

      <div className="space-y-4">
        {publications.length === 0 ? (
          <p className="text-secondary-500 dark:text-secondary-400 text-center py-8">
            No publications added yet. Click "Add Publication" to get started.
          </p>
        ) : (
          publications.map((publication) => (
            <div
              key={publication.id}
              className="border border-secondary-200 dark:border-secondary-700 rounded-lg overflow-hidden"
            >
              {/* Header */}
              <div
                className="p-4 bg-secondary-50 dark:bg-secondary-800/50 cursor-pointer flex items-center justify-between hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                onClick={() =>
                  setExpandedId(expandedId === publication.id ? null : publication.id)
                }
              >
                <div className="flex-1">
                  <h3 className="font-medium text-secondary-900 dark:text-white">
                    {publication.title || 'Untitled Publication'}
                  </h3>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    {publication.publisher && `${publication.publisher} • `}
                    {publication.date}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePublication(publication.id);
                    }}
                    className="text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300 p-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <svg
                    className={`w-5 h-5 text-secondary-400 dark:text-secondary-500 transition-transform ${expandedId === publication.id ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded Form */}
              {expandedId === publication.id && (
                <div className="p-4 space-y-4 bg-white dark:bg-secondary-900">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="label">Publication Title *</label>
                      <input
                        type="text"
                        className="input"
                        value={publication.title}
                        onChange={(e) => updatePublication(publication.id, { title: e.target.value })}
                        placeholder="e.g., Machine Learning Approaches for Resume Parsing"
                      />
                    </div>

                    <div>
                      <label className="label">Publisher/Journal/Conference</label>
                      <input
                        type="text"
                        className="input"
                        value={publication.publisher}
                        onChange={(e) => updatePublication(publication.id, { publisher: e.target.value })}
                        placeholder="e.g., IEEE Conference, Nature Journal"
                      />
                    </div>

                    <div>
                      <label className="label">Date</label>
                      <input
                        type="text"
                        className="input"
                        value={publication.date}
                        onChange={(e) => updatePublication(publication.id, { date: e.target.value })}
                        placeholder="e.g., March 2024"
                      />
                    </div>

                    <div>
                      <label className="label">Co-Authors (Optional)</label>
                      <input
                        type="text"
                        className="input"
                        value={publication.authors}
                        onChange={(e) => updatePublication(publication.id, { authors: e.target.value })}
                        placeholder="e.g., John Doe, Jane Smith"
                      />
                    </div>

                    <div>
                      <label className="label">Link/URL (Optional)</label>
                      <input
                        type="url"
                        className="input"
                        value={publication.link}
                        onChange={(e) => updatePublication(publication.id, { link: e.target.value })}
                        placeholder="https://..."
                      />
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
