import { MessageSquare } from "lucide-react";

export default function LoadingState() {
  return (
    <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center">
        <MessageSquare className="h-12 w-12 text-primary mx-auto animate-pulse" />
        <p className="mt-4 text-gray-600">Loading conversations...</p>
      </div>
    </div>
  );
}
