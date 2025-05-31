import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../auth/providers/AuthProvider';
import { getReadingSessions, getUserReadingStats } from '../../../services/supabase';
import { BookOpen, TrendingUp, Clock, Award, RefreshCw, Sparkles } from 'lucide-react';
import Button from '../../../shared/components/Button';
import RecentActivity from '../components/RecentActivity';
import ReadingStats from '../components/ReadingStats';
import GoalProgress from '../components/GoalProgress';
import AnalyticsSummary from '../components/AnalyticsSummary';
import ReadingAssistant from '../../../shared/components/ReadingAssistant';

const Dashboard: React.FC = () => {
  // Add debug logging
  console.log('🏠 Dashboard component rendered');

  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Debug auth state
  console.log('🔍 Dashboard auth state:', { user: user?.id, email: user?.email });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user?.id) {
          console.log('❌ Dashboard: No user ID available');
          return;
        }
        
        console.log('🔄 Dashboard: Fetching data for user:', user.id);
        
        const [statsData, sessionsData] = await Promise.all([
          getUserReadingStats(user.id),
          getReadingSessions(user.id)
        ]);
        
        console.log('✅ Dashboard: Stats data:', statsData);
        console.log('✅ Dashboard: Sessions data:', sessionsData?.length || 0);
        
        setStats(statsData || {
          avg_wpm: 0,
          max_wpm: 0,
          total_words_read: 0,
          total_time_spent: 0,
          sessions_completed: 0
        });
        setSessions(sessionsData || []);
      } catch (error) {
        console.error('❌ Dashboard: Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user?.id]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-neutral-900 dark:via-slate-800 dark:to-neutral-900 relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-r from-blue-200/30 to-purple-200/30 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 80, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-purple-200/30 to-pink-200/30 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 space-y-8 p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Reader'}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-300 mt-2 text-lg">Track your reading progress and improve your skills</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            {/* Debug refresh button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                leftIcon={<RefreshCw size={18} />}
                onClick={async () => {
                  console.log('🔄 Manual dashboard refresh triggered');
                  setLoading(true);
                  try {
                    if (user?.id) {
                      const [statsData, sessionsData] = await Promise.all([
                        getUserReadingStats(user.id),
                        getReadingSessions(user.id)
                      ]);
                      console.log('🔄 Refreshed stats:', statsData);
                      console.log('🔄 Refreshed sessions:', sessionsData?.length || 0);
                      setStats(statsData);
                      setSessions(sessionsData || []);
                    }
                  } catch (error) {
                    console.error('❌ Refresh error:', error);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm border-white/20 dark:border-neutral-700/50 hover:bg-white/80 dark:hover:bg-neutral-800/80"
              >
                Refresh Data
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/library">
                <Button 
                  leftIcon={<BookOpen size={18} />}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                >
                  Start Reading
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Stats Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {[
            {
              title: 'Current Reading Speed',
              value: `${stats?.avg_wpm || 0}`,
              unit: 'WPM',
              subtitle: stats?.max_wpm > 0 && stats?.max_wpm !== stats?.avg_wpm 
                ? `Max: ${stats?.max_wpm} WPM`
                : 'Start reading to track your speed',
              icon: TrendingUp,
              gradient: 'from-blue-500 to-blue-600',
              bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20'
            },
            {
              title: 'Words Read',
              value: stats?.total_words_read?.toLocaleString() || '0',
              unit: '',
              subtitle: stats?.sessions_completed > 0 
                ? `Across ${stats?.sessions_completed} sessions` 
                : 'Start reading to track words',
              icon: BookOpen,
              gradient: 'from-green-500 to-emerald-600',
              bgGradient: 'from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20'
            },
            {
              title: 'Time Spent',
              value: stats?.total_time_spent 
                ? Math.floor(stats.total_time_spent / 60).toString()
                : '0',
              unit: 'mins',
              subtitle: stats?.sessions_completed > 0 
                ? `Avg ${Math.round((stats.total_time_spent / stats.sessions_completed) / 60)} mins per session` 
                : 'Start reading to track time',
              icon: Clock,
              gradient: 'from-purple-500 to-purple-600',
              bgGradient: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20'
            },
            {
              title: 'Highest Speed',
              value: `${stats?.max_wpm || 0}`,
              unit: 'WPM',
              subtitle: stats?.max_wpm > 0 
                ? `${Math.round((stats.max_wpm / 250) * 100)}% of average reader` 
                : 'Complete readings to track this',
              icon: Award,
              gradient: 'from-orange-500 to-red-500',
              bgGradient: 'from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-800/20'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`bg-gradient-to-br ${stat.bgGradient} backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-neutral-700/50 shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">{stat.title}</p>
                  <div className="flex items-baseline space-x-1">
                    <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">{stat.value}</h3>
                    {stat.unit && <span className="text-lg font-semibold text-neutral-500 dark:text-neutral-400">{stat.unit}</span>}
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} shadow-lg`}>
                  <stat.icon size={24} className="text-white" />
                </div>
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {stat.subtitle}
              </div>
              
              {/* Sparkle effect for achievements */}
              {(stat.title.includes('Highest') && stats?.max_wpm > 300) && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute top-2 right-2"
                >
                  <Sparkles size={16} className="text-yellow-400" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      
      {/* Charts and Activity */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2">
          <div className="bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-neutral-700/50 shadow-lg">
            <ReadingStats stats={stats} sessions={sessions} />
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-neutral-700/50 shadow-lg overflow-hidden">
            <GoalProgress stats={stats} />
          </div>
          <div className="bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-neutral-700/50 shadow-lg">
            <AnalyticsSummary />
          </div>
        </div>
      </motion.div>
      
      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Recent Activity</h2>
          <Link to="/library" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium hover:underline transition-colors">
            View all
          </Link>
        </div>
        
        <div className="bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-neutral-700/50 shadow-lg">
          <RecentActivity sessions={sessions} />
        </div>
        
        {sessions.length === 0 && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-neutral-700/50 shadow-lg"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <BookOpen size={48} className="mx-auto text-neutral-400 dark:text-neutral-500 mb-4" />
            </motion.div>
            <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 mb-2">No reading sessions yet</h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">Start reading to track your progress and unlock achievements</p>
            <Link to="/library">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                Go to Library
              </Button>
            </Link>
          </motion.div>
        )}
      </motion.div>
      
      {/* Reading Assistant */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-neutral-700/50 shadow-lg"
      >
        <ReadingAssistant />
      </motion.div>
    </div>
    </div>
  );
};

export default Dashboard;