import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, ImageOff, FileCode, X, Ban, Shield, TargetIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Content filter settings interface
export interface ContentFilterSettings {
  blockImages: boolean;
  blockScripts: boolean;
  blockAds: boolean;
  blockTrackers: boolean;
  blockPopups: boolean;
}

// Default settings
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
  // Create a temporary state for the settings to prevent immediate application
  const [tempSettings, setTempSettings] = React.useState<ContentFilterSettings>(settings);

  // Handle switch changes
  const handleSwitchChange = (setting: keyof ContentFilterSettings) => {
    setTempSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  // Apply settings
  const applySettings = () => {
    onSettingsChange(tempSettings);
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setTempSettings(defaultFilterSettings);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Shield className="h-4 w-4" />
          Content Filter
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <Card className="border-none shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-sm font-medium">Content Filtering Options</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ImageOff className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="block-images" className="text-sm font-normal">
                    Block Images
                  </Label>
                </div>
                <Switch
                  id="block-images"
                  checked={tempSettings.blockImages}
                  onCheckedChange={() => handleSwitchChange("blockImages")}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileCode className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="block-scripts" className="text-sm font-normal">
                    Block Scripts
                  </Label>
                </div>
                <Switch
                  id="block-scripts"
                  checked={tempSettings.blockScripts}
                  onCheckedChange={() => handleSwitchChange("blockScripts")}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Ban className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="block-ads" className="text-sm font-normal">
                    Block Ads
                  </Label>
                </div>
                <Switch
                  id="block-ads"
                  checked={tempSettings.blockAds}
                  onCheckedChange={() => handleSwitchChange("blockAds")}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TargetIcon className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="block-trackers" className="text-sm font-normal">
                    Block Trackers
                  </Label>
                </div>
                <Switch
                  id="block-trackers"
                  checked={tempSettings.blockTrackers}
                  onCheckedChange={() => handleSwitchChange("blockTrackers")}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <X className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="block-popups" className="text-sm font-normal">
                    Block Popups
                  </Label>
                </div>
                <Switch
                  id="block-popups"
                  checked={tempSettings.blockPopups}
                  onCheckedChange={() => handleSwitchChange("blockPopups")}
                />
              </div>
              
              <div className="flex justify-between pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetToDefaults}
                >
                  Reset
                </Button>
                <Button 
                  size="sm"
                  onClick={applySettings}
                >
                  Apply
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}