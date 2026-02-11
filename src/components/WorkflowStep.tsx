import { cn } from "@/lib/utils";

interface WorkflowStepProps {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  isLast?: boolean;
}

export const WorkflowStep = ({ step, title, description, icon, isLast = false }: WorkflowStepProps) => {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg">
          {step}
        </div>
        {!isLast && (
          <div className="w-0.5 h-8 bg-primary/30 mt-2" />
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-primary">{icon}</div>
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
};
