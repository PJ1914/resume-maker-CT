import { Check } from 'lucide-react'

export interface WizardStep {
  id: number
  title: string
  description: string
}

interface WizardProgressProps {
  steps: WizardStep[]
  currentStep: number
}

export default function WizardProgress({ steps, currentStep }: WizardProgressProps) {
  return (
    <div className="px-4 py-2">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-1">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center gap-2 flex-1">
                  {/* Step Circle */}
                  <div
                    className={`
                      flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px]
                      transition-all duration-300
                      ${
                        isCompleted
                          ? 'bg-success-600 text-white'
                          : isCurrent
                          ? 'bg-primary-900 text-white ring-2 ring-primary-900/30'
                          : 'bg-secondary-600 text-secondary-400'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-[10px] font-semibold truncate transition-colors ${
                        isCurrent
                          ? 'text-white'
                          : isCompleted
                          ? 'text-success-400'
                          : 'text-secondary-500'
                      }`}
                    >
                      {step.title}
                    </div>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="h-px w-8 mx-1">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isCompleted ? 'bg-success-600' : 'bg-secondary-600'
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
