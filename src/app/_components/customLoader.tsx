import { Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";

interface CustomLoaderProps {
  className?: string;
}

export default function CustomLoader({ className }: CustomLoaderProps) {
  return (
    <div className={cn("flex flex-col place-items-center justify-center h-full pb-20", className)}>
      <Loader2 className="h-8 w-8 animate-spin text-foreground/80 dark:text-muted-background" />
    </div>
  );
}
