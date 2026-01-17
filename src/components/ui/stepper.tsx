'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

/**
 * Accessible Stepper Component
 * A11Y-01: Uses accessible text sizes (18px base)
 * A11Y-02: Step indicators meet 48px minimum touch target
 * A11Y-06: Clear visual distinction between states
 */
interface StepperProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <nav aria-label="Progress" className={cn('mb-8', className)}>
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <li key={step} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full border-2 text-lg font-semibold',
                    isCompleted && 'border-primary bg-primary text-primary-foreground',
                    isCurrent && 'border-primary text-primary',
                    !isCompleted && !isCurrent && 'border-muted-foreground text-muted-foreground'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    stepNumber
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-base font-medium text-center',
                    (isCompleted || isCurrent) ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-2 h-0.5 flex-1',
                    isCompleted ? 'bg-primary' : 'bg-muted'
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
