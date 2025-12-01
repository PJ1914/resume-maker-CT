/**
 * Certifications Section Component
 */

import React, { useState } from 'react';
import { Certification, createEmptyCertification } from '../../types/resume';

interface CertificationsSectionProps {
  certifications: Certification[];
  onChange: (certifications: Certification[]) => void;
}

export const CertificationsSection: React.FC<CertificationsSectionProps> = ({
  certifications,
  onChange,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(
    certifications.length > 0 ? 0 : null
  );

  const addCertification = () => {
    const newCert = createEmptyCertification();
    onChange([...certifications, newCert]);
    setExpandedIndex(certifications.length);
  };

  const updateCertification = (index: number, updates: Partial<Certification>) => {
    const newCerts = [...certifications];
    newCerts[index] = { ...newCerts[index], ...updates };
    onChange(newCerts);
  };

  const removeCertification = (index: number) => {
    onChange(certifications.filter((_, i) => i !== index));
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1);
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">Certifications</h2>
        <button onClick={addCertification} className="btn-primary text-sm w-full sm:w-auto">
          + Add Certification
        </button>
      </div>

      {certifications.length === 0 ? (
        <p className="text-secondary-500 dark:text-secondary-400 text-center py-4">
          No certifications added yet. Click "Add Certification" to add your professional certifications.
        </p>
      ) : (
        <div className="space-y-3">
          {certifications.map((cert, index) => (
            <div
              key={cert.id || index}
              className="border border-secondary-200 dark:border-secondary-700 rounded-lg overflow-hidden"
            >
              {/* Header - Always visible */}
              <div
                className="flex items-center justify-between p-4 bg-secondary-50 dark:bg-secondary-800/50 cursor-pointer hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                onClick={() => toggleExpand(index)}
              >
                <div className="flex-1">
                  <h3 className="font-medium text-secondary-900 dark:text-white">
                    {cert.name || 'Untitled Certification'}
                  </h3>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    {cert.issuer || 'Issuing Organization'} {cert.date && `• ${cert.date}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCertification(index);
                    }}
                    className="text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300 text-sm"
                  >
                    Remove
                  </button>
                  <span className="text-secondary-400 dark:text-secondary-500">
                    {expandedIndex === index ? '▼' : '▶'}
                  </span>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedIndex === index && (
                <div className="p-4 border-t border-secondary-200 dark:border-secondary-700 space-y-4 bg-white dark:bg-secondary-900">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">
                        Certification Name *
                      </label>
                      <input
                        type="text"
                        className="input w-full"
                        value={cert.name}
                        onChange={(e) =>
                          updateCertification(index, { name: e.target.value })
                        }
                        placeholder="e.g., AWS Certified Solutions Architect"
                      />
                    </div>

                    <div>
                      <label className="label">
                        Issuing Organization *
                      </label>
                      <input
                        type="text"
                        className="input w-full"
                        value={cert.issuer}
                        onChange={(e) =>
                          updateCertification(index, { issuer: e.target.value })
                        }
                        placeholder="e.g., Amazon Web Services"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">
                        Date Issued
                      </label>
                      <input
                        type="text"
                        className="input w-full"
                        value={cert.date}
                        onChange={(e) =>
                          updateCertification(index, { date: e.target.value })
                        }
                        placeholder="e.g., Jan 2024"
                      />
                    </div>

                    <div>
                      <label className="label">
                        Credential ID
                      </label>
                      <input
                        type="text"
                        className="input w-full"
                        value={cert.credentialId || ''}
                        onChange={(e) =>
                          updateCertification(index, { credentialId: e.target.value })
                        }
                        placeholder="e.g., ABC123XYZ"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">
                      Credential URL
                    </label>
                    <input
                      type="url"
                      className="input w-full"
                      value={cert.url || ''}
                      onChange={(e) =>
                        updateCertification(index, { url: e.target.value })
                      }
                      placeholder="e.g., https://www.credly.com/badges/..."
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
