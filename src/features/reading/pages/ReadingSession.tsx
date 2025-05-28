import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, SkipForward, SkipBack, Settings } from 'lucide-react';
import { getTextById } from '../../../services/supabase';
import { useReadingStore } from '../../../store/readingStore';
import Button from '../../../shared/components/Button';
import ComprehensionQuiz from '../components/ComprehensionQuiz';
import SpeedControl from '../components/SpeedControl';
import TextDisplay from '../components/TextDisplay';

const ReadingSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [showSettings, setShowSettings] = useState(false);
  const [showComprehension, setShowComprehension] = useState(false);
  const [text, setText] = useState<any>(null);
  const [textWords, setTextWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    setCurrentText,
    startReading,
    pauseReading,
    resumeReading, 
    stopReading,
    isReading,
    progress,
    readingSettings
  } = useReadingStore();

  useEffect(() => {
    const fetchText = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const textData = await getTextById(id);
        setText(textData);
        setCurrentText(textData);
        
        // Split the text into words
        const words = textData.content.split(/\s+/).filter(Boolean);
        setTextWords(words);
      } catch (err) {
        console.error('Error fetching text:', err);
        setError('Failed to load the text. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchText();
  }, [id, setCurrentText]);

  const handleStartReading = () => {
    if (id) {
      startReading(id);
    }
  };

  const handleStopReading = async () => {
    await stopReading(textWords.length);
    setShowComprehension(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !text) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Error</h2>
        <p className="text-neutral-600 mb-6">{error || 'Text not found'}</p>
        <Button onClick={() => navigate('/library')}>Back to Library</Button>
      </div>
    );
  }

  if (showComprehension) {
    return <ComprehensionQuiz text={text} onComplete={() => navigate('/dashboard')} />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{text.title}</h1>
        {!isReading && (
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            {textWords.length} words · Estimated time: {Math.ceil(textWords.length / readingSettings.speed)} minutes
          </p>
        )}
      </div>
      
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="progress-bar">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          <span>{Math.round(progress)}% complete</span>
          {isReading && (
            <span>
              Remaining: ~{Math.ceil((textWords.length - (textWords.length * (progress / 100))) / readingSettings.speed)} min
            </span>
          )}
        </div>
      </div>
      
      {/* Text Display */}
      <div className="card mb-6 reading-container">
        <TextDisplay 
          text={textWords} 
          isReading={isReading} 
          settings={readingSettings}
        />
      </div>
      
      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-6 space-y-4 md:space-y-0">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            leftIcon={<Settings size={18} />}
            onClick={() => setShowSettings(!showSettings)}
          >
            Settings
          </Button>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            leftIcon={<SkipBack size={18} />}
            disabled={!isReading}
          >
            Back 10 words
          </Button>
          
          {isReading ? (
            <Button
              variant="primary"
              leftIcon={<Pause size={18} />}
              onClick={pauseReading}
            >
              Pause
            </Button>
          ) : (
            <Button
              variant="primary"
              leftIcon={<Play size={18} />}
              onClick={progress > 0 ? resumeReading : handleStartReading}
            >
              {progress > 0 ? 'Resume' : 'Start Reading'}
            </Button>
          )}
          
          <Button
            variant="outline"
            leftIcon={<SkipForward size={18} />}
            disabled={!isReading}
          >
            Skip 10 words
          </Button>
        </div>
        
        <Button
          variant="danger"
          onClick={handleStopReading}
        >
          Finish
        </Button>
      </div>
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-8 card">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Reading Settings</h3>
          <SpeedControl />
        </div>
      )}
    </div>
  );
};

export default ReadingSession;