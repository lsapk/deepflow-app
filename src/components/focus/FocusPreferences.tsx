
import React from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Volume2 } from 'lucide-react';

interface FocusPreferencesProps {
  playSound: boolean;
  setPlaySound: (value: boolean) => void;
  showNotification: boolean;
  setShowNotification: (value: boolean) => void;
  volume: number;
  setVolume: (value: number) => void;
  handleSavePreferences: () => void;
}

export const FocusPreferences: React.FC<FocusPreferencesProps> = ({
  playSound,
  setPlaySound,
  showNotification,
  setShowNotification,
  volume,
  setVolume,
  handleSavePreferences,
}) => {
  return (
    <>
      <CardHeader>
        <CardTitle>Préférences</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sound">Sons</Label>
              <p className="text-xs text-muted-foreground">
                Jouer un son à la fin de la session
              </p>
            </div>
            <Switch 
              id="sound"
              checked={playSound}
              onCheckedChange={setPlaySound}
            />
          </div>
          
          {playSound && (
            <div className="space-y-2">
              <Label htmlFor="volume">Volume</Label>
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                <Slider
                  id="volume"
                  defaultValue={[volume]}
                  max={100}
                  step={1}
                  onValueChange={(value) => setVolume(value[0])}
                />
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Recevoir une notification à la fin de la session
              </p>
            </div>
            <Switch 
              id="notifications"
              checked={showNotification}
              onCheckedChange={setShowNotification}
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-2"
            onClick={handleSavePreferences}
          >
            Enregistrer les préférences
          </Button>
        </div>
      </CardContent>
    </>
  );
};
