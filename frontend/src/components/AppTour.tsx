import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useTour } from '../context/TourContext'
import { ArrowRight, ArrowLeft, X, MapPin } from 'lucide-react'

export default function AppTour() {
    const { isOpen, currentStepIndex, steps, nextStep, prevStep, endTour } = useTour()
    const currentStep = steps[currentStepIndex]

    if (!isOpen) return null

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={() => { }}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="w-full sm:max-w-md transform overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white dark:bg-secondary-900 p-6 text-left align-middle shadow-xl transition-all border-t sm:border border-secondary-200 dark:border-secondary-800 relative">

                                {/* Progress Bar */}
                                <div className="absolute top-0 left-0 right-0 h-1.5 bg-secondary-100 dark:bg-secondary-800">
                                    <div
                                        className="h-full bg-primary-600 transition-all duration-300 ease-out"
                                        style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                                    />
                                </div>

                                {/* Close Button */}
                                <button
                                    onClick={endTour}
                                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-800 text-secondary-400 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                {/* Content */}
                                <div className="mt-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                                            <MapPin className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <span className="text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                            Step {currentStepIndex + 1} of {steps.length}
                                        </span>
                                    </div>

                                    <Dialog.Title
                                        as="h3"
                                        className="text-xl font-bold leading-6 text-secondary-900 dark:text-white mb-2"
                                    >
                                        {currentStep.title}
                                    </Dialog.Title>

                                    <p className="text-secondary-600 dark:text-secondary-300 text-sm leading-relaxed mb-6">
                                        {currentStep.description}
                                    </p>

                                    {/* Navigation Buttons */}
                                    <div className="flex items-center justify-between mt-6">
                                        <button
                                            onClick={prevStep}
                                            disabled={currentStepIndex === 0}
                                            className={`flex items-center text-sm font-medium transition-colors ${currentStepIndex === 0
                                                ? 'text-secondary-300 cursor-not-allowed'
                                                : 'text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-white'
                                                }`}
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-1" />
                                            Back
                                        </button>

                                        <button
                                            onClick={nextStep}
                                            className="inline-flex justify-center items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-colors"
                                        >
                                            {currentStepIndex === steps.length - 1 ? 'Finish Tour' : 'Next'}
                                            <ArrowRight className="ml-2 w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
