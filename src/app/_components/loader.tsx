import { Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";

interface LoaderProps {
  className?: string;
}

export default function Loader({ className }: LoaderProps) {
  return (
    <div className={cn("flex flex-col place-items-center justify-center h-full pb-20", className)}>
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
