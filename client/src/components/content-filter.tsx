import { useState } from "react";
import { 
  Shield, 
  ImageOff, 
  FileCode, 
  AlertCircle,
  Code,
  ExternalLink
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

export interface ContentFilterSettings {
  blockImages: boolean;
  blockScripts: boolean;
  blockAds: boolean;
  blockTrackers: boolean;
  blockPopups: boolean;
}

export const defaultFilterSettings: ContentFilterSettings = {
  blockImages: false,
  blockScripts: false,
  blockAds: true,
  blockTrackers: true,
  blockPopups: true
};

interface ContentFilterProps {
  settings: ContentFilterSettings;
  onSettingsChange: (settings: ContentFilterSettings) => void;
}

export default function ContentFilter({ settings, onSettingsChange }: ContentFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSettingChange = (key: keyof ContentFilterSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    onSettingsChange(newSettings);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-primary mr-2" />
            <h3 className="text-lg font-medium">Content Filtering</h3>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isOpen ? "Hide options" : "Show options"}
            </Button>
          </CollapsibleTrigger>
        </div>
        
        {!isOpen && (
          <div className="text-sm text-muted-foreground">
            {Object.entries(settings).filter(([, value]) => value).length} filters enabled
          </div>
        )}
        
        <CollapsibleContent className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="block-images" 
                checked={settings.blockImages}
                onCheckedChange={(checked) => handleSettingChange('blockImages', checked)}
              />
              <Label htmlFor="block-images" className="flex items-center">
                <ImageOff className="h-4 w-4 mr-2" />
                Block Images
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertCircle className="h-3.5 w-3.5 ml-1 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">
                        Blocks all images from loading. This may break the layout of some websites but helps save bandwidth.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="block-scripts" 
                checked={settings.blockScripts}
                onCheckedChange={(checked) => handleSettingChange('blockScripts', checked)}
              />
              <Label htmlFor="block-scripts" className="flex items-center">
                <Code className="h-4 w-4 mr-2" />
                Block Scripts
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertCircle className="h-3.5 w-3.5 ml-1 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">
                        Blocks all JavaScript from running. This may break website functionality but enhances privacy.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="block-ads" 
                checked={settings.blockAds}
                onCheckedChange={(checked) => handleSettingChange('blockAds', checked)}
              />
              <Label htmlFor="block-ads" className="flex items-center">
                <ExternalLink className="h-4 w-4 mr-2" />
                Block Ads
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertCircle className="h-3.5 w-3.5 ml-1 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">
                        Blocks common ad scripts and networks. Makes browsing faster and cleaner.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="block-trackers" 
                checked={settings.blockTrackers}
                onCheckedChange={(checked) => handleSettingChange('blockTrackers', checked)}
              />
              <Label htmlFor="block-trackers" className="flex items-center">
                <FileCode className="h-4 w-4 mr-2" />
                Block Trackers
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertCircle className="h-3.5 w-3.5 ml-1 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">
                        Blocks tracking scripts that monitor your browsing behavior.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="block-popups" 
                checked={settings.blockPopups}
                onCheckedChange={(checked) => handleSettingChange('blockPopups', checked)}
              />
              <Label htmlFor="block-popups" className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Block Popups
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertCircle className="h-3.5 w-3.5 ml-1 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">
                        Blocks popup windows and modal dialogs.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              More aggressive filtering may cause some websites to break.
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onSettingsChange(defaultFilterSettings)}
            >
              Reset to defaults
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}