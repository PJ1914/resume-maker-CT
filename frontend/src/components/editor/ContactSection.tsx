/**
 * Contact Information Section Component
 */

import React from 'react';
import { ContactInfo } from '../../types/resume';

interface ContactSectionProps {
  contact: ContactInfo;
  onChange: (contact: ContactInfo) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  contact,
  onChange,
}) => {
  const handleChange = (field: keyof ContactInfo, value: string) => {
    onChange({ ...contact, [field]: value });
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
        Contact Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="md:col-span-2">
          <label className="label">Full Name *</label>
          <input
            type="text"
            className="input"
            value={contact.fullName || ''}
            onChange={(e) => handleChange('fullName', e.target.value)}
            placeholder="John Doe"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="label">Email *</label>
          <input
            type="email"
            className="input"
            value={contact.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="john@example.com"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="label">Phone *</label>
          <input
            type="tel"
            className="input"
            value={contact.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            required
          />
        </div>

        {/* Location */}
        <div className="md:col-span-2">
          <label className="label">Location</label>
          <input
            type="text"
            className="input"
            value={contact.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="San Francisco, CA"
          />
        </div>

        {/* LinkedIn */}
        <div>
          <label className="label">LinkedIn</label>
          <input
            type="url"
            className="input"
            value={contact.linkedin || ''}
            onChange={(e) => handleChange('linkedin', e.target.value)}
            placeholder="linkedin.com/in/johndoe"
          />
        </div>

        {/* GitHub */}
        <div>
          <label className="label">GitHub</label>
          <input
            type="url"
            className="input"
            value={contact.github || ''}
            onChange={(e) => handleChange('github', e.target.value)}
            placeholder="github.com/johndoe"
          />
        </div>

        {/* LeetCode */}
        <div>
          <label className="label">LeetCode</label>
          <input
            type="url"
            className="input"
            value={contact.leetcode || ''}
            onChange={(e) => handleChange('leetcode', e.target.value)}
            placeholder="leetcode.com/u/johndoe"
          />
        </div>

        {/* CodeChef */}
        <div>
          <label className="label">CodeChef</label>
          <input
            type="url"
            className="input"
            value={contact.codechef || ''}
            onChange={(e) => handleChange('codechef', e.target.value)}
            placeholder="codechef.com/users/johndoe"
          />
        </div>

        {/* HackerRank */}
        <div>
          <label className="label">HackerRank</label>
          <input
            type="url"
            className="input"
            value={contact.hackerrank || ''}
            onChange={(e) => handleChange('hackerrank', e.target.value)}
            placeholder="hackerrank.com/johndoe"
          />
        </div>

        {/* Portfolio */}
        <div className="md:col-span-2">
          <label className="label">Portfolio/Website</label>
          <input
            type="url"
            className="input"
            value={contact.portfolio || ''}
            onChange={(e) => handleChange('portfolio', e.target.value)}
            placeholder="https://johndoe.com"
          />
        </div>
      </div>
    </div>
  );
};
