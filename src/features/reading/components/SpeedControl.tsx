import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { useReadingStore } from '../../../store/readingStore';
import Button from '../../../shared/components/Button';

const SpeedControl: React.FC = () => {
  const { readingSettings, updateSettings } = useReadingStore();

  const speedLevels = [
    { name: 'Slow', wpm: 150 },
    { name: 'Normal', wpm: 250 },
    { name: 'Fast', wpm: 350 },
    { name: 'Very Fast', wpm: 450 },
    { name: 'Speed Reader', wpm: 600 }
  ];

  const fontSizes = [
    { name: 'Small', size: 16 },
    { name: 'Medium', size: 20 },
    { name: 'Large', size: 24 },
    { name: 'Extra Large', size: 28 }
  ];

  const increaseSpeed = () => {
    updateSettings({ speed: readingSettings.speed + 25 });
  };

  const decreaseSpeed = () => {
    if (readingSettings.speed > 50) {
      updateSettings({ speed: readingSettings.speed - 25 });
    }
  };

  const increaseFontSize = () => {
    updateSettings({ fontSize: readingSettings.fontSize + 2 });
  };

  const decreaseFontSize = () => {
    if (readingSettings.fontSize > 12) {
      updateSettings({ fontSize: readingSettings.fontSize - 2 });
    }
  };

  const toggleMode = () => {
    updateSettings({ 
      mode: readingSettings.mode === 'word' ? 'chunk' : 'word'
    });
  };

  const adjustChunkSize = (size: number) => {
    updateSettings({ chunkSize: size });
  };

  return (
    <div className="space-y-6">
      {/* Reading Speed */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-neutral-900 dark:text-white">Reading Speed: {readingSettings.speed} WPM</h4>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={decreaseSpeed}
              leftIcon={<Minus size={16} />}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={increaseSpeed}
              leftIcon={<Plus size={16} />}
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          {speedLevels.map((level) => (
            <Button
              key={level.name}
              size="sm"
              variant={readingSettings.speed === level.wpm ? "primary" : "outline"}
              onClick={() => updateSettings({ speed: level.wpm })}
            >
              {level.name}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Font Size */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-neutral-900 dark:text-white">Font Size: {readingSettings.fontSize}px</h4>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={decreaseFontSize}
              leftIcon={<Minus size={16} />}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={increaseFontSize}
              leftIcon={<Plus size={16} />}
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          {fontSizes.map((font) => (
            <Button
              key={font.name}
              size="sm"
              variant={readingSettings.fontSize === font.size ? "primary" : "outline"}
              onClick={() => updateSettings({ fontSize: font.size })}
            >
              {font.name}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Reading Mode */}
      <div className="space-y-2">
        <h4 className="font-medium text-neutral-900 dark:text-white">Reading Mode</h4>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={readingSettings.mode === 'word' ? "primary" : "outline"}
            onClick={() => updateSettings({ mode: 'word' })}
          >
            Word by Word
          </Button>
          <Button
            size="sm"
            variant={readingSettings.mode === 'chunk' ? "primary" : "outline"}
            onClick={() => updateSettings({ mode: 'chunk' })}
          >
            Chunk Mode
          </Button>
        </div>
      </div>
      
      {/* Chunk Size (only if chunk mode is selected) */}
      {readingSettings.mode === 'chunk' && (
        <div className="space-y-2">
          <h4 className="font-medium text-neutral-900 dark:text-white">Chunk Size: {readingSettings.chunkSize} words</h4>
          <div className="flex space-x-2">
            {[2, 3, 4, 5].map((size) => (
              <Button
                key={size}
                size="sm"
                variant={readingSettings.chunkSize === size ? "primary" : "outline"}
                onClick={() => adjustChunkSize(size)}
              >
                {size} words
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeedControl;