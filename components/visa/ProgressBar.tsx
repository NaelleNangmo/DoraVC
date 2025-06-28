'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  steps: Array<{
    id: number;
    title: string;
    progress: number;
  }>;
}

export function ProgressBar({ currentStep, totalSteps, steps }: ProgressBarProps) {
  const overallProgress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full space-y-6">
      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Progression générale</h3>
          <span className="text-sm text-muted-foreground">{Math.round(overallProgress)}%</span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center space-y-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{
                scale: index + 1 <= currentStep ? 1.1 : 1,
                opacity: index + 1 <= currentStep ? 1 : 0.5,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`relative w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                index + 1 < currentStep
                  ? 'bg-green-500 border-green-500 text-white'
                  : index + 1 === currentStep
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-gray-200 border-gray-300 text-gray-400'
              }`}
            >
              {index + 1 < currentStep ? (
                <Check className="h-5 w-5" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
              
              {index + 1 === currentStep && (
                <motion.div
                  className="absolute inset-0 border-2 border-blue-400 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.div>
            
            <div className="text-center">
              <p className={`text-xs font-medium ${
                index + 1 <= currentStep ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {step.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {Math.round(step.progress)}%
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Connecting Lines */}
      <div className="relative -mt-6">
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200">
          <motion.div
            className="h-full bg-blue-600"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </div>
  );
}