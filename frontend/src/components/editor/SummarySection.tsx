/**
 * Professional Summary Section Component
 */

import React, { useState } from 'react';

interface SummarySectionProps {
  summary: string;
  onChange: (summary: string) => void;
  onAIImprove?: (text: string) => Promise<string>;
  onAIRewrite?: (text: string) => Promise<string>;
}

export const SummarySection: React.FC<SummarySectionProps> = ({
  summary,
  onChange,
  onAIImprove,
  onAIRewrite,
}) => {
  const [improving, setImproving] = useState(false);
  const [rewriting, setRewriting] = useState(false);

  const handleAIImprove = async () => {
    if (!onAIImprove || !summary.trim()) return;

    setImproving(true);
    try {
      const improved = await onAIImprove(summary);
      onChange(improved);
    } catch (error) {
      console.error('Failed to improve summary:', error);
      alert('Failed to get AI suggestion. Please try again.');
    } finally {
      setImproving(false);
    }
  };

  const handleAIRewrite = async () => {
    if (!onAIRewrite || !summary.trim()) return;

    setRewriting(true);
    try {
      const rewritten = await onAIRewrite(summary);
      onChange(rewritten);
    } catch (error) {
      console.error('Failed to rewrite summary:', error);
      alert('Failed to get AI rewrite. Please try again.');
    } finally {
      setRewriting(false);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-secondary-900">
          Professional Summary
        </h2>
        <div className="flex gap-2">
          {onAIImprove && (
            <button
              onClick={handleAIImprove}
              disabled={!summary.trim() || improving || rewriting}
              className="btn-secondary text-sm flex items-center gap-2"
              title="Enhance existing content while keeping the main ideas"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              {improving ? 'Improving...' : 'Improve with AI'}
            </button>
          )}
          {onAIRewrite && (
            <button
              onClick={handleAIRewrite}
              disabled={!summary.trim() || improving || rewriting}
              className="btn-outline text-sm flex items-center gap-2"
              title="Completely rewrite for better impact and ATS optimization"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {rewriting ? 'Rewriting...' : 'Rewrite with AI'}
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="label">
          Summary
          <span className="text-sm text-secondary-500 ml-2">
            (2-3 sentences highlighting your experience and goals)
          </span>
        </label>
        <textarea
          className="input min-h-[120px] resize-y"
          value={summary}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Experienced software engineer with 5+ years building scalable web applications..."
          rows={5}
        />
        <p className="text-sm text-secondary-500 mt-1">
          {summary.length} characters
        </p>
      </div>
    </div>
  );
};
