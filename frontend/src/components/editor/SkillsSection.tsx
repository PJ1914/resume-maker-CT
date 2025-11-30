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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-secondary-900">Skills</h2>
        <button onClick={addSkillCategory} className="btn-primary text-sm">
          + Add Category
        </button>
      </div>

      <div className="space-y-4">
        {skills.map((skill, index) => (
          <div key={index} className="flex gap-4">
            <div className="w-1/3">
              <input
                type="text"
                className="input"
                value={skill.category}
                onChange={(e) =>
                  updateCategory(index, { category: e.target.value })
                }
                placeholder="e.g., Languages"
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                className="input"
                value={skill.items.join(', ')}
                onChange={(e) => updateItems(index, e.target.value)}
                placeholder="Python, JavaScript, TypeScript"
              />
            </div>
            <button
              onClick={() => removeCategory(index)}
              className="text-danger-600 hover:text-danger-700 p-2"
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
  );
};
