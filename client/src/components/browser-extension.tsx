import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BrowserExtension() {
  return (
    <div className="flex items-center justify-center mb-8">
      <a href="/api/extension/download" download>
        <Button className="flex items-center gap-2" variant="outline">
          <Package className="h-4 w-4" />
          <span>Download ProxyWave Extension</span>
          <span className="text-xs text-muted-foreground">.zip</span>
        </Button>
      </a>
    </div>
  );
}
