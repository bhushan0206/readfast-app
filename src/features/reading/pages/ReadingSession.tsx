import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, SkipForward, SkipBack, Settings, RotateCcw } from 'lucide-react';
import { getTextById } from '../../../services/supabase';
import { useReadingStore } from '../../../store/readingStore';
import { useAuth } from '../../auth/providers/AuthProvider';
import Button from '../../../shared/components/Button';
import ComprehensionQuiz from '../components/ComprehensionQuiz';
import SpeedControl from '../components/SpeedControl';
import TextDisplayEnhanced from '../components/TextDisplayEnhanced';
import { logger, LogCategory } from '../../../utils/enhancedLogger-clean';
import { ContentSecurity } from '../../../utils/securityMiddleware-clean';
import { errorMonitor } from '../../../utils/errorMonitoring';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Zap } from 'lucide-react';

const ReadingSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
    updateProgress,
    isReading,
    progress,
    currentSession,
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
      console.log('🚀 Starting reading session:', { textId: id, wordCount: textWords.length });
      logger.logUserAction('start_reading', undefined, { textId: id, title: text?.title });
      startReading(id);
      console.log('✅ startReading called, current session should be initialized');
      
      // Simulate some progress for testing - remove this later
      setTimeout(() => {
        updateProgress(Math.floor(textWords.length * 0.5), textWords.length);
        console.log('🧪 Test: Set progress to 50%');
      }, 2000);
    }
  };

  const handleStopReading = async () => {
    try {
      console.log('🛑 Stopping reading session...');
      console.log('📊 Current state:', { 
        textWordsLength: textWords.length, 
        progress, 
        userId: user?.id,
        userEmail: user?.email,
        userObject: user,
        currentSession 
      });
      
      logger.logUserAction('stop_reading', undefined, { 
        textId: id, 
        progress: Math.round(progress),
        wordsRead: Math.floor(textWords.length * (progress / 100))
      });
      
      await stopReading(textWords.length, user?.id);
      setShowComprehension(true);
    } catch (error) {
      console.error('❌ Error stopping reading:', error);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-neutral-900 dark:via-indigo-900/10 dark:to-purple-900/10 relative">
      {/* Reading Focus Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-200/40 to-purple-200/40 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header with improved styling */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <BookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {text.title}
            </h1>
          </div>
          {!isReading && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-neutral-600 dark:text-neutral-300 text-lg"
            >
              <Zap className="inline w-5 h-5 mr-2 text-yellow-500" />
              {textWords.length} words · Estimated time: {Math.ceil(textWords.length / readingSettings.speed)} minutes
            </motion.p>
          )}
        </motion.div>
        
        {/* Enhanced Progress Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-neutral-700/50 shadow-lg p-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Reading Progress</span>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            {isReading && (
              <div className="mt-3 text-sm text-neutral-500 dark:text-neutral-400 text-center">
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Remaining: ~{Math.ceil((textWords.length - (textWords.length * (progress / 100))) / readingSettings.speed)} min
                </motion.span>
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Enhanced Text Display Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/70 dark:bg-neutral-800/70 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-neutral-700/50 shadow-2xl mb-8 overflow-hidden"
        >
          <div className="p-8 sm:p-12">
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
        </motion.div>
        
        {/* Enhanced Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-neutral-700/50 shadow-lg p-6"
        >
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                leftIcon={<Settings size={18} />}
                onClick={() => setShowSettings(!showSettings)}
              >
                Settings
              </Button>
              
              {/* Debug button - remove later */}
              <Button
                variant="outline"
                onClick={() => {
                  console.log('🧪 Debug Auth State:', {
                    user: user,
                    userId: user?.id,
                    email: user?.email,
                    profile: user?.user_metadata
                  });
                  console.log('🧪 Raw user object:', JSON.stringify(user, null, 2));
                }}
              >
                Debug Auth
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
        </motion.div>
        
        {/* Enhanced Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-8 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-neutral-700/50 shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  Reading Settings
                </h3>
                <SpeedControl />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReadingSession;