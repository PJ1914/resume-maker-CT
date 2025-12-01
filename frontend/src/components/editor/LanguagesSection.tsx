/**
 * Languages Section Component
 */

import React from 'react';
import { Language, createEmptyLanguage } from '../../types/resume';

interface LanguagesSectionProps {
  languages: Language[];
  onChange: (languages: Language[]) => void;
}

export const LanguagesSection: React.FC<LanguagesSectionProps> = ({
  languages,
  onChange,
}) => {
  const proficiencyLevels = ['Native', 'Fluent', 'Professional', 'Intermediate', 'Basic'];

  const addLanguage = () => {
    onChange([...languages, createEmptyLanguage()]);
  };

  const updateLanguage = (index: number, updates: Partial<Language>) => {
    const newLangs = [...languages];
    newLangs[index] = { ...newLangs[index], ...updates };
    onChange(newLangs);
  };

  const removeLanguage = (index: number) => {
    onChange(languages.filter((_, i) => i !== index));
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">Languages</h2>
        <button onClick={addLanguage} className="btn-primary text-sm">
          + Add Language
        </button>
      </div>

      <div className="space-y-4">
        {languages.map((lang, index) => (
          <div key={index} className="border border-secondary-200 dark:border-secondary-700 rounded-lg p-4">
            <div className="space-y-3">
              <div>
                <label className="label">
                  Language
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={lang.language}
                  onChange={(e) =>
                    updateLanguage(index, { language: e.target.value })
                  }
                  placeholder="e.g., Spanish, French, Mandarin"
                />
              </div>

              <div>
                <label className="label">
                  Proficiency Level
                </label>
                <select
                  className="input w-full"
                  value={lang.proficiency}
                  onChange={(e) =>
                    updateLanguage(index, { proficiency: e.target.value })
                  }
                >
                  <option value="">Select proficiency level</option>
                  {proficiencyLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => removeLanguage(index)}
                className="text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
