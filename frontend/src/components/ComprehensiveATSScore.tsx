/**
 * Comprehensive ATS Score Display Component
 * Matches the Advanced ATS Evaluation Engine output format
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle, Lightbulb, TrendingUp } from 'lucide-react';

interface CategoryScore {
  score: number;
  max_score: number;
  percentage: number;
}

interface ScoreBreakdown {
  format_ats_compatibility: CategoryScore;
  keyword_match: CategoryScore;
  skills_relevance: CategoryScore;
  experience_quality: CategoryScore;
  achievements_impact: CategoryScore;
  grammar_clarity: CategoryScore;
}

interface SectionFeedback {
  good: string;
  missing: string;
  improve: string;
}

interface ImprovedBullet {
  original: string;
  suggestion: string;
}

interface ComprehensiveATSScoreProps {
  score: number;
  rating: string;
  breakdown: ScoreBreakdown;
  strengths: string[];
  weaknesses: string[];
  missing_keywords?: string[];
  section_feedback?: Record<string, SectionFeedback>;
  recommendations: string[];
  improved_bullets?: ImprovedBullet[];
  job_description_provided?: boolean;
  loading?: boolean;
}

export default function ComprehensiveATSScore({
  score,
  rating,
  breakdown,
  strengths,
  weaknesses,
  missing_keywords = [],
  section_feedback = {},
  recommendations,
  improved_bullets = [],
  job_description_provided = false,
  loading = false,
}: ComprehensiveATSScoreProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    breakdown: true,
    strengths: true,
    weaknesses: true,
    keywords: false,
    sectionFeedback: false,
    recommendations: true,
    examples: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-secondary-50 border-secondary-300';
    if (score >= 80) return 'bg-secondary-50 border-secondary-300';
    if (score >= 70) return 'bg-secondary-50 border-secondary-300';
    if (score >= 60) return 'bg-secondary-100 border-secondary-300';
    return 'bg-secondary-100 border-secondary-300';
  };

  const getRatingBadgeStyle = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'excellent': return 'bg-primary-900 text-white';
      case 'very good': return 'bg-primary-800 text-white';
      case 'good': return 'bg-secondary-700 text-white';
      case 'fair': return 'bg-secondary-600 text-white';
      case 'needs improvement': return 'bg-secondary-600 text-white';
      default: return 'bg-secondary-600 text-white';
    }
  };

  const categoryLabels: Record<string, string> = {
    format_ats_compatibility: 'Format & ATS Compatibility',
    keyword_match: 'Keyword Match',
    skills_relevance: 'Skills Relevance',
    experience_quality: 'Experience Quality',
    achievements_impact: 'Achievements & Impact',
    grammar_clarity: 'Grammar & Clarity',
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-secondary-200 p-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-900 mx-auto mb-4"></div>
            <p className="text-secondary-600 font-medium">Analyzing your resume...</p>
            <p className="text-sm text-secondary-500 mt-2">Evaluating 6 ATS parameters</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <div className={`rounded-2xl border-2 p-8 ${getScoreBgColor(score)}`}>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-secondary-900">ATS Evaluation Report</h2>
            <div className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide ${getRatingBadgeStyle(rating)}`}>
              {rating}
            </div>
          </div>
          <p className="text-sm text-secondary-600 mt-2">
            {job_description_provided ? 'Job Description Match Analysis' : 'General ATS Compatibility Assessment'}
          </p>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex-shrink-0 text-center">
            <div className={`text-7xl font-bold ${getScoreColor(score)}`}>
              {Math.round(score)}
            </div>
            <div className="text-sm text-secondary-600 font-medium mt-2">/ 100</div>
          </div>

          <div className="flex-1">
            <p className="text-secondary-700 leading-relaxed">
              {score >= 90 && 'Outstanding performance. Your resume demonstrates exceptional ATS compatibility and will likely pass most automated screening systems.'}
              {score >= 80 && score < 90 && 'Very strong resume with excellent ATS compatibility. Minor refinements could achieve optimal results.'}
              {score >= 70 && score < 80 && 'Solid foundation with good ATS compatibility. Strategic improvements in key areas will significantly enhance performance.'}
              {score >= 60 && score < 70 && 'Acceptable baseline. Focus on addressing the identified weaknesses to improve screening success rate.'}
              {score < 60 && 'Requires improvement. Implement the recommendations below to achieve ATS compatibility standards.'}
            </p>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="bg-white rounded-xl border border-secondary-200">
        <button
          onClick={() => toggleSection('breakdown')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary-50 transition-colors rounded-t-xl"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-primary-900" />
            <h3 className="text-lg font-semibold text-secondary-900">Detailed Score Breakdown</h3>
          </div>
          {expandedSections.breakdown ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>

        {expandedSections.breakdown && (
          <div className="p-6 border-t border-secondary-200">
            <div className="grid gap-4">
              {Object.entries(breakdown).map(([key, data]) => (
                <div key={key} className="bg-secondary-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-secondary-900">
                      {categoryLabels[key] || key}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xl font-bold ${getScoreColor(data.percentage)}`}>
                        {data.score.toFixed(1)}
                      </span>
                      <span className="text-sm text-secondary-600">/ {data.max_score}</span>
                      <span className={`text-sm font-medium px-2 py-1 rounded ${
                        data.percentage >= 80 ? 'bg-secondary-200 text-secondary-800' :
                        data.percentage >= 60 ? 'bg-secondary-100 text-secondary-700' :
                        'bg-secondary-100 text-secondary-700'
                      }`}>
                        {data.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-secondary-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-700 ${
                        data.percentage >= 80 ? 'bg-primary-900' :
                        data.percentage >= 60 ? 'bg-primary-700' :
                        'bg-secondary-600'
                      }`}
                      style={{ width: `${data.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="bg-white rounded-xl border border-secondary-300">
          <button
            onClick={() => toggleSection('strengths')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary-100 transition-colors rounded-t-xl"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-primary-900" />
              <h3 className="text-lg font-semibold text-secondary-900">Resume Strengths ({strengths.length})</h3>
            </div>
            {expandedSections.strengths ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>

          {expandedSections.strengths && (
            <div className="p-6 bg-secondary-50 border-t border-secondary-300 rounded-b-xl">
              <ul className="grid md:grid-cols-2 gap-3">
                {strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-secondary-900">
                    <CheckCircle className="h-4 w-4 text-primary-900 mt-0.5 flex-shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Weaknesses */}
      {weaknesses.length > 0 && (
        <div className="bg-white rounded-xl border border-secondary-300">
          <button
            onClick={() => toggleSection('weaknesses')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary-100 transition-colors rounded-t-xl"
          >
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-secondary-700" />
              <h3 className="text-lg font-semibold text-secondary-900">Areas to Improve ({weaknesses.length})</h3>
            </div>
            {expandedSections.weaknesses ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>

          {expandedSections.weaknesses && (
            <div className="p-6 bg-secondary-50 border-t border-secondary-300 rounded-b-xl">
              <ul className="grid md:grid-cols-2 gap-3">
                {weaknesses.map((weakness, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-secondary-900">
                    <XCircle className="h-4 w-4 text-secondary-700 mt-0.5 flex-shrink-0" />
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Missing Keywords */}
      {missing_keywords.length > 0 && (
        <div className="bg-white rounded-xl border border-secondary-300">
          <button
            onClick={() => toggleSection('keywords')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary-100 transition-colors rounded-t-xl"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-secondary-700" />
              <h3 className="text-lg font-semibold text-secondary-900">
                Missing Keywords ({missing_keywords.length})
              </h3>
            </div>
            {expandedSections.keywords ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>

          {expandedSections.keywords && (
            <div className="p-6 bg-secondary-50 border-t border-secondary-300 rounded-b-xl">
              <p className="text-sm text-orange-800 mb-4">
                These keywords from the job description are missing from your resume. Consider adding relevant ones:
              </p>
              <div className="flex flex-wrap gap-2">
                {missing_keywords.map((keyword, idx) => (
                  <span key={idx} className="px-3 py-1 bg-white border border-orange-300 text-orange-900 rounded-full text-sm font-medium">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-xl border border-blue-200">
          <button
            onClick={() => toggleSection('recommendations')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary-100 transition-colors rounded-t-xl"
          >
            <div className="flex items-center gap-3">
              <Lightbulb className="h-5 w-5 text-secondary-700" />
              <h3 className="text-lg font-semibold text-secondary-900">
                Actionable Recommendations ({recommendations.length})
              </h3>
            </div>
            {expandedSections.recommendations ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>

          {expandedSections.recommendations && (
            <div className="p-6 bg-secondary-50 border-t border-secondary-300 rounded-b-xl">
              <ul className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-secondary-900">
                    <span className="flex-shrink-0 w-7 h-7 bg-primary-900 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed pt-1">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Improved Bullet Examples */}
      {improved_bullets.length > 0 && (
        <div className="bg-white rounded-xl border border-secondary-300">
          <button
            onClick={() => toggleSection('examples')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary-100 transition-colors rounded-t-xl"
          >
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-secondary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <h3 className="text-lg font-semibold text-secondary-900">
                Improved Bullet Point Examples ({improved_bullets.length})
              </h3>
            </div>
            {expandedSections.examples ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>

          {expandedSections.examples && (
            <div className="p-6 bg-secondary-50 border-t border-secondary-300 rounded-b-xl space-y-4">
              {improved_bullets.map((bullet, idx) => (
                <div key={idx} className="bg-white border border-secondary-200 rounded-lg p-4">
                  <div className="mb-3">
                    <span className="text-xs font-semibold text-purple-700 uppercase">Original</span>
                    <p className="text-sm text-secondary-700 mt-1 italic">{bullet.original}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-green-700 uppercase">Suggestion</span>
                    <p className="text-sm text-secondary-900 mt-1 font-medium">{bullet.suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
