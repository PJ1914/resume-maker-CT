/**
 * ATS Score Display Component
 * Beautiful visualization of resume ATS score with breakdown and suggestions
 */

import { useEffect, useState } from 'react';

interface ScoreBreakdown {
  formatting: number;
  keywords: number;
  experience: number;
  education: number;
  skills: number;
  sections: number;
}

interface ATSScoreProps {
  score: number;
  rating?: string;
  breakdown?: ScoreBreakdown;
  suggestions?: string[];
  strengths?: string[];
  weaknesses?: string[];
  loading?: boolean;
}

export default function ATSScoreDisplay({
  score,
  rating = 'Good',
  breakdown,
  suggestions = [],
  strengths = [],
  weaknesses = [],
  loading = false,
}: ATSScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animate score on mount
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setAnimatedScore(score);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [score, loading]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success-600';
    if (score >= 60) return 'text-warning-600';
    return 'text-danger-600';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'bg-success-600';
    if (score >= 60) return 'bg-warning-600';
    return 'bg-danger-600';
  };

  const getRatingIcon = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'excellent':
        return '🌟';
      case 'good':
        return '✅';
      case 'fair':
        return '⚠️';
      default:
        return '📊';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-secondary-200 p-8">
        <div className="space-y-4 animate-pulse">
          <div className="h-12 bg-secondary-300 rounded w-3/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-secondary-200 rounded w-full"></div>
            <div className="h-4 bg-secondary-200 rounded w-5/6"></div>
            <div className="h-4 bg-secondary-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <div className="bg-gradient-to-br from-white to-secondary-50 rounded-2xl border-2 border-secondary-200 p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-secondary-900">ATS Score</h2>
            <p className="text-sm text-secondary-600 mt-1">
              How well your resume passes Applicant Tracking Systems
            </p>
          </div>
          <div className="text-4xl">{getRatingIcon(rating)}</div>
        </div>

        <div className="flex items-center gap-8">
          {/* Circular Progress */}
          <div className="relative">
            <svg className="transform -rotate-90 w-40 h-40">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-secondary-200"
              />
              {/* Progress circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="url(#scoreGradient)"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - animatedScore / 100)}`}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" className={`${getScoreGradient(score).split(' ')[0].replace('from-', 'text-')}`} />
                  <stop offset="100%" className={`${getScoreGradient(score).split(' ')[1].replace('to-', 'text-')}`} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-5xl font-bold ${getScoreColor(animatedScore)}`}>
                  {Math.round(animatedScore)}
                </div>
                <div className="text-sm text-secondary-600 font-medium">/ 100</div>
              </div>
            </div>
          </div>

          {/* Rating Badge */}
          <div className="flex-1">
            <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold ${
              score >= 80 ? 'bg-success-600 text-success-600' :
              score >= 60 ? 'bg-warning-100 text-warning-600' :
              'bg-danger-100 text-danger-600'
            }`}>
              {rating}
            </div>
            <p className="text-sm text-secondary-600 mt-4 leading-relaxed">
              {score >= 80 && 'Your resume is highly optimized for ATS systems. Great job!'}
              {score >= 60 && score < 80 && 'Your resume is good but has room for improvement.'}
              {score < 60 && 'Your resume needs significant improvements to pass ATS systems.'}
            </p>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      {breakdown && (
        <div className="bg-white rounded-xl border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Score Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(breakdown).map(([category, value]) => (
              <div key={category} className="bg-secondary-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-secondary-700 capitalize">
                    {category}
                  </span>
                  <span className={`text-lg font-bold ${getScoreColor(value)}`}>
                    {value}
                  </span>
                </div>
                <div className="w-full bg-secondary-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 bg-gradient-to-r ${getScoreGradient(value)}`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses */}
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Strengths */}
          {strengths.length > 0 && (
            <div className="bg-success-600 border border-success-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-semibold text-success-600">Strengths</h3>
              </div>
              <ul className="space-y-2">
                {strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-success-600">
                    <span className="text-success-600 mt-0.5">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {weaknesses.length > 0 && (
            <div className="bg-danger-100 border border-danger-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-danger-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-semibold text-danger-600">Areas to Improve</h3>
              </div>
              <ul className="space-y-2">
                {weaknesses.map((weakness, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-danger-600">
                    <span className="text-danger-600 mt-0.5">•</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-secondary-500 border border-secondary-300 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-6 h-6 text-secondary-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-semibold text-secondary-600">Suggestions for Improvement</h3>
          </div>
          <ul className="space-y-3">
            {suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-secondary-600">
                <span className="flex-shrink-0 w-6 h-6 bg-secondary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
