import { Check } from 'lucide-react'

export interface WizardStep {
  id: number
  title: string
  description: string
}

interface WizardProgressProps {
  steps: WizardStep[]
  currentStep: number
  onStepClick?: (stepIndex: number) => void
}

export default function WizardProgress({ steps, currentStep, onStepClick }: WizardProgressProps) {
  const handleStepClick = (index: number) => {
    if (onStepClick) {
      onStepClick(index)
    }
  }

  return (
    <div className="px-4 py-2">
      <div className="w-full">
        <div className="flex items-center justify-start gap-1">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep
            const isClickable = !!onStepClick

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center gap-2 ${isClickable ? 'cursor-pointer group' : ''}`}
                  onClick={() => handleStepClick(index)}
                  role={isClickable ? 'button' : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                      handleStepClick(index)
                    }
                  }}
                >
                  {/* Step Circle */}
                  <div
                    className={`
                      flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px]
                      transition-all duration-300
                      ${isCompleted
                        ? 'bg-success-600 text-white'
                        : isCurrent
                          ? 'bg-primary-900 dark:bg-primary-600 text-white ring-2 ring-primary-900/30 dark:ring-primary-500/30'
                          : 'bg-secondary-200 dark:bg-secondary-700 text-secondary-500 dark:text-secondary-400'
                      }
                      ${isClickable ? 'group-hover:ring-2 group-hover:ring-primary-500/50 group-hover:scale-110' : ''}
                    `}
                  >
                    {isCompleted ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="min-w-0">
                    <div
                      className={`text-[10px] font-semibold truncate transition-colors ${isCurrent
                        ? 'text-primary-900 dark:text-white'
                        : isCompleted
                          ? 'text-success-600 dark:text-success-400'
                          : 'text-secondary-500 dark:text-secondary-400'
                        }
                        ${isClickable ? 'group-hover:text-primary-600 dark:group-hover:text-primary-400' : ''}
                      `}
                    >
                      {step.title}
                    </div>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="h-px w-8 mx-1">
                    <div
                      className={`h-full transition-all duration-500 ${isCompleted ? 'bg-success-600' : 'bg-secondary-200 dark:bg-secondary-700'
                        }`}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
