import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex flex-col place-items-center justify-center h-full pb-20">
      <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
    </div>
  );
}
