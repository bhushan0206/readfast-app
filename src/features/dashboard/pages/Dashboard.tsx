import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { getReadingSessions, getUserReadingStats } from '../../../services/supabase';
import { BookOpen, TrendingUp, Clock, Award } from 'lucide-react';
import Button from '../../../shared/components/Button';
import RecentActivity from '../components/RecentActivity';
import ReadingStats from '../components/ReadingStats';
import GoalProgress from '../components/GoalProgress';
import AnalyticsSummary from '../components/AnalyticsSummary';
import ReadingAssistant from '../../../shared/components/ReadingAssistant';

const Dashboard: React.FC = () => {
  // Add debug logging
  console.log('🏠 Dashboard component rendered');

  const { user, profile } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;
        
        const [statsData, sessionsData] = await Promise.all([
          getUserReadingStats(user.id),
          getReadingSessions(user.id)
        ]);
        
        setStats(statsData || {
          avg_wpm: 0,
          max_wpm: 0,
          total_words_read: 0,
          total_time_spent: 0,
          sessions_completed: 0
        });
        setSessions(sessionsData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Welcome, {profile?.full_name || 'Reader'}</h1>
          <p className="text-neutral-600 dark:text-neutral-300 mt-1">Track your reading progress and improve your skills</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/library">
            <Button leftIcon={<BookOpen size={18} />}>Start Reading</Button>
          </Link>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">Current Reading Speed</p>
              <h3 className="text-2xl font-bold mt-1 text-neutral-900 dark:text-white">{profile?.reading_speed || 0} WPM</h3>
            </div>
            <div className="bg-primary-100 dark:bg-primary-900/50 p-2 rounded-lg">
              <TrendingUp size={20} className="text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <div className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            {stats?.avg_wpm > 0 && stats?.avg_wpm !== profile?.reading_speed 
              ? `Average: ${stats?.avg_wpm} WPM`
              : 'Start reading to track your speed'
            }
          </div>
        </div>
        
        <div className="card bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">Words Read</p>
              <h3 className="text-2xl font-bold mt-1 text-neutral-900 dark:text-white">{stats?.total_words_read.toLocaleString() || 0}</h3>
            </div>
            <div className="bg-secondary-100 dark:bg-secondary-900/50 p-2 rounded-lg">
              <BookOpen size={20} className="text-secondary-600 dark:text-secondary-400" />
            </div>
          </div>
          <div className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            {stats?.sessions_completed > 0 
              ? `Across ${stats?.sessions_completed} sessions` 
              : 'Start reading to track words'
            }
          </div>
        </div>
        
        <div className="card bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">Time Spent</p>
              <h3 className="text-2xl font-bold mt-1 text-neutral-900 dark:text-white">
                {stats?.total_time_spent 
                  ? Math.floor(stats.total_time_spent / 60)
                  : 0} mins
              </h3>
            </div>
            <div className="bg-accent-100 dark:bg-accent-900/50 p-2 rounded-lg">
              <Clock size={20} className="text-accent-600 dark:text-accent-400" />
            </div>
          </div>
          <div className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            {stats?.sessions_completed > 0 
              ? `Avg ${Math.round((stats.total_time_spent / stats.sessions_completed) / 60)} mins per session` 
              : 'Start reading to track time'
            }
          </div>
        </div>
        
        <div className="card bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">Highest Speed</p>
              <h3 className="text-2xl font-bold mt-1 text-neutral-900 dark:text-white">{stats?.max_wpm || 0} WPM</h3>
            </div>
            <div className="bg-success-100 dark:bg-success-900/50 p-2 rounded-lg">
              <Award size={20} className="text-success-600 dark:text-success-400" />
            </div>
          </div>
          <div className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            {stats?.max_wpm > 0 
              ? `${Math.round((stats.max_wpm / 250) * 100)}% of average reader` 
              : 'Complete readings to track this'
            }
          </div>
        </div>
      </div>
      
      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ReadingStats stats={stats} sessions={sessions} />
        </div>
        <div className="space-y-6">
          <GoalProgress stats={stats} />
          <AnalyticsSummary />
        </div>
      </div>
      
      {/* Recent Activity */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Recent Activity</h2>
          <Link to="/library" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium">
            View all
          </Link>
        </div>
        <RecentActivity sessions={sessions} />
        
        {sessions.length === 0 && (
          <div className="text-center py-8 bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <BookOpen size={36} className="mx-auto text-neutral-400 dark:text-neutral-500 mb-2" />
            <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-200">No reading sessions yet</h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">Start reading to track your progress</p>
            <Link to="/library">
              <Button>Go to Library</Button>
            </Link>
          </div>
        )}
      </div>
      
      {/* Reading Assistant */}
      <ReadingAssistant />
    </div>
  );
};

export default Dashboard;