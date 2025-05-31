import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, SkipForward, SkipBack, Settings, RotateCcw } from 'lucide-react';
import { getTextById } from '../../../services/supabase';
import { useReadingStore } from '../../../store/readingStore';
import { useAuthStore } from '../../../stores/authStore';
import Button from '../../../shared/components/Button';
import ComprehensionQuiz from '../components/ComprehensionQuiz';
import SpeedControl from '../components/SpeedControl';
import TextDisplayEnhanced from '../components/TextDisplayEnhanced';
import { logger, LogCategory } from '../../../utils/enhancedLogger-clean';
import { ContentSecurity } from '../../../utils/securityMiddleware-clean';
import { errorMonitor } from '../../../utils/errorMonitoring';

const ReadingSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
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
    restartReading,
    isReading,
    progress,
    readingSettings
  } = useReadingStore();

  useEffect(() => {
    const fetchText = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        logger.info(LogCategory.READING, 'Fetching text for reading session', { textId: id });
        
        const textData = await getTextById(id);
        setText(textData);
        setCurrentText(textData);
        
        // Split the text into words with security validation
        const sanitizedContent = ContentSecurity.sanitizeTextInput(textData.content);
        const words = sanitizedContent.split(/\s+/).filter(Boolean);
        setTextWords(words);
        
        logger.info(LogCategory.READING, 'Text loaded successfully', { 
          textId: id, 
          wordCount: words.length,
          title: textData.title 
        });
      } catch (err) {
        logger.error(LogCategory.READING, 'Error fetching text', { textId: id }, err as Error);
        setError('Failed to load the text. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchText();
  }, [id, setCurrentText]);

  const handleStartReading = () => {
    if (id) {
      logger.logUserAction('start_reading', undefined, { textId: id, title: text?.title });
      startReading(id);
    }
  };

  const handleStopReading = async () => {
    try {
      logger.logUserAction('stop_reading', undefined, { 
        textId: id, 
        progress: Math.round(progress),
        wordsRead: Math.floor(textWords.length * (progress / 100))
      });
      
      await stopReading(textWords.length, user?.id);
      setShowComprehension(true);
    } catch (error) {
      errorMonitor.recordError(error as Error, {
        component: 'ReadingSession',
        action: 'stop_reading',
        metadata: { textId: id, progress }
      });
    }
  };

  const handleRestartReading = () => {
    if (id) {
      logger.logUserAction('restart_reading', undefined, { textId: id, previousProgress: progress });
      restartReading();
    }
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
    return <ComprehensionQuiz text={text} onComplete={() => navigate('/', { replace: true })} />;
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
        <TextDisplayEnhanced 
          text={textWords} 
          isReading={isReading} 
          settings={{
            speed: readingSettings.speed,
            fontSize: readingSettings.fontSize,
            mode: readingSettings.mode,
            chunkSize: readingSettings.chunkSize
          }}
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
          
          {/* Restart Button - Always show when not reading and has progress */}
          {!isReading && progress > 0 && (
            <Button
              variant="outline"
              leftIcon={<RotateCcw size={18} />}
              onClick={handleRestartReading}
              className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
            >
              Restart
            </Button>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="danger"
            onClick={handleStopReading}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2"
          >
            Finish Reading
          </Button>
        </div>
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