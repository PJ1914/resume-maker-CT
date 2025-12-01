/**
 * Skills Section Component
 */

import React from 'react';
import { Skill, createEmptySkill } from '../../types/resume';

interface SkillsSectionProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  skills,
  onChange,
}) => {
  const addSkillCategory = () => {
    onChange([...skills, createEmptySkill()]);
  };

  const updateCategory = (index: number, updates: Partial<Skill>) => {
    const newSkills = [...skills];
    newSkills[index] = { ...newSkills[index], ...updates };
    onChange(newSkills);
  };

  const removeCategory = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  const updateItems = (index: number, value: string) => {
    const items = value.split(',').map((s) => s.trim()).filter(Boolean);
    updateCategory(index, { items });
  };

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">Skills</h2>
        <button onClick={addSkillCategory} className="btn-primary text-sm w-full sm:w-auto">
          + Add Category
        </button>
      </div>

      <div className="space-y-4">
        {skills.map((skill, index) => (
          <div key={index} className="flex flex-col sm:flex-row gap-2 sm:gap-4 p-3 sm:p-0 bg-secondary-50 dark:bg-secondary-800 sm:bg-transparent sm:dark:bg-transparent rounded-lg sm:rounded-none border border-secondary-100 dark:border-secondary-700 sm:border-none">
            <div className="w-full sm:w-1/3">
              <input
                type="text"
                className="input"
                value={skill.category}
                onChange={(e) =>
                  updateCategory(index, { category: e.target.value })
                }
                placeholder="Category (e.g., Languages)"
              />
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                className="input flex-1"
                value={skill.items.join(', ')}
                onChange={(e) => updateItems(index, e.target.value)}
                placeholder="Python, JavaScript, TypeScript"
              />
              <button
                onClick={() => removeCategory(index)}
                className="text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300 p-2 shrink-0"
                title="Remove category"
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
          </div>
        ))}
      </div>
    </div>
  );
};
