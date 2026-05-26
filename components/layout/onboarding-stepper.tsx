"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  description: string;
}

const steps: Step[] = [
  { id: 1, title: "Kullanıcı Bilgileri", description: "Temel bilgiler" },
  { id: 2, title: "Marka Kimliği", description: "Markanızı tanımlayın" },
  { id: 3, title: "Platformlar", description: "Sosyal medya hesapları" },
  { id: 4, title: "İçerik Tercihleri", description: "Haftalık plan" },
  { id: 5, title: "Özet ve Başlat", description: "Son kontrol" },
];

interface OnboardingStepperProps {
  currentStep: number;
}

export function OnboardingStepper({ currentStep }: OnboardingStepperProps) {
  return (
    <div className="w-full">
      {/* Desktop Stepper */}
      <div className="hidden lg:block">
        <nav aria-label="İlerleme">
          <ol className="flex items-center">
            {steps.map((step, stepIdx) => (
              <li
                key={step.id}
                className={cn(
                  "relative",
                  stepIdx !== steps.length - 1 ? "flex-1" : ""
                )}
              >
                <div className="flex items-center">
                  <div
                    className={cn(
                      "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                      step.id < currentStep
                        ? "border-primary bg-primary text-primary-foreground"
                        : step.id === currentStep
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground"
                    )}
                  >
                    {step.id < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-semibold">{step.id}</span>
                    )}
                  </div>
                  {stepIdx !== steps.length - 1 && (
                    <div
                      className={cn(
                        "ml-4 h-0.5 w-full transition-colors",
                        step.id < currentStep ? "bg-primary" : "bg-border"
                      )}
                    />
                  )}
                </div>
                <div className="mt-2">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      step.id <= currentStep
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Mobile Stepper */}
      <div className="lg:hidden">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            Adım {currentStep} / {steps.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {steps[currentStep - 1]?.title}
          </span>
        </div>
        <div className="flex gap-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                "h-2 flex-1 rounded-full transition-colors",
                step.id <= currentStep ? "bg-primary" : "bg-border"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
