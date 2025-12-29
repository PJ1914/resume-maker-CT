import { User, Mail, Phone, MapPin, Linkedin, Globe, Github, Code2, Trophy, AlertCircle } from 'lucide-react'
import { InfoTooltip } from '../ui/info-tooltip'
import { useState } from 'react'

interface ContactData {
  name: string
  email: string
  phone: string
  location: string
  linkedin: string
  github: string
  leetcode: string
  codechef: string
  hackerrank: string
  website: string
}

interface ContactStepFormProps {
  data: ContactData
  onChange: (data: ContactData) => void
}

// Validation helpers
const validateName = (name: string): string | null => {
  if (!name.trim()) return null; // Empty is okay, required check happens elsewhere
  // Allow letters (including Unicode letters for international names), spaces, hyphens, and apostrophes
  const nameRegex = /^[\p{L}\s\-'\.]+$/u;
  if (!nameRegex.test(name)) {
    return 'Name can only contain letters, spaces, hyphens, and apostrophes';
  }
  return null;
};

const validatePhone = (phone: string): string | null => {
  if (!phone.trim()) return null; // Empty is okay
  // Allow digits, +, -, spaces, parentheses
  const phoneRegex = /^[\d\s\+\-\(\)]+$/;
  if (!phoneRegex.test(phone)) {
    return 'Phone number can only contain digits, +, -, spaces, and parentheses';
  }
  // Check minimum length (at least 7 digits)
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 7) {
    return 'Phone number must have at least 7 digits';
  }
  if (digitsOnly.length > 15) {
    return 'Phone number is too long';
  }
  return null;
};

export default function ContactStepForm({ data, onChange }: ContactStepFormProps) {
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const handleChange = (field: keyof ContactData, value: string) => {
    // Validate on change
    if (field === 'name') {
      const error = validateName(value);
      setErrors(prev => ({ ...prev, name: error || undefined }));
    } else if (field === 'phone') {
      const error = validatePhone(value);
      setErrors(prev => ({ ...prev, phone: error || undefined }));
    }
    onChange({ ...data, [field]: value })
  }

  // Filter name input to only allow valid characters
  const handleNameChange = (value: string) => {
    // Remove emojis, numbers, and special characters (except allowed ones)
    const filteredValue = value.replace(/[^\p{L}\s\-'\.]/gu, '');
    handleChange('name', filteredValue);
  }

  // Filter phone input to only allow valid characters
  const handlePhoneChange = (value: string) => {
    // Remove anything that's not a digit, +, -, space, or parentheses
    const filteredValue = value.replace(/[^\d\s\+\-\(\)]/g, '');
    handleChange('phone', filteredValue);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">Contact Information</h2>
        <p className="text-secondary-600 dark:text-secondary-400">
          Let's start with your basic contact details. This information will appear at the top of
          your resume.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Full Name <span className="text-danger-600 dark:text-danger-400">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="text"
              value={data.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="John Doe"
              className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-secondary-800 border ${errors.name ? 'border-danger-500 dark:border-danger-400' : 'border-secondary-300 dark:border-secondary-700'} rounded-lg text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-secondary-500 focus:outline-none focus:ring-2 ${errors.name ? 'focus:ring-danger-500' : 'focus:ring-primary-500'} focus:border-transparent`}
              required
            />
          </div>
          {errors.name && (
            <p className="mt-1.5 text-sm text-danger-600 dark:text-danger-400 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Email Address <span className="text-danger-600 dark:text-danger-400">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="email"
              value={data.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="john.doe@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="flex items-center text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Phone Number
            <InfoTooltip content="Include your country code if applying internationally (e.g., +1 for USA)." />
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-secondary-800 border ${errors.phone ? 'border-danger-500 dark:border-danger-400' : 'border-secondary-300 dark:border-secondary-700'} rounded-lg text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-secondary-500 focus:outline-none focus:ring-2 ${errors.phone ? 'focus:ring-danger-500' : 'focus:ring-primary-500'} focus:border-transparent`}
            />
          </div>
          {errors.phone && (
            <p className="mt-1.5 text-sm text-danger-600 dark:text-danger-400 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.phone}
            </p>
          )}
        </div>

        {/* Location */}
        <div className="md:col-span-2">
          <label className="flex items-center text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Location
            <InfoTooltip content="City and State/Country is usually sufficient. Full address is rarely needed nowadays." />
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="text"
              value={data.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="San Francisco, CA"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* LinkedIn */}
        <div>
          <label className="flex items-center text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            LinkedIn Profile
            <InfoTooltip content="Customize your public profile URL (e.g., linkedin.com/in/yourname) for a cleaner look." />
          </label>
          <div className="relative">
            <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="url"
              value={data.linkedin}
              onChange={(e) => handleChange('linkedin', e.target.value)}
              placeholder="linkedin.com/in/johndoe"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* GitHub */}
        <div>
          <label className="flex items-center text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            GitHub Profile
            <InfoTooltip content="Your GitHub username or profile URL (e.g., github.com/username)" />
          </label>
          <div className="relative">
            <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="url"
              value={data.github}
              onChange={(e) => handleChange('github', e.target.value)}
              placeholder="github.com/johndoe"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* LeetCode */}
        <div>
          <label className="flex items-center text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            LeetCode Profile
            <InfoTooltip content="Your LeetCode profile URL (e.g., leetcode.com/u/username)" />
          </label>
          <div className="relative">
            <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="url"
              value={data.leetcode}
              onChange={(e) => handleChange('leetcode', e.target.value)}
              placeholder="leetcode.com/u/johndoe"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* CodeChef */}
        <div>
          <label className="flex items-center text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            CodeChef Profile
            <InfoTooltip content="Your CodeChef profile URL (e.g., codechef.com/users/username)" />
          </label>
          <div className="relative">
            <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="url"
              value={data.codechef}
              onChange={(e) => handleChange('codechef', e.target.value)}
              placeholder="codechef.com/users/johndoe"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* HackerRank */}
        <div>
          <label className="flex items-center text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            HackerRank Profile
            <InfoTooltip content="Your HackerRank profile URL (e.g., hackerrank.com/username)" />
          </label>
          <div className="relative">
            <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="url"
              value={data.hackerrank}
              onChange={(e) => handleChange('hackerrank', e.target.value)}
              placeholder="hackerrank.com/johndoe"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Website */}
        <div>
          <label className="flex items-center text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Personal Website
            <InfoTooltip content="Link to your portfolio or personal blog if relevant to the job." />
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="url"
              value={data.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="johndoe.com"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
        <p className="text-sm text-primary-800 dark:text-primary-300">
          <strong>Pro Tip:</strong> Make sure your email looks professional. Avoid nicknames or
          numbers from high school!
        </p>
      </div>
    </div>
  )
}
