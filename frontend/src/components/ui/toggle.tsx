"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const MinimalToggle = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <label className="relative inline-block h-[1.8em] w-[3.7em] text-[17px]">
        <input
          type="checkbox"
          ref={ref}
          className={cn(
            "group h-0 w-0",
            "[&:checked+span:before]:translate-x-[1.9em]",
            "[&:checked+span:before]:bg-primary-700",
            "dark:[&:checked+span:before]:bg-primary-500",
            "[&:checked+span]:bg-primary-200",
            "dark:[&:checked+span]:bg-primary-900",
            className
          )}
          {...props}
        />
        <span className={cn(
          "absolute inset-0 cursor-pointer rounded-[30px] bg-secondary-300 transition ease-in-out",
          "before:absolute before:bottom-[0.2em] before:left-[0.2em] before:h-[1.4em] before:w-[1.4em]",
          "before:rounded-[20px] before:bg-secondary-400 before:transition before:duration-300 before:content-['']",
          "dark:bg-secondary-700 dark:before:bg-secondary-400"
        )} />
      </label>
    )
  }
)
MinimalToggle.displayName = "MinimalToggle"

const ScorerToggle = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    leftLabel?: string
    rightLabel?: string
    leftSubLabel?: string
    rightSubLabel?: string
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
  }
>(({ className, leftLabel = "Local", rightLabel = "AI", leftSubLabel, rightSubLabel, checked = false, onChange, onCheckedChange, ...props }, ref) => {
  
  // Unified handler to update the toggle state
  const setToggleValue = (newChecked: boolean) => {
    console.log('[ScorerToggle] Setting value to:', newChecked)
    
    // Call onCheckedChange first (the primary handler)
    if (onCheckedChange) {
      onCheckedChange(newChecked)
    }
    
    // Also trigger onChange with synthetic event for compatibility
    if (onChange) {
      const syntheticEvent = {
        target: { checked: newChecked },
        currentTarget: { checked: newChecked },
      } as React.ChangeEvent<HTMLInputElement>
      onChange(syntheticEvent)
    }
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[ScorerToggle] Input change:', e.target.checked)
    setToggleValue(e.target.checked)
  }
  
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => {
          console.log('[ScorerToggle] Local button clicked')
          setToggleValue(false)
        }}
        className={cn(
          "text-xs font-medium transition-colors px-2 py-1 rounded flex flex-col items-center",
          !checked 
            ? "text-secondary-900 dark:text-secondary-100 bg-secondary-200 dark:bg-secondary-700" 
            : "text-secondary-400 dark:text-secondary-500 hover:text-secondary-600"
        )}
      >
        <span>{leftLabel}</span>
        {leftSubLabel && <span className="text-[10px] opacity-70">{leftSubLabel}</span>}
      </button>
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={handleInputChange}
          className={cn("peer sr-only", className)}
          {...props}
        />
        <div 
          className={cn(
            "h-6 w-11 rounded-full transition-colors",
            checked ? "bg-primary-600 dark:bg-primary-700" : "bg-secondary-300 dark:bg-secondary-600",
            "after:absolute after:top-[2px]",
            "after:h-5 after:w-5 after:rounded-full after:bg-white",
            "after:shadow-sm after:transition-transform after:content-['']",
            checked ? "after:left-[22px]" : "after:left-[2px]",
            "dark:after:bg-secondary-100"
          )} 
        />
      </label>
      <button
        type="button"
        onClick={() => {
          console.log('[ScorerToggle] AI button clicked')
          setToggleValue(true)
        }}
        className={cn(
          "text-xs font-medium transition-colors px-2 py-1 rounded flex flex-col items-center",
          checked 
            ? "text-primary-700 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/30" 
            : "text-secondary-400 dark:text-secondary-500 hover:text-secondary-600"
        )}
      >
        <span>{rightLabel}</span>
        {rightSubLabel && <span className="text-[10px] opacity-70">{rightSubLabel}</span>}
      </button>
    </div>
  )
})
ScorerToggle.displayName = "ScorerToggle"

export { MinimalToggle, ScorerToggle }
