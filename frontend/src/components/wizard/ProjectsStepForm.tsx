import { Plus, Trash2, Folder } from 'lucide-react'
import { AIEnhancedTextarea } from '../ui/ai-enhanced-textarea'

interface ProjectEntry {
  id: string
  name: string
  technologies: string
  startDate: string
  endDate: string
  description: string
  url: string
}

interface ProjectsStepFormProps {
  data: ProjectEntry[]
  onChange: (data: ProjectEntry[]) => void
}

export default function ProjectsStepForm({ data, onChange }: ProjectsStepFormProps) {
  const addProject = () => {
    const newEntry: ProjectEntry = {
      id: Date.now().toString(),
      name: '',
      technologies: '',
      startDate: '',
      endDate: '',
      description: '',
      url: '',
    }
    onChange([...data, newEntry])
  }

  const updateProject = (id: string, field: keyof ProjectEntry, value: string) => {
    onChange(data.map((proj) => (proj.id === id ? { ...proj, [field]: value } : proj)))
  }

  const removeProject = (id: string) => {
    onChange(data.filter((proj) => proj.id !== id))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">Projects</h2>
        <p className="text-secondary-600 dark:text-secondary-400">
          Showcase your personal or professional projects. This is optional but can strengthen your
          resume.
        </p>
      </div>

      {data.length === 0 ? (
        <div className="bg-secondary-50 dark:bg-secondary-900 border-2 border-dashed border-secondary-300 dark:border-secondary-700 rounded-lg p-12 text-center">
          <Folder className="h-12 w-12 text-secondary-400 dark:text-secondary-500 mx-auto mb-4" />
          <p className="text-secondary-600 dark:text-secondary-400 mb-4">No projects added yet</p>
          <button onClick={addProject} className="btn-primary flex items-center gap-2 mx-auto">
            <Plus className="h-4 w-4" />
            Add Project
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {data.map((project, index) => (
            <div
              key={project.id || `proj-${index}`}
              className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-lg p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-secondary-900 dark:text-white">Project #{index + 1}</h3>
                <button
                  onClick={() => removeProject(project.id)}
                  className="text-danger-600 hover:text-danger-700 dark:text-red-400 dark:hover:text-red-300 p-2 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Project Name */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Project Name <span className="text-danger-600 dark:text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={project.name}
                    onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                    placeholder="E-commerce Platform"
                    className="w-full px-4 py-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-secondary-950 text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-secondary-600"
                    required
                  />
                </div>

                {/* Technologies */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Technologies Used
                  </label>
                  <input
                    type="text"
                    value={project.technologies}
                    onChange={(e) => updateProject(project.id, 'technologies', e.target.value)}
                    placeholder="React, Node.js, MongoDB"
                    className="w-full px-4 py-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-secondary-950 text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-secondary-600"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="month"
                    value={project.startDate}
                    onChange={(e) => updateProject(project.id, 'startDate', e.target.value)}
                    className="w-full px-4 py-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-secondary-950 text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-secondary-600"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    End Date (or leave blank if ongoing)
                  </label>
                  <input
                    type="month"
                    value={project.endDate}
                    onChange={(e) => updateProject(project.id, 'endDate', e.target.value)}
                    className="w-full px-4 py-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-secondary-950 text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-secondary-600"
                  />
                </div>

                {/* Project URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Project URL (GitHub, Live Demo, etc.)
                  </label>
                  <input
                    type="url"
                    value={project.url}
                    onChange={(e) => updateProject(project.id, 'url', e.target.value)}
                    placeholder="https://github.com/username/project"
                    className="w-full px-4 py-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-secondary-950 text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-secondary-600"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Description & Key Features
                  </label>
                  <AIEnhancedTextarea
                    value={project.description}
                    onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                    context="project_description"
                    placeholder="• Built a full-stack e-commerce platform with payment integration&#10;• Implemented real-time inventory tracking&#10;• Served 10,000+ monthly active users"
                    rows={6}
                    className="font-mono"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addProject}
            className="w-full border-2 border-dashed border-secondary-300 dark:border-secondary-700 rounded-lg p-4 text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white hover:border-secondary-400 dark:hover:border-secondary-500 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Another Project
          </button>
        </div>
      )}

      <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
        <p className="text-sm text-primary-800 dark:text-primary-300">
          <strong>Pro Tip:</strong> Projects are great for showcasing skills you haven't used in
          your job experience yet!
        </p>
      </div>

      <button
        onClick={() => onChange([])}
        className="text-sm text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white transition-colors"
      >
        Skip this step (Projects are optional)
      </button>
    </div>
  )
}
