import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, Lock, Globe } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Privacy settings interface
export interface PrivacySettings {
  incognitoMode: boolean;
  useTor: boolean;
}

// Default settings
export const defaultPrivacySettings: PrivacySettings = {
  incognitoMode: false,
  useTor: false
};

interface PrivacySettingsProps {
  settings: PrivacySettings;
  onSettingsChange: (settings: PrivacySettings) => void;
}

export default function PrivacySettings({ settings, onSettingsChange }: PrivacySettingsProps) {
  // Create a temporary state for the settings to prevent immediate application
  const [tempSettings, setTempSettings] = React.useState<PrivacySettings>(settings);

  // Handle switch changes
  const handleSwitchChange = (setting: keyof PrivacySettings) => {
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
    setTempSettings(defaultPrivacySettings);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          Privacy
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <Card className="border-none shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-sm font-medium">Privacy Options</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="incognito-mode" className="text-sm font-medium">
                      Incognito Mode
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Browse without saving history or cookies
                    </p>
                  </div>
                </div>
                <Switch
                  id="incognito-mode"
                  checked={tempSettings.incognitoMode}
                  onCheckedChange={() => handleSwitchChange("incognitoMode")}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="use-tor" className="text-sm font-medium">
                      Tor Routing
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Route traffic through Tor network for anonymity
                    </p>
                  </div>
                </div>
                <Switch
                  id="use-tor"
                  checked={tempSettings.useTor}
                  onCheckedChange={() => handleSwitchChange("useTor")}
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
