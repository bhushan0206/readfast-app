import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, User } from 'lucide-react';
import { useAuth } from '../../auth/providers/AuthProvider';
import { getUserReadingStats } from '../../../services/supabase';
import Button from '../../../shared/components/Button';
import ReadingStats from '../../dashboard/components/ReadingStats';
import RecentActivity from '../../dashboard/components/RecentActivity';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      console.log('🔍 Profile: fetchStats called', { userId: user?.id });
      
      if (!user?.id) {
        console.log('🔍 Profile: No user ID, setting loading to false');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Profile: Fetching stats for user:', user.id);
        
        const statsData = await getUserReadingStats(user.id);
        console.log('✅ Profile: Stats fetched:', statsData);
        
        setStats(statsData || {
          avg_wpm: 0,
          max_wpm: 0,
          total_words_read: 0,
          total_time_spent: 0,
          sessions_completed: 0
        });
      } catch (error) {
        console.error('❌ Profile: Error fetching stats:', error);
        setError('Failed to load profile data');
        setStats({
          avg_wpm: 0,
          max_wpm: 0,
          total_words_read: 0,
          total_time_spent: 0,
          sessions_completed: 0
        });
      } finally {
        setLoading(false);
        console.log('✅ Profile: Loading complete');
      }
    };
    
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('⚠️ Profile: Timeout reached, forcing loading to false');
        setLoading(false);
        setError('Profile loading timed out');
      }
    }, 10000); // 10 second timeout
    
    fetchStats();
    
    return () => clearTimeout(timeoutId);
  }, [user?.id]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">My Profile</h1>
        <div className="flex space-x-2">
          <Link to="/settings">
            <Button variant="outline" leftIcon={<Edit size={18} />}>
              Edit Profile
            </Button>
          </Link>
          
          {/* Debug button - remove later */}
          <Button
            variant="outline"
            onClick={async () => {
              console.log('🧪 Profile Debug:', {
                user: user,
                userId: user?.id,
                email: user?.email
              });
              
              if (user?.id) {
                try {
                  const freshStats = await getUserReadingStats(user.id);
                  console.log('🧪 Fresh stats from DB:', freshStats);
                  setStats(freshStats);
                } catch (error) {
                  console.error('🧪 Error fetching fresh stats:', error);
                }
              }
            }}
          >
            Refresh Stats
          </Button>
        </div>
      </div>
      
      {/* Profile Card */}
      <div className="card bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="flex-shrink-0">
            {user?.user_metadata?.avatar_url ? (
              <img 
                src={user.user_metadata.avatar_url} 
                alt={user.user_metadata.full_name || user.email} 
                className="w-24 h-24 rounded-full object-cover border-2 border-primary-100 dark:border-primary-700"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                <User size={36} className="text-primary-600 dark:text-primary-400" />
              </div>
            )}
          </div>
          
          <div className="flex-grow space-y-4 text-center md:text-left">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-300">{user?.email}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 p-4 rounded-lg">
                <p className="text-sm text-primary-700 dark:text-primary-300">Average WPM</p>
                <p className="text-xl font-bold text-primary-900 dark:text-primary-100">{stats?.avg_wpm || 0}</p>
              </div>
              
              <div className="card bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-200 dark:border-secondary-700 p-4 rounded-lg">
                <p className="text-sm text-secondary-700 dark:text-secondary-300">Max WPM</p>
                <p className="text-xl font-bold text-secondary-900 dark:text-secondary-100">
                  {stats?.max_wpm || 0}
                </p>
              </div>
              
              <div className="card bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-700 p-4 rounded-lg">
                <p className="text-sm text-accent-700 dark:text-accent-300">Sessions Completed</p>
                <p className="text-xl font-bold text-accent-900 dark:text-accent-100">{stats?.sessions_completed || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reading Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Reading Statistics</h2>
        <ReadingStats stats={stats} sessions={[]} />
      </div>
      
      {/* Achievement Summary */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Achievements</h2>
          <Link to="/achievements" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium">
            View all
          </Link>
        </div>
        
        <div className="card bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="text-center py-6">
            <p className="text-neutral-600 dark:text-neutral-400">Achievements summary coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;