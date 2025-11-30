/**
 * Template Selector Component
 * Visual cards for selecting LaTeX resume templates
 */

export type TemplateType = 'modern' | 'classic' | 'minimalist';

interface TemplateSelectorProps {
  selectedTemplate: TemplateType;
  onSelect: (template: TemplateType) => void;
}

const templates = [
  {
    id: 'modern' as TemplateType,
    name: 'Modern',
    description: 'Clean design with color accents and visual hierarchy. ATS-friendly.',
    features: ['Color accents', 'Professional header', 'Clear sections', 'Modern typography'],
    icon: '🎨',
  },
  {
    id: 'classic' as TemplateType,
    name: 'Classic',
    description: 'Traditional professional format with simple, conservative styling.',
    features: ['Timeless design', 'Black & white', 'Serif font', 'Business formal'],
    icon: '📄',
  },
  {
    id: 'minimalist' as TemplateType,
    name: 'Minimalist',
    description: 'Clean, spacious layout with subtle accents and breathing room.',
    features: ['Extra whitespace', 'Subtle styling', 'Sans-serif', 'Clean typography'],
    icon: '✨',
  },
];

export default function TemplateSelector({
  selectedTemplate,
  onSelect,
}: TemplateSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className={`
              relative p-6 rounded-lg border-2 text-left transition-all
              dark:bg-secondary-800
              ${selectedTemplate === template.id
                ? 'border-secondary-300 bg-secondary-50 dark:bg-secondary-700 dark:border-secondary-500 shadow-lg'
                : 'border-gray-200 dark:border-secondary-700 hover:border-gray-300 dark:hover:border-secondary-600 hover:shadow-md'
              }
            `}
          >
            {/* Selection indicator */}
            {selectedTemplate === template.id && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}

            {/* Icon */}
            <div className="text-4xl mb-3">{template.icon}</div>

            {/* Template name */}
            <h3 className="text-lg font-semibold text-secondary-700 dark:text-white mb-2">
              {template.name}
            </h3>

            {/* Description */}
            <p className="text-sm text-secondary-700 dark:text-secondary-300 mb-4">{template.description}</p>

            {/* Features */}
            <ul className="space-y-1">
              {template.features.map((feature, idx) => (
                <li key={idx} className="text-xs text-secondary-700 dark:text-secondary-400 flex items-center">
                  <svg
                    className="w-3 h-3 mr-2 text-success-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>
    </div>
  );
}
