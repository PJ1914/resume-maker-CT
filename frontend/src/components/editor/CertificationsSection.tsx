/**
 * Certifications Section Component
 */

import React from 'react';
import { Certification, createEmptyCertification } from '../../types/resume';

interface CertificationsSectionProps {
  certifications: Certification[];
  onChange: (certifications: Certification[]) => void;
}

export const CertificationsSection: React.FC<CertificationsSectionProps> = ({
  certifications,
  onChange,
}) => {
  const addCertification = () => {
    onChange([...certifications, createEmptyCertification()]);
  };

  const updateCertification = (index: number, updates: Partial<Certification>) => {
    const newCerts = [...certifications];
    newCerts[index] = { ...newCerts[index], ...updates };
    onChange(newCerts);
  };

  const removeCertification = (index: number) => {
    onChange(certifications.filter((_, i) => i !== index));
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-secondary-900">Certifications</h2>
        <button onClick={addCertification} className="btn-primary text-sm">
          + Add Certification
        </button>
      </div>

      <div className="space-y-4">
        {certifications.map((cert, index) => (
          <div key={index} className="border border-secondary-200 rounded-lg p-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Certification Name
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
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Issuing Organization
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

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
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

              <button
                onClick={() => removeCertification(index)}
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
