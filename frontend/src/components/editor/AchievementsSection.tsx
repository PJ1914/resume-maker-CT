/**
 * Achievements Section Component
 */

import React from 'react';
import { Achievement, createEmptyAchievement } from '../../types/resume';

interface AchievementsSectionProps {
  achievements: Achievement[];
  onChange: (achievements: Achievement[]) => void;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  achievements,
  onChange,
}) => {
  const addAchievement = () => {
    onChange([...achievements, createEmptyAchievement()]);
  };

  const updateAchievement = (index: number, updates: Partial<Achievement>) => {
    const newAchs = [...achievements];
    newAchs[index] = { ...newAchs[index], ...updates };
    onChange(newAchs);
  };

  const removeAchievement = (index: number) => {
    onChange(achievements.filter((_, i) => i !== index));
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-secondary-900">Achievements</h2>
        <button onClick={addAchievement} className="btn-primary text-sm">
          + Add Achievement
        </button>
      </div>

      <div className="space-y-4">
        {achievements.map((achievement, index) => (
          <div key={index} className="border border-secondary-200 rounded-lg p-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Achievement Title
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={achievement.title}
                  onChange={(e) =>
                    updateAchievement(index, { title: e.target.value })
                  }
                  placeholder="e.g., Top Performer Award"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Description
                </label>
                <textarea
                  className="input w-full"
                  value={achievement.description}
                  onChange={(e) =>
                    updateAchievement(index, { description: e.target.value })
                  }
                  placeholder="Brief description of the achievement"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Date
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={achievement.date}
                  onChange={(e) =>
                    updateAchievement(index, { date: e.target.value })
                  }
                  placeholder="e.g., Jan 2024"
                />
              </div>

              <button
                onClick={() => removeAchievement(index)}
                className="text-danger-600 hover:text-danger-700 text-sm font-medium"
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
