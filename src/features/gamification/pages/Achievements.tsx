import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAchievementStore } from '../../../store/achievementStore';
import { useAuth } from '../../auth/providers/AuthProvider';
import { Award, BookOpen, TrendingUp, Clock, RefreshCw, Sparkles, Star } from 'lucide-react';
import Button from '../../../shared/components/Button';

const Achievements: React.FC = () => {
  const { achievements, userAchievements, loadAchievements, loading, initialized } = useAchievementStore();
  const { user } = useAuth();
  const [achievementsMap, setAchievementsMap] = useState<{ [key: string]: any }>({});
  
  // Debug logging
  console.log('🔍 Achievements Debug:', {
    user: user?.id,
    achievementsCount: achievements.length,
    userAchievementsCount: userAchievements.length,
    loading,
    initialized
  });
  
  useEffect(() => {
    if (!initialized && user?.id) {
      console.log('🔄 Loading achievements for user:', user.id);
      loadAchievements();
    }
  }, [initialized, loadAchievements, user?.id]);

  // Refresh achievements when component mounts or becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && initialized) {
        loadAchievements();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also refresh on mount if already initialized
    if (initialized) {
      loadAchievements();
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [initialized, loadAchievements]);
  
  useEffect(() => {
    // Create a map of user achievements for easy lookup
    const map: { [key: string]: any } = {};
    userAchievements.forEach(ua => {
      map[ua.achievement_id] = ua;
    });
    setAchievementsMap(map);
  }, [userAchievements]);
  
  if (loading && !initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-neutral-900 dark:via-yellow-900/10 dark:to-red-900/10 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-neutral-900 dark:via-yellow-900/10 dark:to-red-900/10 relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-yellow-200/30 to-orange-200/30 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 80, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-orange-200/30 to-red-200/30 dark:from-orange-900/20 dark:to-red-900/20 rounded-full blur-3xl"
        />
        
        {/* Achievement stars floating */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
              rotate: [0, 360],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              delay: i * 0.8,
            }}
            className="absolute"
            style={{
              left: `${10 + (i * 8)}%`,
              top: `${15 + (i * 7)}%`,
            }}
          >
            <Star size={8 + (i % 4)} className="text-yellow-400/60" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              Achievements
            </h1>
            <p className="text-neutral-600 dark:text-neutral-300 mt-2 text-lg">Track your progress and earn badges</p>
          </div>
          
          {/* Debug refresh button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              leftIcon={<RefreshCw size={18} />}
              onClick={() => {
                console.log('🔄 Manual refresh triggered');
                console.log('🔍 Current user:', user);
                loadAchievements();
              }}
              className="bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm border-white/20 dark:border-neutral-700/50 hover:bg-white/80 dark:hover:bg-neutral-800/80"
            >
              Refresh Data
            </Button>
          </motion.div>
        </motion.div>

        {/* Rest of achievements content can go here within a modern container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-neutral-700/50 shadow-lg p-6 sm:p-8"
        >
          {/* Placeholder for existing achievement display logic */}
          <div className="text-center py-8">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Award size={64} className="mx-auto text-orange-400 mb-4" />
            </motion.div>
            <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
              {achievements.length > 0 ? `${achievements.length} Achievements Available` : 'Loading Achievements...'}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              {userAchievements.length > 0 
                ? `You've unlocked ${userAchievements.length} achievement${userAchievements.length === 1 ? '' : 's'}!`
                : 'Complete reading sessions to unlock achievements'
              }
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Achievements;