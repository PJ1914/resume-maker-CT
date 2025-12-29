/**
 * Contact Information Section Component
 */

import React, { useState } from 'react';
import { ContactInfo } from '../../types/resume';
import { AlertCircle, Locate, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Validation helpers
const validateName = (name: string): string | null => {
  if (!name.trim()) return null;
  const nameRegex = /^[\p{L}\s\-'\.]+$/u;
  if (!nameRegex.test(name)) {
    return 'Name can only contain letters, spaces, hyphens, and apostrophes';
  }
  return null;
};

const validatePhone = (phone: string): string | null => {
  if (!phone.trim()) return null;
  const phoneRegex = /^[\d\s\+\-\(\)]+$/;
  if (!phoneRegex.test(phone)) {
    return 'Phone number can only contain digits, +, -, spaces, and parentheses';
  }
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 7) {
    return 'Phone number must have at least 7 digits';
  }
  if (digitsOnly.length > 15) {
    return 'Phone number is too long';
  }
  return null;
};

interface ContactSectionProps {
  contact: ContactInfo;
  onChange: (contact: ContactInfo) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  contact,
  onChange,
}) => {
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string }>({});

  const handleChange = (field: keyof ContactInfo, value: string) => {
    onChange({ ...contact, [field]: value });
  };

  // Filter name input to only allow valid characters
  const handleNameChange = (value: string) => {
    const filteredValue = value.replace(/[^\p{L}\s\-'\.]/gu, '');
    const error = validateName(filteredValue);
    setErrors(prev => ({ ...prev, fullName: error || undefined }));
    handleChange('fullName', filteredValue);
  };

  // Filter phone input to only allow valid characters
  const handlePhoneChange = (value: string) => {
    const filteredValue = value.replace(/[^\d\s\+\-\(\)]/g, '');
    const error = validatePhone(filteredValue);
    setErrors(prev => ({ ...prev, phone: error || undefined }));
    handleChange('phone', filteredValue);
  };

  // GPS Location Detection
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
            { headers: { 'Accept-Language': 'en' } }
          );

          if (!response.ok) throw new Error('Failed to get location');

          const data = await response.json();
          const address = data.address;
          const city = address.city || address.town || address.village || address.municipality || '';
          const state = address.state || address.region || '';
          const country = address.country || '';

          // Format: City, State, Country
          const parts = [city, state, country].filter(part => part.trim() !== '');
          const locationString = parts.join(', ') || 'Location detected';

          handleChange('location', locationString);
          toast.success(`Location detected: ${locationString}`);
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          toast.error('Could not determine your city. Please enter manually.');
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        setIsDetectingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Location permission denied. Please allow location access.');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Location information unavailable.');
            break;
          case error.TIMEOUT:
            toast.error('Location request timed out.');
            break;
          default:
            toast.error('An error occurred while detecting location.');
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
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
            className={`input ${errors.fullName ? 'border-danger-500 dark:border-danger-400 focus:ring-danger-500' : ''}`}
            value={contact.fullName || ''}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="John Doe"
            required
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-danger-600 dark:text-danger-400 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.fullName}
            </p>
          )}
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
            className={`input ${errors.phone ? 'border-danger-500 dark:border-danger-400 focus:ring-danger-500' : ''}`}
            value={contact.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="+1 (555) 123-4567"
            required
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-danger-600 dark:text-danger-400 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.phone}
            </p>
          )}
        </div>

        {/* Location */}
        <div className="md:col-span-2">
          <label className="label">Location</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="input flex-1"
              value={contact.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="San Francisco, CA"
            />
            <button
              type="button"
              onClick={detectLocation}
              disabled={isDetectingLocation}
              className="flex items-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white text-sm font-medium rounded-lg transition-colors"
              title="Detect my location"
            >
              {isDetectingLocation ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Locate className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{isDetectingLocation ? 'Detecting...' : 'Detect'}</span>
            </button>
          </div>
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
