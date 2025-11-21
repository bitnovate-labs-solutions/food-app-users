import { CheckCircle2 } from "lucide-react";

export default function SuccessStep() {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-4 min-h-[60vh]">
      <CheckCircle2 className="w-12 h-12 text-green-500" />
      <h2 className="font-semibold text-primary">Thanks for your feedback!</h2>
      <p className="text-sm text-muted-foreground font-light">
        We appreciate your feedback—it fuels our improvement process.
      </p>
    </div>
  );
}

