import { User, Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react'

interface ContactData {
  name: string
  email: string
  phone: string
  location: string
  linkedin: string
  website: string
}

interface ContactStepFormProps {
  data: ContactData
  onChange: (data: ContactData) => void
}

export default function ContactStepForm({ data, onChange }: ContactStepFormProps) {
  const handleChange = (field: keyof ContactData, value: string) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Contact Information</h2>
        <p className="text-secondary-600">
          Let's start with your basic contact details. This information will appear at the top of
          your resume.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Full Name <span className="text-danger-600">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="text"
              value={data.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="John Doe"
              className="w-full pl-10 pr-4 py-2.5 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Email Address <span className="text-danger-600">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="email"
              value={data.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="john.doe@example.com"
              className="w-full pl-10 pr-4 py-2.5 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full pl-10 pr-4 py-2.5 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Location */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-secondary-700 mb-2">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="text"
              value={data.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="San Francisco, CA"
              className="w-full pl-10 pr-4 py-2.5 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* LinkedIn */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            LinkedIn Profile
          </label>
          <div className="relative">
            <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="url"
              value={data.linkedin}
              onChange={(e) => handleChange('linkedin', e.target.value)}
              placeholder="linkedin.com/in/johndoe"
              className="w-full pl-10 pr-4 py-2.5 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Personal Website
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="url"
              value={data.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="johndoe.com"
              className="w-full pl-10 pr-4 py-2.5 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <p className="text-sm text-primary-800">
          <strong>Pro Tip:</strong> Make sure your email looks professional. Avoid nicknames or
          numbers from high school!
        </p>
      </div>
    </div>
  )
}
